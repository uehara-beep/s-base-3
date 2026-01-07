from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from datetime import datetime
from database import Base

class BusinessCard(Base):
    __tablename__ = "business_cards"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200))
    department = Column(String(100))
    position = Column(String(100))
    name = Column(String(100), nullable=False)
    name_kana = Column(String(100))
    phone = Column(String(50))
    mobile = Column(String(50))
    fax = Column(String(50))
    email = Column(String(100))
    postal_code = Column(String(10))
    address = Column(String(500))
    website = Column(String(200))
    image_path = Column(String(500))
    ocr_data = Column(Text)
    client_id = Column(Integer, ForeignKey("clients.id"))
    registered_by = Column(Integer, ForeignKey("users.id"))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
