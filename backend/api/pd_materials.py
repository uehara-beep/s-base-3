from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date
from decimal import Decimal
from database import get_db
from models.pd_material import PDMaterial
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class PDMaterialCreate(BaseModel):
    project_id: int
    material_code: Optional[str] = None
    name: str
    specification: Optional[str] = None
    unit: Optional[str] = None
    planned_quantity: float = 0
    actual_quantity: float = 0
    unit_price: float = 0
    delivery_date: Optional[date] = None
    supplier: Optional[str] = None
    notes: Optional[str] = None


@router.get("/")
async def get_pd_materials(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PDMaterial)
    if project_id:
        query = query.filter(PDMaterial.project_id == project_id)
    if status:
        query = query.filter(PDMaterial.status == status)
    return query.order_by(PDMaterial.created_at.desc()).all()


@router.get("/{material_id}")
async def get_pd_material(material_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    material = db.query(PDMaterial).filter(PDMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="材料が見つかりません")
    return material


@router.post("/")
async def create_pd_material(data: PDMaterialCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    planned_qty = Decimal(str(data.planned_quantity))
    unit_price = Decimal(str(data.unit_price))

    material = PDMaterial(
        project_id=data.project_id,
        material_code=data.material_code,
        name=data.name,
        specification=data.specification,
        unit=data.unit,
        planned_quantity=planned_qty,
        actual_quantity=Decimal(str(data.actual_quantity)),
        unit_price=unit_price,
        planned_amount=planned_qty * unit_price,
        delivery_date=data.delivery_date,
        supplier=data.supplier,
        notes=data.notes
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return {"message": "材料が登録されました", "material_id": material.id}


@router.put("/{material_id}/status")
async def update_pd_material_status(material_id: int, status: str, actual_quantity: Optional[float] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    material = db.query(PDMaterial).filter(PDMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="材料が見つかりません")
    material.status = status
    if actual_quantity is not None:
        material.actual_quantity = Decimal(str(actual_quantity))
        material.actual_amount = material.actual_quantity * material.unit_price
    db.commit()
    return {"message": "材料ステータスが更新されました"}
