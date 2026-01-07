from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date
from database import get_db
from models.inventory import Vehicle
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


class VehicleCreate(BaseModel):
    vehicle_code: str
    name: str
    plate_number: str
    vehicle_type: Optional[str] = None
    model: Optional[str] = None
    capacity: Optional[str] = None
    purchase_date: Optional[date] = None
    inspection_due: Optional[date] = None
    insurance_due: Optional[date] = None
    notes: Optional[str] = None


@router.get("/")
async def get_vehicles(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Vehicle).filter(Vehicle.is_active == True)
    if status:
        query = query.filter(Vehicle.status == status)
    return query.order_by(Vehicle.vehicle_code).all()


@router.get("/{vehicle_id}")
async def get_vehicle(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="車両が見つかりません")
    return vehicle


@router.post("/")
async def create_vehicle(data: VehicleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicle = Vehicle(**data.dict())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return {"message": "車両が登録されました", "vehicle_id": vehicle.id}


@router.put("/{vehicle_id}/status")
async def update_vehicle_status(vehicle_id: int, status: str, mileage: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="車両が見つかりません")
    vehicle.status = status
    if mileage:
        vehicle.current_mileage = mileage
    db.commit()
    return {"message": "車両ステータスが更新されました"}


@router.delete("/{vehicle_id}")
async def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="車両が見つかりません")
    vehicle.is_active = False
    db.commit()
    return {"message": "車両が削除されました"}
