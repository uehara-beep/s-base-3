from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    quote_number = Column(String(50), unique=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    project_name = Column(String(200), nullable=False)
    site_name = Column(String(200))
    site_address = Column(String(500))
    quote_date = Column(Date)
    valid_until = Column(Date)
    subtotal = Column(Numeric(14, 2), default=0)
    tax_rate = Column(Numeric(5, 2), default=10)
    tax_amount = Column(Numeric(14, 2), default=0)
    total_amount = Column(Numeric(14, 2), default=0)
    cost_amount = Column(Numeric(14, 2), default=0)  # 原価
    profit_amount = Column(Numeric(14, 2), default=0)  # 粗利
    profit_rate = Column(Numeric(5, 2), default=0)  # 粗利率
    status = Column(String(20), default="draft")  # draft, submitted, approved, rejected, ordered
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("Client", back_populates="quotes")
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")
    project = relationship("Project", back_populates="quote", uselist=False)


class QuoteItem(Base):
    __tablename__ = "quote_items"

    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False)
    item_order = Column(Integer, default=0)
    category = Column(String(100))
    description = Column(String(500), nullable=False)
    specification = Column(String(200))
    quantity = Column(Numeric(10, 2), default=1)
    unit = Column(String(20))
    unit_price = Column(Numeric(12, 2), default=0)
    amount = Column(Numeric(14, 2), default=0)
    cost_price = Column(Numeric(12, 2), default=0)  # 原価単価
    cost_amount = Column(Numeric(14, 2), default=0)  # 原価金額
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    quote = relationship("Quote", back_populates="items")
