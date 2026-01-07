from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from models.client import Client
from models.user import User
from utils.auth import get_current_user, require_role

router = APIRouter()


class ClientCreate(BaseModel):
    client_code: str
    name: str
    name_kana: Optional[str] = None
    postal_code: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    contact_person: Optional[str] = None
    notes: Optional[str] = None


class ClientResponse(BaseModel):
    id: int
    client_code: str
    name: str
    name_kana: Optional[str]
    postal_code: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    contact_person: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ClientResponse])
async def get_clients(
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Client)
    if is_active is not None:
        query = query.filter(Client.is_active == is_active)
    return query.order_by(Client.client_code).all()


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="元請けが見つかりません")
    return client


@router.post("/", response_model=ClientResponse)
async def create_client(
    data: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    existing = db.query(Client).filter(Client.client_code == data.client_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="この元請けコードは既に使用されています")

    client = Client(**data.dict())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int,
    data: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="元請けが見つかりません")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(client, key, value)

    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}")
async def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="元請けが見つかりません")

    client.is_active = False
    db.commit()
    return {"message": "元請けが無効化されました"}
