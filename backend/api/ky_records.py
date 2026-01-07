from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date
from database import get_db
from models.ky_record import KYRecord
from models.user import User
from utils.auth import get_current_user
from utils.ai_services import analyze_ky_photo

router = APIRouter()


class KYRecordCreate(BaseModel):
    record_date: date
    project_id: int
    weather: Optional[str] = None
    work_content: str
    hazard_points: Optional[str] = None
    countermeasures: Optional[str] = None
    team_leader: Optional[str] = None
    participants: Optional[str] = None
    participant_count: int = 0
    safety_call: Optional[str] = None


@router.get("/")
async def get_ky_records(
    project_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(KYRecord)
    if project_id:
        query = query.filter(KYRecord.project_id == project_id)
    if start_date:
        query = query.filter(KYRecord.record_date >= start_date)
    if end_date:
        query = query.filter(KYRecord.record_date <= end_date)
    return query.order_by(KYRecord.record_date.desc()).all()


@router.get("/{record_id}")
async def get_ky_record(record_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(KYRecord).filter(KYRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="KY記録が見つかりません")
    return record


@router.post("/")
async def create_ky_record(data: KYRecordCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = KYRecord(**data.dict(), created_by=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"message": "KY記録が登録されました", "record_id": record.id}


@router.put("/{record_id}")
async def update_ky_record(record_id: int, data: KYRecordCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(KYRecord).filter(KYRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="KY記録が見つかりません")
    for key, value in data.dict().items():
        setattr(record, key, value)
    db.commit()
    return {"message": "KY記録が更新されました"}


@router.delete("/{record_id}")
async def delete_ky_record(record_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(KYRecord).filter(KYRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="KY記録が見つかりません")
    db.delete(record)
    db.commit()
    return {"message": "KY記録が削除されました"}


@router.post("/analyze-photo")
async def analyze_site_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    工事現場の写真をAI分析し、危険予知（KY）情報を抽出します。
    Claude Vision APIを使用して安全管理上の危険箇所・改善点を自動認識します。

    Returns:
        hazards: 検出された危険箇所のリスト
        safety_points: 安全上の良い点
        recommendations: 安全対策の推奨事項
        overall_assessment: 全体的な安全性評価
        summary: 分析サマリー
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="画像ファイルのみ対応しています")

    try:
        image_data = await file.read()
        media_type = file.content_type or "image/jpeg"

        result = await analyze_ky_photo(image_data, media_type)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"写真の分析に失敗しました: {str(e)}")
