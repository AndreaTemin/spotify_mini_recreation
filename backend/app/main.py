from fastapi import FastAPI
from app.database import engine
from app import models
from app.routers import auth, tracks, playlists # Import the new routers

# This command tells SQLAlchemy to create all tables
# based on the models we defined.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Spotify-ish Mini App")

# Include the routers
app.include_router(auth.router, tags=["Auth"])
app.include_router(tracks.router)
app.include_router(playlists.router)


@app.get("/", tags=["Health"])
def read_root():
    """A simple health check endpoint."""
    return {"status": "ok", "message": "Welcome to Spotify-ish"}

# Optional: Add a seeding endpoint (for dev only)
# We can remove this later.
@app.post("/seed-db", tags=["Dev"])
def seed_database(db: Session = Depends(get_db)):
    """
    (Dev only) Seed the database with sample data.
    """
    # This is a simple implementation.
    # In a real app, you'd use a more robust script.
    try:
        from app.seed import seed_db
        count = seed_db(db)
        return {"message": f"Database seeded successfully with {count} tracks."}
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error seeding database: {str(e)}"
        )