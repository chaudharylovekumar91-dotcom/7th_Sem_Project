from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models import database, feedback

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.post("/log-mood")
def log_mood(mood_data: feedback.MoodLogCreate, db: Session = Depends(database.get_db)):
    new_log = feedback.MoodLog(
        user_id=mood_data.user_id,
        emotion=mood_data.emotion.lower()
    )
    db.add(new_log)
    db.commit()
    return {"status": "success"}

@router.get("/{user_id}")
def get_analytics(user_id: int, db: Session = Depends(database.get_db)):
    # 1. Mood History
    logs = db.query(feedback.MoodLog).filter(feedback.MoodLog.user_id == user_id).order_by(feedback.MoodLog.timestamp).all()
    
    # Map emotion to positivity score for the line chart
    positivity_map = {
        "happy": 1,
        "surprise": 0.5,
        "neutral": 0,
        "fear": -0.5,
        "sad": -1,
        "angry": -1
    }
    
    mood_history = [
        {
            "time": log.timestamp.strftime("%H:%M"),
            "emotion": log.emotion,
            "positivity": positivity_map.get(log.emotion, 0)
        }
        for log in logs[-50:] # last 50 logs to keep chart clean
    ]

    # 2. Frequent Emotions (Pie Chart)
    emotion_counts = db.query(
        feedback.MoodLog.emotion, 
        func.count(feedback.MoodLog.id)
    ).filter(feedback.MoodLog.user_id == user_id).group_by(feedback.MoodLog.emotion).all()
    
    pie_data = [{"name": e[0], "value": e[1]} for e in emotion_counts]

    # 3. Feedback Stats (Bar Chart)
    feedback_counts = db.query(
        feedback.Feedback.action,
        func.count(feedback.Feedback.id)
    ).filter(feedback.Feedback.user_id == user_id).group_by(feedback.Feedback.action).all()
    
    # Initialize default counts
    action_stats = {"like": 0, "skip": 0, "repeat": 0}
    for action, count in feedback_counts:
        action_stats[action] = count
        
    bar_data = [
        {"name": "Likes", "count": action_stats["like"]},
        {"name": "Skips", "count": action_stats["skip"]},
        {"name": "Repeats", "count": action_stats["repeat"]}
    ]

    return {
        "mood_history": mood_history,
        "frequent_emotions": pie_data,
        "feedback_stats": bar_data
    }
