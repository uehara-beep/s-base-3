from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey
from datetime import datetime
from database import Base

class PDMaterial(Base):
    __tablename__ = "pd_materials"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    material_code = Column(String(50))
    name = Column(String(200), nullable=False)
    specification = Column(String(200))
    unit = Column(String(20))
    planned_quantity = Column(Numeric(10, 2), default=0)  # 予定数量
    actual_quantity = Column(Numeric(10, 2), default=0)  # 実績数量
    unit_price = Column(Numeric(10, 2), default=0)
    planned_amount = Column(Numeric(12, 2), default=0)
    actual_amount = Column(Numeric(12, 2), default=0)
    delivery_date = Column(Date)
    supplier = Column(String(200))
    status = Column(String(20), default="planned")  # planned, ordered, delivered, used
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
