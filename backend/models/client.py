from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    client_code = Column(String(20), unique=True, index=True)
    name = Column(String(200), nullable=False)
    name_kana = Column(String(200))
    postal_code = Column(String(10))
    address = Column(String(500))
    phone = Column(String(20))
    fax = Column(String(20))
    email = Column(String(100))
    contact_person = Column(String(100))
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    quotes = relationship("Quote", back_populates="client")
    projects = relationship("Project", back_populates="client")
