
import json
from pathlib import Path
from sqlalchemy.orm import Session
from app import crud, schemas

DATA_FILE = Path(__file__).parent.parent / "data/tracks.json"

def seed_db(db: Session):
    try:
        with open(DATA_FILE, "r") as f:
            tracks_data = json.load(f)
    except FileNotFoundError:
        print(f"Seed data file not found at {DATA_FILE}")
        return 0

    count = 0
    for item in tracks_data:
        track_in = schemas.TrackCreate(**item)

        # Check if track with this title already exists
        existing_track = db.query(models.Track).filter(models.Track.title == track_in.title).first()
        if not existing_track:
            crud.create_track(db, track=track_in)
            count += 1

    return count