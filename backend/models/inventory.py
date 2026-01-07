from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey, Boolean
from datetime import datetime
from database import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    item_code = Column(String(50), unique=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50))
    specification = Column(String(200))
    unit = Column(String(20))
    quantity = Column(Numeric(10, 2), default=0)
    min_quantity = Column(Numeric(10, 2), default=0)  # 最低在庫
    unit_price = Column(Numeric(10, 2), default=0)
    location = Column(String(100))  # 保管場所
    supplier = Column(String(200))
    last_order_date = Column(Date)
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    equipment_code = Column(String(50), unique=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50))  # 工具, 計測器, 重機, etc.
    model = Column(String(100))
    serial_number = Column(String(100))
    purchase_date = Column(Date)
    purchase_price = Column(Numeric(12, 2))
    current_location = Column(String(200))  # 現在の場所（現場名）
    assigned_project_id = Column(Integer, ForeignKey("projects.id"))
    status = Column(String(20), default="available")  # available, in_use, maintenance, retired
    next_inspection_date = Column(Date)
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_code = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    plate_number = Column(String(20), unique=True)
    vehicle_type = Column(String(50))  # 乗用車, トラック, バン, etc.
    model = Column(String(100))
    capacity = Column(String(50))
    purchase_date = Column(Date)
    inspection_due = Column(Date)  # 車検期限
    insurance_due = Column(Date)  # 保険期限
    assigned_employee_id = Column(Integer, ForeignKey("employees.id"))
    current_mileage = Column(Integer)
    status = Column(String(20), default="available")  # available, in_use, maintenance
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
