from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    leave_type = Column(String(50), nullable=False)  # 有給, 代休, 特別休暇, 欠勤
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    days = Column(Numeric(4, 1), default=1)  # 0.5日単位
    reason = Column(Text)
    status = Column(String(20), default="pending")  # pending, approved, rejected, cancelled
    submitted_at = Column(DateTime, default=datetime.utcnow)
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime)
    rejection_reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee = relationship("Employee", back_populates="leave_requests")
