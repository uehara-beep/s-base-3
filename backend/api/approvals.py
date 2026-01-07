from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from database import get_db
from models.approval import Approval
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class ApprovalCreate(BaseModel):
    approval_type: str
    target_id: int
    target_table: str


@router.get("/")
async def get_approvals(
    approval_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Approval)
    if approval_type:
        query = query.filter(Approval.approval_type == approval_type)
    if status:
        query = query.filter(Approval.status == status)
    return query.order_by(Approval.requested_at.desc()).all()


@router.get("/pending")
async def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Approval).filter(Approval.status == "pending").order_by(Approval.requested_at.desc()).all()


@router.post("/")
async def create_approval(data: ApprovalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    approval = Approval(
        approval_type=data.approval_type,
        target_id=data.target_id,
        target_table=data.target_table,
        requester_id=current_user.id
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    return {"message": "承認申請が作成されました", "approval_id": approval.id}


@router.put("/{approval_id}/approve")
async def approve(approval_id: int, comments: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="承認申請が見つかりません")
    approval.status = "approved"
    approval.approver_id = current_user.id
    approval.decided_at = datetime.utcnow()
    approval.comments = comments
    db.commit()
    return {"message": "承認されました"}


@router.put("/{approval_id}/reject")
async def reject(approval_id: int, comments: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="承認申請が見つかりません")
    approval.status = "rejected"
    approval.approver_id = current_user.id
    approval.decided_at = datetime.utcnow()
    approval.comments = comments
    db.commit()
    return {"message": "却下されました"}
