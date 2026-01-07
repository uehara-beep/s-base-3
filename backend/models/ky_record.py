from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class KYRecord(Base):
    __tablename__ = "ky_records"

    id = Column(Integer, primary_key=True, index=True)
    record_date = Column(Date, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    weather = Column(String(20))
    work_content = Column(Text, nullable=False)
    hazard_points = Column(Text)  # 危険ポイント
    countermeasures = Column(Text)  # 対策
    team_leader = Column(String(100))
    participants = Column(Text)  # 参加者名（カンマ区切り）
    participant_count = Column(Integer, default=0)
    safety_call = Column(String(200))  # 安全コール
    image_path = Column(String(500))
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="ky_records")
