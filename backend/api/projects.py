from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from decimal import Decimal
from database import get_db
from models.project import Project
from models.user import User
from utils.auth import get_current_user, require_role

router = APIRouter()


class ProjectCreate(BaseModel):
    quote_id: Optional[int] = None
    client_id: Optional[int] = None
    name: str
    site_name: Optional[str] = None
    site_address: Optional[str] = None
    manager_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    contract_amount: float = 0
    budget_amount: float = 0
    notes: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    project_code: str
    name: str
    site_name: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    contract_amount: float
    budget_amount: float
    actual_cost: float
    status: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ProjectResponse])
async def get_projects(
    status: Optional[str] = None,
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Project)
    if status:
        query = query.filter(Project.status == status)
    if client_id:
        query = query.filter(Project.client_id == client_id)
    return query.order_by(Project.created_at.desc()).all()


@router.get("/{project_id}")
async def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="現場が見つかりません")
    return project


@router.post("/")
async def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    last_project = db.query(Project).order_by(Project.id.desc()).first()
    project_code = f"P{(last_project.id + 1 if last_project else 1):06d}"

    project = Project(
        project_code=project_code,
        quote_id=data.quote_id,
        client_id=data.client_id,
        name=data.name,
        site_name=data.site_name,
        site_address=data.site_address,
        manager_id=data.manager_id,
        start_date=data.start_date,
        end_date=data.end_date,
        contract_amount=Decimal(str(data.contract_amount)),
        budget_amount=Decimal(str(data.budget_amount)),
        notes=data.notes
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return {"message": "現場が作成されました", "project_id": project.id}


@router.put("/{project_id}")
async def update_project(
    project_id: int,
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="現場が見つかりません")

    for key, value in data.dict(exclude_unset=True).items():
        if key in ['contract_amount', 'budget_amount']:
            value = Decimal(str(value))
        setattr(project, key, value)

    db.commit()
    return {"message": "現場が更新されました"}


@router.put("/{project_id}/status")
async def update_project_status(
    project_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="現場が見つかりません")

    project.status = status
    db.commit()
    return {"message": f"現場のステータスが{status}に変更されました"}


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="現場が見つかりません")

    db.delete(project)
    db.commit()
    return {"message": "現場が削除されました"}
