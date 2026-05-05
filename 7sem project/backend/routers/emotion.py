from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
import cv2
import numpy as np
from deepface import DeepFace
from transformers import pipeline

router = APIRouter(prefix="/emotion", tags=["emotion"])

# Load HuggingFace text sentiment model globally
text_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

@router.post("/detect-emotion")
async def detect_emotion(
    file: UploadFile = File(...),
    text: Optional[str] = Form(None)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # 1. PROCESS IMAGE (DEEPFACE)
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        face_result = DeepFace.analyze(
            img_path=img,
            actions=['emotion'],
            enforce_detection=False,
            silent=True
        )
        
        if isinstance(face_result, list):
            face_result = face_result[0]
            
        face_emotions = face_result.get('emotion', {})
        
        # 2. PROCESS TEXT (HUGGINGFACE)
        text_sentiment = None
        text_scores = {k: 0.0 for k in ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']}
        
        if text and text.strip():
            hf_result = text_analyzer(text)[0] # e.g., {'label': 'POSITIVE', 'score': 0.99}
            text_sentiment = hf_result
            score_percent = hf_result['score'] * 100
            
            # Map text sentiment to deepface categories
            if hf_result['label'] == 'POSITIVE':
                text_scores['happy'] = score_percent
            elif hf_result['label'] == 'NEGATIVE':
                text_scores['sad'] = score_percent

        # 3. COMBINE (60% Face, 40% Text)
        combined_scores = {}
        for emotion in text_scores.keys():
            face_score = face_emotions.get(emotion, 0.0)
            text_score = text_scores.get(emotion, 0.0)
            
            # If text was provided, use 60/40 split. Otherwise, 100% face.
            if text and text.strip():
                combined_scores[emotion] = (face_score * 0.6) + (text_score * 0.4)
            else:
                combined_scores[emotion] = face_score
                
        # Find the new dominant emotion
        dominant_emotion = max(combined_scores, key=combined_scores.get)
        
        return {
            "dominant_emotion": dominant_emotion,
            "face_dominant": face_result.get('dominant_emotion', 'neutral'),
            "text_sentiment": text_sentiment,
            "combined_scores": combined_scores
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

