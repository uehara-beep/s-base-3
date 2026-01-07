from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from models.partner import Partner
from models.user import User
from utils.auth import get_current_user, require_role

router = APIRouter()


class PartnerCreate(BaseModel):
    partner_code: str
    name: str
    name_kana: Optional[str] = None
    category: Optional[str] = None
    postal_code: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    contact_person: Optional[str] = None
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    account_type: Optional[str] = None
    account_number: Optional[str] = None
    account_holder: Optional[str] = None
    notes: Optional[str] = None


class PartnerResponse(BaseModel):
    id: int
    partner_code: str
    name: str
    category: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    contact_person: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


@router.get("/", response_model=List[PartnerResponse])
async def get_partners(
    is_active: Optional[bool] = True,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Partner)
    if is_active is not None:
        query = query.filter(Partner.is_active == is_active)
    if category:
        query = query.filter(Partner.category == category)
    return query.order_by(Partner.partner_code).all()


@router.get("/{partner_id}")
async def get_partner(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="協力業者が見つかりません")
    return partner


@router.post("/", response_model=PartnerResponse)
async def create_partner(
    data: PartnerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    existing = db.query(Partner).filter(Partner.partner_code == data.partner_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="この協力業者コードは既に使用されています")

    partner = Partner(**data.dict())
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


@router.put("/{partner_id}", response_model=PartnerResponse)
async def update_partner(
    partner_id: int,
    data: PartnerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="協力業者が見つかりません")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(partner, key, value)

    db.commit()
    db.refresh(partner)
    return partner


@router.delete("/{partner_id}")
async def delete_partner(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="協力業者が見つかりません")

    partner.is_active = False
    db.commit()
    return {"message": "協力業者が無効化されました"}
