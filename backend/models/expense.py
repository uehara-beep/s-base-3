from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey
from datetime import datetime
from database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    expense_date = Column(Date, nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    category = Column(String(50), nullable=False)  # 交通費, 消耗品, 接待費, etc.
    description = Column(String(500), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_method = Column(String(50))  # 現金, クレジット, etc.
    receipt_image = Column(String(500))  # ファイルパス
    ocr_data = Column(Text)  # OCR結果JSON
    status = Column(String(20), default="draft")  # draft, submitted, approved, rejected
    submitted_at = Column(DateTime)
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
