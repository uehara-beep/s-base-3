from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date
from database import get_db
from models.photo import Photo
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class PhotoCreate(BaseModel):
    project_id: int
    photo_date: date
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    file_path: str
    tags: Optional[str] = None


@router.get("/")
async def get_photos(
    project_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Photo)
    if project_id:
        query = query.filter(Photo.project_id == project_id)
    if category:
        query = query.filter(Photo.category == category)
    return query.order_by(Photo.photo_date.desc()).all()


@router.get("/{photo_id}")
async def get_photo(photo_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="写真が見つかりません")
    return photo


@router.post("/")
async def create_photo(data: PhotoCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    photo = Photo(**data.dict(), taken_by=current_user.id)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return {"message": "写真が登録されました", "photo_id": photo.id}


@router.delete("/{photo_id}")
async def delete_photo(photo_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="写真が見つかりません")
    db.delete(photo)
    db.commit()
    return {"message": "写真が削除されました"}
