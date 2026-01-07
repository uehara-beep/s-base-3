from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from models.user import User
from utils.auth import get_current_user, require_role, get_password_hash

router = APIRouter()


class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    role: str
    is_active: bool
    employee_id: Optional[int]

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    employee_id: Optional[int] = None


@router.get("/", response_model=List[UserResponse])
async def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    users = db.query(User).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
    return user


@router.put("/{user_id}")
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return {"message": "ユーザーが更新されました"}


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="自分自身は削除できません")

    db.delete(user)
    db.commit()
    return {"message": "ユーザーが削除されました"}


@router.post("/{user_id}/reset-password")
async def reset_password(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    new_password = "password123"
    user.hashed_password = get_password_hash(new_password)
    db.commit()

    return {"message": "パスワードがリセットされました", "new_password": new_password}
