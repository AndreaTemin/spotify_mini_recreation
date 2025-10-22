from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas
from app.database import get_db

router = APIRouter(
    prefix="/tracks",  # All paths in this router will start with /tracks
    tags=["Tracks"],   # Group these in the OpenAPI docs
)

@router.get("/", response_model=List[schemas.Track])
def read_tracks(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of all tracks in the catalog.
    """
    tracks = crud.get_tracks(db, skip=skip, limit=limit)
    return tracks


@router.get("/search", response_model=List[schemas.Track])
def search_for_tracks(
    q: str = Query(..., min_length=3, description="Search term for track title or artist name"),
    db: Session = Depends(get_db)
):
    """
    Search for tracks by title or artist name.
    """
    tracks = crud.search_tracks(db, q=q)
    return tracks


@router.get("/{track_id}", response_model=schemas.Track)
def read_track(track_id: int, db: Session = Depends(get_db)):
    """
    Get details for a single track.
    """
    db_track = crud.get_track(db, track_id=track_id)
    if db_track is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Track not found"
        )
    return db_track