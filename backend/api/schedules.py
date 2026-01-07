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
    from datetime import datetime, time

    # 時刻文字列をTimeオブジェクトに変換
    start_time = None
    end_time = None
    if data.start_time:
        try:
            start_time = datetime.strptime(data.start_time, "%H:%M").time()
        except ValueError:
            pass
    if data.end_time:
        try:
            end_time = datetime.strptime(data.end_time, "%H:%M").time()
        except ValueError:
            pass

    schedule = Schedule(
        title=data.title,
        schedule_type=data.schedule_type,
        date=data.date,
        start_time=start_time,
        end_time=end_time,
        all_day=data.all_day,
        location=data.location,
        client_id=data.client_id,
        project_id=data.project_id,
        employee_id=data.employee_id,
        description=data.description,
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return {"message": "スケジュールが登録されました", "schedule_id": schedule.id}


@router.put("/{schedule_id}")
async def update_schedule(schedule_id: int, data: ScheduleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from datetime import datetime

    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="スケジュールが見つかりません")

    # 時刻文字列をTimeオブジェクトに変換
    start_time = None
    end_time = None
    if data.start_time:
        try:
            start_time = datetime.strptime(data.start_time, "%H:%M").time()
        except ValueError:
            pass
    if data.end_time:
        try:
            end_time = datetime.strptime(data.end_time, "%H:%M").time()
        except ValueError:
            pass

    schedule.title = data.title
    schedule.schedule_type = data.schedule_type
    schedule.date = data.date
    schedule.start_time = start_time
    schedule.end_time = end_time
    schedule.all_day = data.all_day
    schedule.location = data.location
    schedule.client_id = data.client_id
    schedule.project_id = data.project_id
    schedule.employee_id = data.employee_id
    schedule.description = data.description

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
