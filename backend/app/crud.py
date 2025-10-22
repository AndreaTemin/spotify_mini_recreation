from sqlalchemy.orm import Session
from sqlalchemy import or_
from app import models, schemas

# ==================
# User CRUD
# ==================
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ==================
# Track/Catalog CRUD
# ==================
def get_track(db: Session, track_id: int):
    return db.query(models.Track).filter(models.Track.id == track_id).first()

def get_tracks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Track).offset(skip).limit(limit).all()

def search_tracks(db: Session, q: str):
    search_query = f"%{q}%"
    return db.query(models.Track).join(models.Artist).filter(
        or_(
            models.Track.title.ilike(search_query),
            models.Artist.name.ilike(search_query)
        )
    ).all()

# ==================
# Playlist CRUD
# ==================
def get_playlists(db: Session, user_id: int):
    return db.query(models.Playlist).filter(models.Playlist.user_id == user_id).all()

def get_playlist(db: Session, playlist_id: int):
    return db.query(models.Playlist).filter(models.Playlist.id == playlist_id).first()

def create_playlist(db: Session, playlist: schemas.PlaylistCreate, user_id: int):
    db_playlist = models.Playlist(**playlist.dict(), user_id=user_id)
    db.add(db_playlist)
    db.commit()
    db.refresh(db_playlist)
    return db_playlist

def rename_playlist(db: Session, playlist: models.Playlist, new_name: str):
    playlist.name = new_name
    db.commit()
    db.refresh(playlist)
    return playlist

def delete_playlist(db: Session, playlist: models.Playlist):
    db.delete(playlist)
    db.commit()

def add_track_to_playlist(db: Session, playlist: models.Playlist, track: models.Track):
    # Check if track is already in playlist
    if track not in playlist.tracks:
        playlist.tracks.append(track)
        db.commit()
        db.refresh(playlist)
    return playlist

def remove_track_from_playlist(db: Session, playlist: models.Playlist, track: models.Track):
    if track in playlist.tracks:
        playlist.tracks.remove(track)
        db.commit()
        db.refresh(playlist)
    return playlist

# ==================
# Seed Script Helpers
# ==================
def get_or_create_artist(db: Session, artist_name: str):
    artist = db.query(models.Artist).filter(models.Artist.name == artist_name).first()
    if not artist:
        artist = models.Artist(name=artist_name)
        db.add(artist)
        db.commit()
        db.refresh(artist)
    return artist

def get_or_create_album(db: Session, album_name: str, artist_id: int):
    album = db.query(models.Album).filter(
        models.Album.title == album_name,
        models.Album.artist_id == artist_id
    ).first()
    if not album:
        album = models.Album(title=album_name, artist_id=artist_id)
        db.add(album)
        db.commit()
        db.refresh(album)
    return album

def create_track(db: Session, track: schemas.TrackCreate):
    artist = get_or_create_artist(db, artist_name=track.artist_name)
    album = get_or_create_album(db, album_name=track.album_name, artist_id=artist.id)
    
    db_track = models.Track(
        title=track.title,
        duration=track.duration,
        preview_url=track.preview_url,
        artist_id=artist.id,
        album_id=album.id
    )
    db.add(db_track)
    db.commit()
    db.refresh(db_track)
    return db_track