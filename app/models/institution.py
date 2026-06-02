import uuid
from sqlalchemy import Column, String, Text, TIMESTAMP, func, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False)
    type = Column(String(50), nullable=False)  # school, company, government, etc.
    address = Column(Text)
    contact_email = Column(String(255))
    contact_phone = Column(String(20))
    description = Column(Text)
    sustainability_goals = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    creator = relationship("User", back_populates="institutions")