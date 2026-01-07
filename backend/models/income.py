from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey
from datetime import datetime
from database import Base

class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    income_date = Column(Date, nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"))
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    amount = Column(Numeric(14, 2), nullable=False)
    payment_method = Column(String(50))  # 振込, 現金, 手形, etc.
    bank_account = Column(String(200))
    reference_number = Column(String(100))
    description = Column(String(500))
    status = Column(String(20), default="expected")  # expected, received, cancelled
    expected_date = Column(Date)  # 入金予定日
    received_at = Column(DateTime)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
