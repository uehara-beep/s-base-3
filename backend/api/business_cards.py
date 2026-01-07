from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from database import get_db
from models.business_card import BusinessCard
from models.user import User
from utils.auth import get_current_user
from utils.ai_services import ocr_business_card

router = APIRouter()


class BusinessCardCreate(BaseModel):
    company_name: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    name: str
    name_kana: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    client_id: Optional[int] = None
    notes: Optional[str] = None


@router.get("/")
async def get_business_cards(
    company_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(BusinessCard)
    if company_name:
        query = query.filter(BusinessCard.company_name.contains(company_name))
    return query.order_by(BusinessCard.company_name, BusinessCard.name).all()


@router.get("/{card_id}")
async def get_business_card(card_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    card = db.query(BusinessCard).filter(BusinessCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="名刺が見つかりません")
    return card


@router.post("/")
async def create_business_card(data: BusinessCardCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    card = BusinessCard(**data.dict(), registered_by=current_user.id)
    db.add(card)
    db.commit()
    db.refresh(card)
    return {"message": "名刺が登録されました", "card_id": card.id}


@router.put("/{card_id}")
async def update_business_card(card_id: int, data: BusinessCardCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    card = db.query(BusinessCard).filter(BusinessCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="名刺が見つかりません")
    for key, value in data.dict().items():
        setattr(card, key, value)
    db.commit()
    return {"message": "名刺が更新されました"}


@router.delete("/{card_id}")
async def delete_business_card(card_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    card = db.query(BusinessCard).filter(BusinessCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="名刺が見つかりません")
    db.delete(card)
    db.commit()
    return {"message": "名刺が削除されました"}


@router.post("/scan")
async def scan_business_card(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    名刺画像をOCR解析し、テキスト情報を抽出します。
    Claude Vision APIを使用して名刺の情報を自動認識します。
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="画像ファイルのみ対応しています")

    try:
        image_data = await file.read()
        media_type = file.content_type or "image/jpeg"

        result = await ocr_business_card(image_data, media_type)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"名刺の解析に失敗しました: {str(e)}")
