from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.user import User
from utils.auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    role: str = "user"


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザー名またはパスワードが正しくありません",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="アカウントが無効です"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }


@router.post("/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if username exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このユーザー名は既に使用されています"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "ユーザーが作成されました", "user_id": new_user.id}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "employee_id": current_user.employee_id
    }


@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="現在のパスワードが正しくありません"
        )

    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()

    return {"message": "パスワードが変更されました"}


@router.post("/init-admin")
async def init_admin(db: Session = Depends(get_db)):
    """初期管理者アカウントを作成"""
    existing_admin = db.query(User).filter(User.role == "admin").first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="管理者アカウントは既に存在します"
        )

    admin_user = User(
        username="admin",
        email="admin@sbase.local",
        hashed_password=get_password_hash("admin123"),
        role="admin"
    )

    db.add(admin_user)
    db.commit()

    return {"message": "管理者アカウントが作成されました", "username": "admin", "password": "admin123"}
