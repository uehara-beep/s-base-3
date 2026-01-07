from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal
from database import get_db
from models.income import Income
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class IncomeCreate(BaseModel):
    income_date: date
    client_id: Optional[int] = None
    invoice_id: Optional[int] = None
    project_id: Optional[int] = None
    amount: float
    payment_method: Optional[str] = None
    description: Optional[str] = None
    expected_date: Optional[date] = None
    notes: Optional[str] = None


@router.get("/")
async def get_incomes(
    status: Optional[str] = None,
    client_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Income)
    if status:
        query = query.filter(Income.status == status)
    if client_id:
        query = query.filter(Income.client_id == client_id)
    if start_date:
        query = query.filter(Income.income_date >= start_date)
    if end_date:
        query = query.filter(Income.income_date <= end_date)
    return query.order_by(Income.income_date.desc()).all()


@router.get("/{income_id}")
async def get_income(income_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = db.query(Income).filter(Income.id == income_id).first()
    if not income:
        raise HTTPException(status_code=404, detail="入金が見つかりません")
    return income


@router.post("/")
async def create_income(data: IncomeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = Income(**{k: Decimal(str(v)) if k == 'amount' else v for k, v in data.dict().items()}, created_by=current_user.id)
    db.add(income)
    db.commit()
    db.refresh(income)
    return {"message": "入金が登録されました", "income_id": income.id}


@router.put("/{income_id}/receive")
async def receive_income(income_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = db.query(Income).filter(Income.id == income_id).first()
    if not income:
        raise HTTPException(status_code=404, detail="入金が見つかりません")
    income.status = "received"
    income.received_at = datetime.utcnow()
    db.commit()
    return {"message": "入金が確認されました"}
