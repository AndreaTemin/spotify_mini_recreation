from pydantic import BaseModel, EmailStr
from typing import List, Optional

# ==================
# Base & Create Models (Input)
# ==================

# Artist
class ArtistBase(BaseModel):
    name: str

class ArtistCreate(ArtistBase):
    pass

# Album
class AlbumBase(BaseModel):
    title: str
    artist_id: int

class AlbumCreate(AlbumBase):
    pass

# Track
class TrackBase(BaseModel):
    title: str
    duration: int
    preview_url: str

class TrackCreate(TrackBase):
    artist_name: str  # We'll use these to find/create artists/albums
    album_name: str   # in the seed script

# Playlist
class PlaylistBase(BaseModel):
    name: str

class PlaylistCreate(PlaylistBase):
    pass

# User
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


# ==================
# Response Models (Output)
# ==================
# These models tell FastAPI how to serialize the data
# from our SQLAlchemy models. `orm_mode = True` is the magic.

class Config:
    from_attributes = True 

# Artist Response
class Artist(ArtistBase):
    id: int
    # We'll add relationships later to avoid circular imports
    # albums: List["Album"] = []
    # tracks: List["Track"] = []

    class Config(Config):
        pass

# Album Response
class Album(AlbumBase):
    id: int
    artist: Artist  # Show nested artist info

    class Config(Config):
        pass

# Track Response
class Track(TrackBase):
    id: int
    artist: Artist
    album: Album

    class Config(Config):
        pass

# User Response
class User(UserBase):
    id: int
    is_active: bool = True # Assuming all users are active
    # playlists: List["Playlist"] = []

    class Config(Config):
        pass

# Playlist Response
class Playlist(PlaylistBase):
    id: int
    user_id: int
    tracks: List[Track] = [] # Show all tracks in the playlist

    class Config(Config):
        pass

# Now we update the models that had commented-out relationships
# to prevent circular dependency errors.

class ArtistWithContent(Artist):
    albums: List[Album] = []
    tracks: List[Track] = []

    class Config(Config):
        pass

class UserWithPlaylists(User):
    playlists: List[Playlist] = []

    class Config(Config):
        pass