from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, Boolean
from datetime import datetime
from database import Base

class PriceMaster(Base):
    __tablename__ = "price_master"

    id = Column(Integer, primary_key=True, index=True)
    item_code = Column(String(50), index=True)
    category = Column(String(100))  # 労務費, 材料費, 経費, etc.
    name = Column(String(200), nullable=False)
    specification = Column(String(200))
    unit = Column(String(20))
    unit_price = Column(Numeric(12, 2), default=0)
    cost_price = Column(Numeric(12, 2), default=0)  # 原価
    valid_from = Column(Date)
    valid_until = Column(Date)
    supplier = Column(String(200))
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
