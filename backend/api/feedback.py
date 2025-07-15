from fastapi import APIRouter
from database.mongo import get_db
from pydantic import BaseModel, EmailStr
from datetime import datetime

router = APIRouter()

class FeedbackInput(BaseModel):
    email: EmailStr
    pattern_name: str
    was_accurate: bool
    confidence: float

@router.post("/")
def submit_feedback(entry: FeedbackInput):
    db = get_db()
    db.feedback.insert_one({
        "email": entry.email,
        "pattern_name": entry.pattern_name,
        "was_accurate": entry.was_accurate,
        "confidence": entry.confidence,
        "timestamp": datetime.utcnow()
    })
    return {"message": "Feedback recorded. Thank you!"}

@router.get("/all")
def list_feedback():
    db = get_db()
    feedbacks = list(db.feedback.find({}, {"_id": 0}))
    return feedbacks
