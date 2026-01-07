from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date
from decimal import Decimal
from database import get_db
from models.price_master import PriceMaster
from models.user import User
from utils.auth import get_current_user, require_role

router = APIRouter()


class PriceCreate(BaseModel):
    item_code: Optional[str] = None
    category: Optional[str] = None
    name: str
    specification: Optional[str] = None
    unit: Optional[str] = None
    unit_price: float = 0
    cost_price: float = 0
    valid_from: Optional[date] = None
    valid_until: Optional[date] = None
    supplier: Optional[str] = None
    notes: Optional[str] = None


@router.get("/")
async def get_prices(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PriceMaster).filter(PriceMaster.is_active == True)
    if category:
        query = query.filter(PriceMaster.category == category)
    if search:
        query = query.filter(PriceMaster.name.contains(search))
    return query.order_by(PriceMaster.category, PriceMaster.name).all()


@router.get("/{price_id}")
async def get_price(price_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    price = db.query(PriceMaster).filter(PriceMaster.id == price_id).first()
    if not price:
        raise HTTPException(status_code=404, detail="単価が見つかりません")
    return price


@router.post("/")
async def create_price(data: PriceCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role(["admin", "manager"]))):
    price = PriceMaster(
        **{k: Decimal(str(v)) if k in ['unit_price', 'cost_price'] else v for k, v in data.dict().items()}
    )
    db.add(price)
    db.commit()
    db.refresh(price)
    return {"message": "単価が登録されました", "price_id": price.id}


@router.put("/{price_id}")
async def update_price(price_id: int, data: PriceCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role(["admin", "manager"]))):
    price = db.query(PriceMaster).filter(PriceMaster.id == price_id).first()
    if not price:
        raise HTTPException(status_code=404, detail="単価が見つかりません")
    for key, value in data.dict().items():
        if key in ['unit_price', 'cost_price']:
            value = Decimal(str(value))
        setattr(price, key, value)
    db.commit()
    return {"message": "単価が更新されました"}


@router.delete("/{price_id}")
async def delete_price(price_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role(["admin"]))):
    price = db.query(PriceMaster).filter(PriceMaster.id == price_id).first()
    if not price:
        raise HTTPException(status_code=404, detail="単価が見つかりません")
    price.is_active = False
    db.commit()
    return {"message": "単価が削除されました"}
