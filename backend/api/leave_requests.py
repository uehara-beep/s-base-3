from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal
from database import get_db
from models.leave_request import LeaveRequest
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class LeaveRequestCreate(BaseModel):
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    days: float = 1
    reason: Optional[str] = None


@router.get("/")
async def get_leave_requests(
    employee_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(LeaveRequest)
    if employee_id:
        query = query.filter(LeaveRequest.employee_id == employee_id)
    if status:
        query = query.filter(LeaveRequest.status == status)
    return query.order_by(LeaveRequest.start_date.desc()).all()


@router.get("/{request_id}")
async def get_leave_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    request = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="休暇申請が見つかりません")
    return request


@router.post("/")
async def create_leave_request(data: LeaveRequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    request = LeaveRequest(
        employee_id=data.employee_id,
        leave_type=data.leave_type,
        start_date=data.start_date,
        end_date=data.end_date,
        days=Decimal(str(data.days)),
        reason=data.reason
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return {"message": "休暇申請が作成されました", "request_id": request.id}


@router.put("/{request_id}/approve")
async def approve_leave_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    request = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="休暇申請が見つかりません")
    request.status = "approved"
    request.approved_by = current_user.id
    request.approved_at = datetime.utcnow()
    db.commit()
    return {"message": "休暇申請が承認されました"}


@router.put("/{request_id}/reject")
async def reject_leave_request(request_id: int, reason: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    request = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="休暇申請が見つかりません")
    request.status = "rejected"
    request.rejection_reason = reason
    db.commit()
    return {"message": "休暇申請が却下されました"}
