from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date
from database import get_db
from models.safety_record import SafetyRecord
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class SafetyRecordCreate(BaseModel):
    record_type: str
    record_date: date
    project_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    severity: Optional[str] = None
    action_taken: Optional[str] = None
    follow_up_required: bool = False


@router.get("/")
async def get_safety_records(
    record_type: Optional[str] = None,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(SafetyRecord)
    if record_type:
        query = query.filter(SafetyRecord.record_type == record_type)
    if project_id:
        query = query.filter(SafetyRecord.project_id == project_id)
    return query.order_by(SafetyRecord.record_date.desc()).all()


@router.get("/{record_id}")
async def get_safety_record(record_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(SafetyRecord).filter(SafetyRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="安全記録が見つかりません")
    return record


@router.post("/")
async def create_safety_record(data: SafetyRecordCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = SafetyRecord(**data.dict(), reported_by=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"message": "安全記録が登録されました", "record_id": record.id}


@router.delete("/{record_id}")
async def delete_safety_record(record_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(SafetyRecord).filter(SafetyRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="安全記録が見つかりません")
    db.delete(record)
    db.commit()
    return {"message": "安全記録が削除されました"}
