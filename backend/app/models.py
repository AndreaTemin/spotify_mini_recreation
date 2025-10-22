from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

# Association table for the many-to-many relationship
# between playlists and tracks
playlist_track_association = Table(
    'playlist_track',
    Base.metadata,
    Column('playlist_id', Integer, ForeignKey('playlists.id'), primary_key=True),
    Column('track_id', Integer, ForeignKey('tracks.id'), primary_key=True)
)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    playlists = relationship("Playlist", back_populates="owner")

class Artist(Base):
    __tablename__ = 'artists'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    
    albums = relationship("Album", back_populates="artist")
    tracks = relationship("Track", back_populates="artist")

class Album(Base):
    __tablename__ = 'albums'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    artist_id = Column(Integer, ForeignKey('artists.id'))
    
    artist = relationship("Artist", back_populates="albums")
    tracks = relationship("Track", back_populates="album")

class Track(Base):
    __tablename__ = 'tracks'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    duration = Column(Integer) # in seconds
    preview_url = Column(String, nullable=False)
    
    artist_id = Column(Integer, ForeignKey('artists.id'))
    album_id = Column(Integer, ForeignKey('albums.id'))
    
    artist = relationship("Artist", back_populates="tracks")
    album = relationship("Album", back_populates="tracks")
    
    playlists = relationship(
        "Playlist",
        secondary=playlist_track_association,
        back_populates="tracks"
    )

class Playlist(Base):
    __tablename__ = 'playlists'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))
    
    owner = relationship("User", back_populates="playlists")
    tracks = relationship(
        "Track",
        secondary=playlist_track_association,
        back_populates="playlists"
    )