from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import database, feedback

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.post("/", response_model=feedback.FeedbackResponse)
def create_feedback(feedback_data: feedback.FeedbackCreate, db: Session = Depends(database.get_db)):
    if feedback_data.action not in ["like", "skip", "repeat"]:
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'like', 'skip', or 'repeat'.")
    
    new_feedback = feedback.Feedback(
        user_id=feedback_data.user_id,
        song_id=feedback_data.song_id,
        genre=feedback_data.genre,
        emotion=feedback_data.emotion.lower(),
        action=feedback_data.action
    )
    
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    
    return {"id": new_feedback.id, "status": "success"}
