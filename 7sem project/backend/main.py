from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, emotion, music, feedback, analytics
from backend.models.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MoodMuse AI API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(emotion.router)
app.include_router(music.router)
app.include_router(feedback.router)
app.include_router(analytics.router)





@app.get("/")
def read_root():
    return {"message": "Welcome to MoodMuse AI Backend!"}

