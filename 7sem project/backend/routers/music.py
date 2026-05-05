import os
from fastapi import APIRouter, HTTPException, Query, Depends
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv
import random
from sqlalchemy.orm import Session
from models import database, feedback

load_dotenv()

router = APIRouter(prefix="/music", tags=["music"])

# Try to initialize Spotify Client
spotify = None
client_id = os.getenv("SPOTIPY_CLIENT_ID")
client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")

if client_id and client_secret:
    try:
        auth_manager = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
        spotify = spotipy.Spotify(auth_manager=auth_manager)
    except Exception as e:
        print(f"Failed to initialize Spotify: {e}")

# Emotion to Audio Features mapping with Genre Pools for Bandit Arms
EMOTION_MAP = {
    "happy": {"target_valence": 0.8, "target_energy": 0.8, "genre_pool": ["pop", "dance", "synth-pop", "disco"]},
    "sad": {"target_valence": 0.2, "target_energy": 0.2, "genre_pool": ["acoustic", "piano", "sad", "indie"]},
    "angry": {"target_valence": 0.2, "target_energy": 0.9, "genre_pool": ["rock", "metal", "punk", "hardcore"]},
    "neutral": {"target_valence": 0.5, "target_energy": 0.5, "genre_pool": ["chill", "ambient", "study", "lo-fi"]},
    "fear": {"target_valence": 0.2, "target_tempo": 80, "genre_pool": ["ambient", "classical", "soundtracks", "drone"]},
    "surprise": {"target_energy": 0.8, "target_tempo": 130, "genre_pool": ["electronic", "techno", "dubstep", "house"]},
}

# Fallback Mock Data
MOCK_DATA = {
    "happy": [{"id": "1", "title": "Walking On Sunshine", "artist": "Katrina & The Waves"}, {"id": "2", "title": "Happy", "artist": "Pharrell Williams"}],
    "sad": [{"id": "3", "title": "Someone Like You", "artist": "Adele"}, {"id": "4", "title": "Fix You", "artist": "Coldplay"}],
    "angry": [{"id": "5", "title": "Break Stuff", "artist": "Limp Bizkit"}, {"id": "6", "title": "Killing In The Name", "artist": "Rage Against The Machine"}],
    "neutral": [{"id": "7", "title": "Weightless", "artist": "Marconi Union"}, {"id": "8", "title": "Clair de Lune", "artist": "Claude Debussy"}],
    "fear": [{"id": "9", "title": "Tubular Bells", "artist": "Mike Oldfield"}, {"id": "10", "title": "Halloween Theme", "artist": "John Carpenter"}],
    "surprise": [{"id": "11", "title": "Bohemian Rhapsody", "artist": "Queen"}, {"id": "12", "title": "Paranoid Android", "artist": "Radiohead"}]
}

@router.get("/recommend-music")
async def recommend_music(emotion: str = Query("neutral"), user_id: int = Query(1), db: Session = Depends(database.get_db)):
    emotion_lower = emotion.lower()
    if emotion_lower not in EMOTION_MAP:
        emotion_lower = "neutral"
        
    features = EMOTION_MAP[emotion_lower]
    genre_pool = features["genre_pool"]
    
    # --- EPSILON-GREEDY BANDIT ALGORITHM ---
    epsilon = 0.2
    chosen_genre = random.choice(genre_pool) # Default random
    
    if random.random() >= epsilon: # Exploit (80% chance)
        # Fetch user feedback for this emotion
        user_feedback = db.query(feedback.Feedback).filter(
            feedback.Feedback.user_id == user_id,
            feedback.Feedback.emotion == emotion_lower
        ).all()
        
        # Calculate scores for each genre
        scores = {g: 0 for g in genre_pool}
        for f in user_feedback:
            if f.genre in scores:
                if f.action == "like":
                    scores[f.genre] += 1
                elif f.action == "repeat":
                    scores[f.genre] += 2
                elif f.action == "skip":
                    scores[f.genre] -= 1
                    
        # Find genre with highest score. If all are 0 or tied, max() picks the first one.
        # So we add a small random tie-breaker.
        best_genre = max(scores.keys(), key=lambda g: (scores[g], random.random()))
        
        # If the best score is strictly greater than 0, use it. Otherwise, random is fine.
        if scores[best_genre] > 0:
            chosen_genre = best_genre

    # ---------------------------------------

    # If Spotify is configured, fetch real data
    if spotify:
        try:
            kwargs = {"seed_genres": [chosen_genre], "limit": 10}
            if "target_valence" in features: kwargs["target_valence"] = features["target_valence"]
            if "target_energy" in features: kwargs["target_energy"] = features["target_energy"]
            if "target_tempo" in features: kwargs["target_tempo"] = features["target_tempo"]
                
            results = spotify.recommendations(**kwargs)
            
            tracks = []
            for track in results['tracks']:
                album_art = track['album']['images'][0]['url'] if track['album']['images'] else ""
                tracks.append({
                    "id": track['id'],
                    "title": track['name'],
                    "artist": ", ".join([artist['name'] for artist in track['artists']]),
                    "album_art": album_art,
                    "preview_url": track['preview_url'],
                    "genre": chosen_genre # Send genre back to frontend for feedback tracking
                })
            return {"source": "spotify", "chosen_genre": chosen_genre, "tracks": tracks}
        except Exception as e:
            print(f"Spotify API error: {e}. Falling back to mock data.")
            
    # Fallback to Mock Data
    mock_tracks = MOCK_DATA.get(emotion_lower, MOCK_DATA["neutral"])
    result_mock = []
    for i in range(10):
        t = mock_tracks[i % len(mock_tracks)].copy()
        t["id"] = f"{t['id']}_{i}"
        t["album_art"] = f"https://via.placeholder.com/300/333/fff?text={chosen_genre}"
        t["preview_url"] = ""
        t["genre"] = chosen_genre
        result_mock.append(t)
    
    random.shuffle(result_mock)
    return {"source": "mock", "chosen_genre": chosen_genre, "tracks": result_mock}

