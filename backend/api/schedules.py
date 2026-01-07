from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date
from database import get_db
from models.schedule import Schedule
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class ScheduleCreate(BaseModel):
    title: str
    schedule_type: Optional[str] = None
    date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    all_day: bool = False
    location: Optional[str] = None
    client_id: Optional[int] = None
    project_id: Optional[int] = None
    employee_id: Optional[int] = None
    description: Optional[str] = None


@router.get("/")
async def get_schedules(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Schedule)
    if start_date:
        query = query.filter(Schedule.date >= start_date)
    if end_date:
        query = query.filter(Schedule.date <= end_date)
    if employee_id:
        query = query.filter(Schedule.employee_id == employee_id)
    return query.order_by(Schedule.date, Schedule.start_time).all()


@router.get("/{schedule_id}")
async def get_schedule(schedule_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="スケジュールが見つかりません")
    return schedule


@router.post("/")
async def create_schedule(data: ScheduleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schedule = Schedule(**data.dict())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return {"message": "スケジュールが登録されました", "schedule_id": schedule.id}


@router.put("/{schedule_id}")
async def update_schedule(schedule_id: int, data: ScheduleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="スケジュールが見つかりません")
    for key, value in data.dict().items():
        setattr(schedule, key, value)
    db.commit()
    return {"message": "スケジュールが更新されました"}


@router.delete("/{schedule_id}")
async def delete_schedule(schedule_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="スケジュールが見つかりません")
    db.delete(schedule)
    db.commit()
    return {"message": "スケジュールが削除されました"}
