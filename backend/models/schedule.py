from sqlalchemy import Column, Integer, String, Date, DateTime, Time, Text, ForeignKey, Boolean
from datetime import datetime
from database import Base

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    schedule_type = Column(String(50))  # 訪問, 打合せ, 現調, etc.
    date = Column(Date, nullable=False)
    start_time = Column(Time)
    end_time = Column(Time)
    all_day = Column(Boolean, default=False)
    location = Column(String(500))
    client_id = Column(Integer, ForeignKey("clients.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    description = Column(Text)
    status = Column(String(20), default="scheduled")  # scheduled, completed, cancelled
    reminder = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
