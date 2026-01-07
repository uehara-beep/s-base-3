from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal
from database import get_db
from models.expense import Expense
from models.user import User
from utils.auth import get_current_user
from utils.ai_services import ocr_receipt

router = APIRouter()


class ExpenseCreate(BaseModel):
    expense_date: date
    project_id: Optional[int] = None
    category: str
    description: str
    amount: float
    payment_method: Optional[str] = None
    receipt_image: Optional[str] = None
    notes: Optional[str] = None


@router.get("/")
async def get_expenses(
    employee_id: Optional[int] = None,
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Expense)
    if employee_id:
        query = query.filter(Expense.employee_id == employee_id)
    if project_id:
        query = query.filter(Expense.project_id == project_id)
    if status:
        query = query.filter(Expense.status == status)
    if start_date:
        query = query.filter(Expense.expense_date >= start_date)
    if end_date:
        query = query.filter(Expense.expense_date <= end_date)
    return query.order_by(Expense.expense_date.desc()).all()


@router.get("/{expense_id}")
async def get_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="経費が見つかりません")
    return expense


@router.post("/")
async def create_expense(data: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = Expense(
        expense_date=data.expense_date,
        employee_id=current_user.employee_id or current_user.id,
        project_id=data.project_id,
        category=data.category,
        description=data.description,
        amount=Decimal(str(data.amount)),
        payment_method=data.payment_method,
        receipt_image=data.receipt_image,
        notes=data.notes
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return {"message": "経費が登録されました", "expense_id": expense.id}


@router.put("/{expense_id}/submit")
async def submit_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="経費が見つかりません")
    expense.status = "submitted"
    expense.submitted_at = datetime.utcnow()
    db.commit()
    return {"message": "経費が申請されました"}


@router.put("/{expense_id}/approve")
async def approve_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="経費が見つかりません")
    expense.status = "approved"
    expense.approved_by = current_user.id
    expense.approved_at = datetime.utcnow()
    db.commit()
    return {"message": "経費が承認されました"}


@router.put("/{expense_id}/reject")
async def reject_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="経費が見つかりません")
    expense.status = "rejected"
    db.commit()
    return {"message": "経費が却下されました"}


@router.post("/ocr")
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    レシート/領収書画像をOCR解析し、経費情報を抽出します。
    Claude Vision APIを使用して金額・日付・店舗名を自動認識します。
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="画像ファイルのみ対応しています")

    try:
        image_data = await file.read()
        media_type = file.content_type or "image/jpeg"

        result = await ocr_receipt(image_data, media_type)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"レシートの解析に失敗しました: {str(e)}")
