from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from database import get_db
from models.employee import Employee
from models.user import User
from utils.auth import get_current_user, require_role

router = APIRouter()


class EmployeeCreate(BaseModel):
    employee_code: str
    name: str
    name_kana: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    hire_date: Optional[date] = None
    birth_date: Optional[date] = None
    hourly_rate: Optional[float] = 0


class EmployeeResponse(BaseModel):
    id: int
    employee_code: str
    name: str
    name_kana: Optional[str]
    department: Optional[str]
    position: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    hire_date: Optional[date]
    hourly_rate: Optional[float]
    is_active: bool

    class Config:
        from_attributes = True


@router.get("/", response_model=List[EmployeeResponse])
async def get_employees(
    is_active: Optional[bool] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Employee)
    if is_active is not None:
        query = query.filter(Employee.is_active == is_active)
    if department:
        query = query.filter(Employee.department == department)
    return query.order_by(Employee.employee_code).all()


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="従業員が見つかりません")
    return employee


@router.post("/", response_model=EmployeeResponse)
async def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    existing = db.query(Employee).filter(Employee.employee_code == data.employee_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="この従業員コードは既に使用されています")

    employee = Employee(**data.dict())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="従業員が見つかりません")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(employee, key, value)

    db.commit()
    db.refresh(employee)
    return employee


@router.delete("/{employee_id}")
async def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="従業員が見つかりません")

    employee.is_active = False
    db.commit()
    return {"message": "従業員が無効化されました"}
