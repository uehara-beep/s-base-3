from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey
from datetime import datetime
from database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_date = Column(Date, nullable=False)
    partner_id = Column(Integer, ForeignKey("partners.id"))
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    amount = Column(Numeric(14, 2), nullable=False)
    payment_method = Column(String(50))  # 振込, 現金, 手形, etc.
    bank_account = Column(String(200))
    reference_number = Column(String(100))  # 振込番号等
    description = Column(String(500))
    status = Column(String(20), default="scheduled")  # scheduled, completed, cancelled
    scheduled_date = Column(Date)  # 予定日
    completed_at = Column(DateTime)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
