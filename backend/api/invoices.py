from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date
from decimal import Decimal
from database import get_db
from models.invoice import Invoice
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class InvoiceCreate(BaseModel):
    invoice_type: str
    invoice_date: date
    due_date: Optional[date] = None
    client_id: Optional[int] = None
    partner_id: Optional[int] = None
    project_id: Optional[int] = None
    subject: Optional[str] = None
    subtotal: float = 0
    tax_rate: float = 10
    notes: Optional[str] = None


@router.get("/")
async def get_invoices(
    invoice_type: Optional[str] = None,
    status: Optional[str] = None,
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Invoice)
    if invoice_type:
        query = query.filter(Invoice.invoice_type == invoice_type)
    if status:
        query = query.filter(Invoice.status == status)
    if client_id:
        query = query.filter(Invoice.client_id == client_id)
    return query.order_by(Invoice.invoice_date.desc()).all()


@router.get("/{invoice_id}")
async def get_invoice(invoice_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="請求書が見つかりません")
    return invoice


@router.post("/")
async def create_invoice(data: InvoiceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    last = db.query(Invoice).order_by(Invoice.id.desc()).first()
    invoice_number = f"INV{(last.id + 1 if last else 1):06d}"

    subtotal = Decimal(str(data.subtotal))
    tax_rate = Decimal(str(data.tax_rate))
    tax_amount = subtotal * tax_rate / 100
    total = subtotal + tax_amount

    invoice = Invoice(
        invoice_number=invoice_number,
        invoice_type=data.invoice_type,
        invoice_date=data.invoice_date,
        due_date=data.due_date,
        client_id=data.client_id,
        partner_id=data.partner_id,
        project_id=data.project_id,
        subject=data.subject,
        subtotal=subtotal,
        tax_rate=tax_rate,
        tax_amount=tax_amount,
        total_amount=total,
        notes=data.notes,
        created_by=current_user.id
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return {"message": "請求書が作成されました", "invoice_id": invoice.id}


@router.put("/{invoice_id}/status")
async def update_invoice_status(invoice_id: int, status: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="請求書が見つかりません")
    invoice.status = status
    db.commit()
    return {"message": "請求書ステータスが更新されました"}
