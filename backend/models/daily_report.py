from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey, Time
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class DailyReport(Base):
    __tablename__ = "daily_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_date = Column(Date, nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    weather = Column(String(20))
    start_time = Column(Time)
    end_time = Column(Time)
    break_hours = Column(Numeric(4, 2), default=1)
    work_hours = Column(Numeric(4, 2), default=0)
    overtime_hours = Column(Numeric(4, 2), default=0)
    work_content = Column(Text)
    issues = Column(Text)
    tomorrow_plan = Column(Text)
    status = Column(String(20), default="draft")  # draft, submitted, approved
    submitted_at = Column(DateTime)
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="daily_reports")
    employee = relationship("Employee", back_populates="daily_reports")
    labor_costs = relationship("DailyReportLabor", back_populates="daily_report", cascade="all, delete-orphan")
    material_costs = relationship("DailyReportMaterial", back_populates="daily_report", cascade="all, delete-orphan")


class DailyReportLabor(Base):
    __tablename__ = "daily_report_labor"

    id = Column(Integer, primary_key=True, index=True)
    daily_report_id = Column(Integer, ForeignKey("daily_reports.id"), nullable=False)
    worker_name = Column(String(100), nullable=False)
    worker_type = Column(String(50))  # 自社, 協力業者
    partner_id = Column(Integer, ForeignKey("partners.id"))
    hours = Column(Numeric(4, 2), default=0)
    rate = Column(Numeric(10, 2), default=0)
    amount = Column(Numeric(12, 2), default=0)
    notes = Column(Text)

    daily_report = relationship("DailyReport", back_populates="labor_costs")


class DailyReportMaterial(Base):
    __tablename__ = "daily_report_material"

    id = Column(Integer, primary_key=True, index=True)
    daily_report_id = Column(Integer, ForeignKey("daily_reports.id"), nullable=False)
    material_name = Column(String(200), nullable=False)
    specification = Column(String(200))
    quantity = Column(Numeric(10, 2), default=0)
    unit = Column(String(20))
    unit_price = Column(Numeric(10, 2), default=0)
    amount = Column(Numeric(12, 2), default=0)
    supplier = Column(String(200))
    notes = Column(Text)

    daily_report = relationship("DailyReport", back_populates="material_costs")
