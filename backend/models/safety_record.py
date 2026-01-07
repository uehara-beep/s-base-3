from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, Boolean
from datetime import datetime
from database import Base

class SafetyRecord(Base):
    __tablename__ = "safety_records"

    id = Column(Integer, primary_key=True, index=True)
    record_type = Column(String(50), nullable=False)  # パトロール, 事故報告, ヒヤリハット
    record_date = Column(Date, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    location = Column(String(200))
    severity = Column(String(20))  # 軽微, 中程度, 重大
    action_taken = Column(Text)
    follow_up_required = Column(Boolean, default=False)
    follow_up_status = Column(String(20))  # pending, completed
    images = Column(Text)  # JSONで複数画像パス
    reported_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
