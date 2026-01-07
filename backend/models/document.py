from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey
from datetime import datetime
from database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String(50), nullable=False)  # 契約書, 図面, 報告書, etc.
    title = Column(String(200), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(200), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    tags = Column(String(500))  # カンマ区切りタグ
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
