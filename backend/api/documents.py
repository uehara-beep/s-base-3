from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from database import get_db
from models.document import Document
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class DocumentCreate(BaseModel):
    document_type: str
    title: str
    project_id: Optional[int] = None
    client_id: Optional[int] = None
    file_path: str
    file_name: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None


@router.get("/")
async def get_documents(
    document_type: Optional[str] = None,
    project_id: Optional[int] = None,
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Document)
    if document_type:
        query = query.filter(Document.document_type == document_type)
    if project_id:
        query = query.filter(Document.project_id == project_id)
    if client_id:
        query = query.filter(Document.client_id == client_id)
    return query.order_by(Document.created_at.desc()).all()


@router.get("/{document_id}")
async def get_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="書類が見つかりません")
    return doc


@router.post("/")
async def create_document(data: DocumentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = Document(**data.dict(), uploaded_by=current_user.id)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {"message": "書類が登録されました", "document_id": doc.id}


@router.delete("/{document_id}")
async def delete_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="書類が見つかりません")
    db.delete(doc)
    db.commit()
    return {"message": "書類が削除されました"}
