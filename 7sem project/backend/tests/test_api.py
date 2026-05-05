import pytest
from fastapi.testclient import TestClient
from backend.main import app
from models.database import Base, engine
from io import BytesIO

# Setup Test Database (in-memory sqlite can be used, but we'll just use the existing one or mock for this example)
# For simplicity in this scaffold, we'll hit the app directly. 
# Warning: This will write to the configured DATABASE_URL. In a real scenario, use a test DB.

client = TestClient(app)

def test_auth_register_success():
    response = client.post(
        "/auth/register",
        json={"username": "testuser_pytest", "password": "testpassword123"}
    )
    # 201 Created or 400 if it already exists (we accept both to allow repeated test runs)
    assert response.status_code in [201, 400]

def test_auth_register_duplicate():
    client.post("/auth/register", json={"username": "testuser_pytest", "password": "testpassword123"})
    response = client.post("/auth/register", json={"username": "testuser_pytest", "password": "testpassword123"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already registered"

def test_auth_login_success():
    response = client.post(
        "/auth/login",
        data={"username": "testuser_pytest", "password": "testpassword123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_auth_login_invalid():
    response = client.post(
        "/auth/login",
        data={"username": "testuser_pytest", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_detect_emotion_missing_file():
    response = client.post("/emotion/detect-emotion")
    # Missing form data 'file'
    assert response.status_code == 422 

def test_detect_emotion_invalid_file_type():
    file_content = b"not an image"
    response = client.post(
        "/emotion/detect-emotion",
        files={"file": ("test.txt", BytesIO(file_content), "text/plain")}
    )
    # The endpoint might fail at cv2.imdecode
    assert response.status_code in [400, 500]

def test_recommend_music_valid_emotion():
    response = client.get("/music/recommend-music?emotion=happy&user_id=1")
    assert response.status_code == 200
    data = response.json()
    assert "tracks" in data
    assert len(data["tracks"]) == 10

def test_recommend_music_invalid_fallback():
    response = client.get("/music/recommend-music?emotion=notanemotion&user_id=1")
    assert response.status_code == 200
    data = response.json()
    assert "tracks" in data
    # Should fallback to neutral pool
    assert data["chosen_genre"] in ["chill", "ambient", "study", "lo-fi"]

def test_post_feedback_success():
    response = client.post(
        "/feedback/",
        json={"user_id": 1, "song_id": "test_song_1", "genre": "pop", "emotion": "happy", "action": "like"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_post_feedback_invalid_action():
    response = client.post(
        "/feedback/",
        json={"user_id": 1, "song_id": "test_song_1", "genre": "pop", "emotion": "happy", "action": "dislike"}
    )
    assert response.status_code == 400

def test_analytics_log_mood():
    response = client.post(
        "/analytics/log-mood",
        json={"user_id": 1, "emotion": "happy"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_analytics_get_dashboard():
    response = client.get("/analytics/1")
    assert response.status_code == 200
    data = response.json()
    assert "mood_history" in data
    assert "frequent_emotions" in data
    assert "feedback_stats" in data
