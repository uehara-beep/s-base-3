from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    photo_date = Column(Date, nullable=False)
    category = Column(String(50))  # 着工前, 施工中, 完成, etc.
    title = Column(String(200))
    description = Column(Text)
    file_path = Column(String(500), nullable=False)
    thumbnail_path = Column(String(500))
    file_size = Column(Integer)
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    taken_by = Column(Integer, ForeignKey("users.id"))
    tags = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="photos")
