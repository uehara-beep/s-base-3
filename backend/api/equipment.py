from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date
from decimal import Decimal
from database import get_db
from models.inventory import Equipment
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class EquipmentCreate(BaseModel):
    equipment_code: str
    name: str
    category: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[float] = None
    current_location: Optional[str] = None
    next_inspection_date: Optional[date] = None
    notes: Optional[str] = None


@router.get("/")
async def get_equipment(
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Equipment).filter(Equipment.is_active == True)
    if category:
        query = query.filter(Equipment.category == category)
    if status:
        query = query.filter(Equipment.status == status)
    return query.order_by(Equipment.equipment_code).all()


@router.get("/{equipment_id}")
async def get_equipment_item(equipment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="機材が見つかりません")
    return item


@router.post("/")
async def create_equipment(data: EquipmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = Equipment(**data.dict())
    if item.purchase_price:
        item.purchase_price = Decimal(str(item.purchase_price))
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": "機材が登録されました", "equipment_id": item.id}


@router.put("/{equipment_id}/status")
async def update_equipment_status(equipment_id: int, status: str, location: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="機材が見つかりません")
    item.status = status
    if location:
        item.current_location = location
    db.commit()
    return {"message": "機材ステータスが更新されました"}


@router.delete("/{equipment_id}")
async def delete_equipment(equipment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="機材が見つかりません")
    item.is_active = False
    db.commit()
    return {"message": "機材が削除されました"}
