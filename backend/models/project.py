from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_code = Column(String(50), unique=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))
    name = Column(String(200), nullable=False)
    site_name = Column(String(200))
    site_address = Column(String(500))
    manager_id = Column(Integer, ForeignKey("employees.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    contract_amount = Column(Numeric(14, 2), default=0)
    budget_amount = Column(Numeric(14, 2), default=0)
    actual_cost = Column(Numeric(14, 2), default=0)
    status = Column(String(20), default="planned")  # planned, in_progress, completed, cancelled
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    quote = relationship("Quote", back_populates="project")
    client = relationship("Client", back_populates="projects")
    daily_reports = relationship("DailyReport", back_populates="project")
    photos = relationship("Photo", back_populates="project")
    ky_records = relationship("KYRecord", back_populates="project")
