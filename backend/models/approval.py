from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from datetime import datetime
from database import Base

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    approval_type = Column(String(50), nullable=False)  # expense, leave, quote, daily_report
    target_id = Column(Integer, nullable=False)  # 対象のID
    target_table = Column(String(50), nullable=False)  # テーブル名
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(20), default="pending")  # pending, approved, rejected
    requested_at = Column(DateTime, default=datetime.utcnow)
    decided_at = Column(DateTime)
    comments = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
