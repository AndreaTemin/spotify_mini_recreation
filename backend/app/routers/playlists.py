from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas, models, auth
from app.database import get_db

router = APIRouter(
    prefix="/playlists",
    tags=["Playlists"],
    dependencies=[Depends(auth.get_current_user)] # Protect ALL routes in this router
)

@router.post("/", response_model=schemas.Playlist, status_code=status.HTTP_201_CREATED)
def create_playlist(
    playlist: schemas.PlaylistCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Create a new playlist for the current user.
    """
    return crud.create_playlist(db=db, playlist=playlist, user_id=current_user.id)


@router.get("/", response_model=List[schemas.Playlist])
def read_user_playlists(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Get all playlists for the currently logged-in user.
    """
    return crud.get_playlists(db=db, user_id=current_user.id)


@router.put("/{playlist_id}", response_model=schemas.Playlist)
def update_playlist_name(
    playlist_id: int,
    playlist_update: schemas.PlaylistCreate, # We re-use the Create schema for the 'name' field
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Rename a playlist.
    """
    db_playlist = crud.get_playlist(db, playlist_id)
    if not db_playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if db_playlist.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this playlist")
    
    return crud.rename_playlist(db, playlist=db_playlist, new_name=playlist_update.name)


@router.delete("/{playlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_playlist(
    playlist_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Delete a playlist.
    """
    db_playlist = crud.get_playlist(db, playlist_id)
    if not db_playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if db_playlist.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this playlist")
        
    crud.delete_playlist(db, playlist=db_playlist)
    return {"ok": True} # Body won't actually be sent due to 204 status


# ==================
# Manage Playlist Tracks
# ==================

@router.post("/{playlist_id}/tracks/{track_id}", response_model=schemas.Playlist)
def add_track_to_playlist(
    playlist_id: int,
    track_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Add a track to a playlist.
    """
    db_playlist = crud.get_playlist(db, playlist_id)
    if not db_playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if db_playlist.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_track = crud.get_track(db, track_id)
    if not db_track:
        raise HTTPException(status_code=404, detail="Track not found")

    return crud.add_track_to_playlist(db, playlist=db_playlist, track=db_track)


@router.delete("/{playlist_id}/tracks/{track_id}", response_model=schemas.Playlist)
def remove_track_from_playlist(
    playlist_id: int,
    track_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Remove a track from a playlist.
    """
    db_playlist = crud.get_playlist(db, playlist_id)
    if not db_playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if db_playlist.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_track = crud.get_track(db, track_id)
    if not db_track:
        raise HTTPException(status_code=404, detail="Track not found")

    return crud.remove_track_from_playlist(db, playlist=db_playlist, track=db_track)