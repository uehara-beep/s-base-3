from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from decimal import Decimal
from database import get_db
from models.inventory import Inventory
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class InventoryCreate(BaseModel):
    item_code: str
    name: str
    category: Optional[str] = None
    specification: Optional[str] = None
    unit: Optional[str] = None
    quantity: float = 0
    min_quantity: float = 0
    unit_price: float = 0
    location: Optional[str] = None
    supplier: Optional[str] = None


@router.get("/")
async def get_inventory(
    category: Optional[str] = None,
    low_stock: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Inventory).filter(Inventory.is_active == True)
    if category:
        query = query.filter(Inventory.category == category)
    if low_stock:
        query = query.filter(Inventory.quantity <= Inventory.min_quantity)
    return query.order_by(Inventory.item_code).all()


@router.get("/{item_id}")
async def get_inventory_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="在庫品が見つかりません")
    return item


@router.post("/")
async def create_inventory(data: InventoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = Inventory(**{k: Decimal(str(v)) if k in ['quantity', 'min_quantity', 'unit_price'] else v for k, v in data.dict().items()})
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": "在庫品が登録されました", "item_id": item.id}


@router.put("/{item_id}/adjust")
async def adjust_inventory(item_id: int, quantity: float, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="在庫品が見つかりません")
    item.quantity = Decimal(str(quantity))
    db.commit()
    return {"message": "在庫数が更新されました"}


@router.delete("/{item_id}")
async def delete_inventory(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="在庫品が見つかりません")
    item.is_active = False
    db.commit()
    return {"message": "在庫品が削除されました"}
