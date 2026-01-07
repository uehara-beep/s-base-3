from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal
from database import get_db
from models.payment import Payment
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class PaymentCreate(BaseModel):
    payment_date: date
    partner_id: Optional[int] = None
    invoice_id: Optional[int] = None
    project_id: Optional[int] = None
    amount: float
    payment_method: Optional[str] = None
    description: Optional[str] = None
    scheduled_date: Optional[date] = None
    notes: Optional[str] = None


@router.get("/")
async def get_payments(
    status: Optional[str] = None,
    partner_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Payment)
    if status:
        query = query.filter(Payment.status == status)
    if partner_id:
        query = query.filter(Payment.partner_id == partner_id)
    if start_date:
        query = query.filter(Payment.payment_date >= start_date)
    if end_date:
        query = query.filter(Payment.payment_date <= end_date)
    return query.order_by(Payment.payment_date.desc()).all()


@router.get("/{payment_id}")
async def get_payment(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="支払が見つかりません")
    return payment


@router.post("/")
async def create_payment(data: PaymentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payment = Payment(**{k: Decimal(str(v)) if k == 'amount' else v for k, v in data.dict().items()}, created_by=current_user.id)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return {"message": "支払が登録されました", "payment_id": payment.id}


@router.put("/{payment_id}/complete")
async def complete_payment(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="支払が見つかりません")
    payment.status = "completed"
    payment.completed_at = datetime.utcnow()
    db.commit()
    return {"message": "支払が完了しました"}
