from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date, time, datetime
from decimal import Decimal
from database import get_db
from models.daily_report import DailyReport, DailyReportLabor, DailyReportMaterial
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class LaborCreate(BaseModel):
    worker_name: str
    worker_type: Optional[str] = None
    partner_id: Optional[int] = None
    hours: float = 0
    rate: float = 0
    notes: Optional[str] = None


class MaterialCreate(BaseModel):
    material_name: str
    specification: Optional[str] = None
    quantity: float = 0
    unit: Optional[str] = None
    unit_price: float = 0
    supplier: Optional[str] = None
    notes: Optional[str] = None


class DailyReportCreate(BaseModel):
    report_date: date
    project_id: int
    employee_id: int
    weather: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    break_hours: float = 1
    work_content: Optional[str] = None
    issues: Optional[str] = None
    tomorrow_plan: Optional[str] = None
    labor_costs: List[LaborCreate] = []
    material_costs: List[MaterialCreate] = []


@router.get("/")
async def get_daily_reports(
    project_id: Optional[int] = None,
    employee_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DailyReport)
    if project_id:
        query = query.filter(DailyReport.project_id == project_id)
    if employee_id:
        query = query.filter(DailyReport.employee_id == employee_id)
    if start_date:
        query = query.filter(DailyReport.report_date >= start_date)
    if end_date:
        query = query.filter(DailyReport.report_date <= end_date)
    return query.order_by(DailyReport.report_date.desc()).all()


@router.get("/{report_id}")
async def get_daily_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(DailyReport).filter(DailyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="日報が見つかりません")

    labor_costs = db.query(DailyReportLabor).filter(DailyReportLabor.daily_report_id == report_id).all()
    material_costs = db.query(DailyReportMaterial).filter(DailyReportMaterial.daily_report_id == report_id).all()

    return {
        **report.__dict__,
        "labor_costs": [l.__dict__ for l in labor_costs],
        "material_costs": [m.__dict__ for m in material_costs]
    }


@router.post("/")
async def create_daily_report(
    data: DailyReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Parse times
    start_time = None
    end_time = None
    if data.start_time:
        start_time = datetime.strptime(data.start_time, "%H:%M").time()
    if data.end_time:
        end_time = datetime.strptime(data.end_time, "%H:%M").time()

    # Calculate work hours
    work_hours = Decimal(0)
    if start_time and end_time:
        start_minutes = start_time.hour * 60 + start_time.minute
        end_minutes = end_time.hour * 60 + end_time.minute
        work_hours = Decimal(str((end_minutes - start_minutes) / 60 - data.break_hours))

    report = DailyReport(
        report_date=data.report_date,
        project_id=data.project_id,
        employee_id=data.employee_id,
        weather=data.weather,
        start_time=start_time,
        end_time=end_time,
        break_hours=Decimal(str(data.break_hours)),
        work_hours=work_hours,
        work_content=data.work_content,
        issues=data.issues,
        tomorrow_plan=data.tomorrow_plan
    )

    db.add(report)
    db.flush()

    # Add labor costs
    for labor in data.labor_costs:
        amount = Decimal(str(labor.hours)) * Decimal(str(labor.rate))
        db.add(DailyReportLabor(
            daily_report_id=report.id,
            worker_name=labor.worker_name,
            worker_type=labor.worker_type,
            partner_id=labor.partner_id,
            hours=Decimal(str(labor.hours)),
            rate=Decimal(str(labor.rate)),
            amount=amount,
            notes=labor.notes
        ))

    # Add material costs
    for material in data.material_costs:
        amount = Decimal(str(material.quantity)) * Decimal(str(material.unit_price))
        db.add(DailyReportMaterial(
            daily_report_id=report.id,
            material_name=material.material_name,
            specification=material.specification,
            quantity=Decimal(str(material.quantity)),
            unit=material.unit,
            unit_price=Decimal(str(material.unit_price)),
            amount=amount,
            supplier=material.supplier,
            notes=material.notes
        ))

    db.commit()
    return {"message": "日報が作成されました", "report_id": report.id}


@router.put("/{report_id}/submit")
async def submit_daily_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(DailyReport).filter(DailyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="日報が見つかりません")

    report.status = "submitted"
    report.submitted_at = datetime.utcnow()
    db.commit()
    return {"message": "日報が提出されました"}


@router.put("/{report_id}/approve")
async def approve_daily_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(DailyReport).filter(DailyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="日報が見つかりません")

    report.status = "approved"
    report.approved_by = current_user.id
    report.approved_at = datetime.utcnow()
    db.commit()
    return {"message": "日報が承認されました"}
