from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String(20), unique=True, index=True)
    name = Column(String(100), nullable=False)
    name_kana = Column(String(100))
    department = Column(String(50))
    position = Column(String(50))
    phone = Column(String(20))
    email = Column(String(100))
    hire_date = Column(Date)
    birth_date = Column(Date)
    hourly_rate = Column(Numeric(10, 2), default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="employee", uselist=False)
    daily_reports = relationship("DailyReport", back_populates="employee")
    leave_requests = relationship("LeaveRequest", back_populates="employee")
