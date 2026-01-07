from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey
from datetime import datetime
from database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, index=True)
    invoice_type = Column(String(20), nullable=False)  # receivable (売上), payable (仕入)
    invoice_date = Column(Date, nullable=False)
    due_date = Column(Date)
    client_id = Column(Integer, ForeignKey("clients.id"))
    partner_id = Column(Integer, ForeignKey("partners.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    subject = Column(String(200))
    subtotal = Column(Numeric(14, 2), default=0)
    tax_rate = Column(Numeric(5, 2), default=10)
    tax_amount = Column(Numeric(14, 2), default=0)
    total_amount = Column(Numeric(14, 2), default=0)
    paid_amount = Column(Numeric(14, 2), default=0)
    status = Column(String(20), default="draft")  # draft, sent, partial, paid, overdue
    file_path = Column(String(500))  # PDF等
    ocr_data = Column(Text)  # OCR結果（請求書AI用）
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
