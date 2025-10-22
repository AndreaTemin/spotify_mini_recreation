Spotify-ish Mini AppThis project is a small-scale clone of Spotify built as a take-home assignment. It allows users to browse a music catalog, search for tracks, manage playlists, and play 30-second audio previews. The entire application is containerized using Docker.GoalThe primary goal was to build a functional web application with a React frontend and a Python backend, demonstrating full-stack development skills within a containerized environment, based on the requirements provided in spotify_mini_app_take_home_docker_react_fast_api(1).md[1].pdf.Tech StackFrontend: React (Vite) with TypeScriptBackend: Python with FastAPIDatabase: PostgreSQLAPI: RESTful JSON APIAuthentication: JWT (JSON Web Tokens) managed via HTTP Headers (Authorization: Bearer <token>)Containerization: Docker & Docker ComposeBackend Package Management: uvORM: SQLAlchemy (with psycopg for Postgres connection)Schema Validation: PydanticPassword Hashing: passlib with bcryptFeatures ImplementedUser Authentication:User registration (/register) with email and password.User login (/token) using form data, generating a JWT.Persistent login state using localStorage on the frontend.Protected backend routes requiring a valid JWT.Protected frontend routes redirecting unauthenticated users to /login.Display current user email and logout functionality in the UI.Catalog Browsing:Display a list of all available tracks (/tracks/) with artist and album information on the home page.Track Search:Search tracks by title or artist name (/tracks/search?q=...) via a search bar on the home page (case-insensitive backend search).Playlist Management:Create new playlists (POST /playlists/) via a form on the home page.View all playlists belonging to the logged-in user (GET /playlists/) on the home page.Add tracks to a selected playlist (POST /playlists/{playlist_id}/tracks/{track_id}) via a dropdown selector next to each track.View the contents of a specific playlist (GET /playlists/{playlist_id}) on a dedicated page (/playlist/:id). Playlist names on the home page link to this view.Remove tracks from a playlist (DELETE /playlists/{playlist_id}/tracks/{track_id}) using a button on the playlist detail page (with optimistic UI update).Audio Preview:Play/Pause 30-second audio previews for tracks using the browser's native <audio> element, controlled via buttons on the home page. Audio files are served from frontend/public/assets/audio/.Database Seeding:Initial track data is loaded from backend/data/tracks.json.A POST /seed-db backend endpoint allows populating the database with sample tracks, artists, and albums, avoiding duplicates.API Documentation:Automatic OpenAPI (Swagger UI) documentation available at /docs.Automatic ReDoc documentation available at /redoc.CORS:Backend configured to allow requests from the frontend origin (http://localhost:5173).Project Structurespotify_project/
├── backend/            # FastAPI application
│   ├── app/            # Main Python package
│   │   ├── core/       # Configuration (config.py)
│   │   ├── routers/    # API endpoint definitions (auth.py, playlists.py, tracks.py)
│   │   ├── __init__.py
│   │   ├── auth.py     # Auth logic (password hashing, JWT creation, dependency)
│   │   ├── crud.py     # Database interaction functions
│   │   ├── database.py # DB engine & session setup
│   │   ├── main.py     # FastAPI app entrypoint, middleware, router includes
│   │   ├── models.py   # SQLAlchemy table models
│   │   ├── schemas.py  # Pydantic data validation models
│   │   └── seed.py     # Database seeding script logic
│   ├── data/           # Seed data (tracks.json)
│   ├── .dockerignore
│   ├── Dockerfile      # Backend Docker image definition (using uv)
│   └── requirements.in # Python dependencies list for uv
├── frontend/           # React application (Vite + TypeScript)
│   ├── public/         # Static assets (including /assets/audio/)
│   ├── src/            # React source code
│   │   ├── api/        # Axios API client setup (axios.ts)
│   │   ├── assets/     # Vite assets
│   │   ├── components/ # Reusable React components (Layout.tsx, ProtectedRoute.tsx, PlaylistSelector.tsx)
│   │   ├── context/    # AuthContext for global state (AuthContext.tsx)
│   │   ├── pages/      # Page components (HomePage.tsx, LoginPage.tsx, RegisterPage.tsx, PlaylistPage.tsx)
│   │   ├── App.css     # Minimal CSS (currently empty)
│   │   ├── App.tsx     # Main routing setup using react-router-dom
│   │   ├── index.css   # Global CSS styling
│   │   ├── main.tsx    # React app entrypoint (renders App within AuthProvider and BrowserRouter)
│   │   └── vite-env.d.ts # TypeScript definitions for Vite env variables
│   ├── .dockerignore
│   ├── Dockerfile      # Frontend Docker image definition (using Node 20)
│   ├── index.html      # Main HTML file
│   ├── package.json    # Node.js dependencies and scripts
│   ├── tsconfig.json   # TypeScript compiler options
│   ├── tsconfig.node.json # TypeScript config for Node environment (Vite config)
│   └── vite.config.ts  # Vite configuration (server settings for Docker)
├── docker-compose.yml  # Docker Compose file to orchestrate db, backend, frontend services
└── README.md           # This file

Setup and Running the ApplicationPrerequisites:Docker installed and running.Docker Compose installed.Git installed.Steps:Clone the repository:git clone <your-repository-url>
cd spotify_project

Build and Run with Docker Compose:This command will:Build the Docker images for the frontend and backend based on their respective Dockerfiles.Create and start containers for the PostgreSQL database (db), backend API (backend), and frontend dev server (frontend).Set up necessary networking and volumes (including persistent storage for the database and virtual environment).The -d flag runs the containers in the background.docker-compose up -d --build

Note: The first build might take several minutes. Subsequent builds will be faster due to Docker's caching.The backend service includes a healthcheck dependency, ensuring it waits for the db service to be fully ready before attempting to connect.Access the Application:Frontend (React App): Open your browser and navigate to http://localhost:5173Backend API Docs (Swagger UI): Open http://localhost:8000/docsSeed the Database (Important First Step!):Before using the app, you need to populate the database with sample track data.Navigate to the backend API docs: http://localhost:8000/docsScroll down to the "Dev" section and find the green POST /seed-db endpoint.Click on it to expand, then click the "Try it out" button.Click the large blue "Execute" button.You should receive a 200 OK response with a JSON body like {"message":"Database seeded successfully with X tracks."}. If you encounter errors, check the backend logs (docker-compose logs backend).Usage GuideRegister: Navigate to http://localhost:5173/register. Enter a valid email and a password, then click "Register".Login: You'll be redirected to http://localhost:5173/login. Enter the credentials you just created and click "Login".Home Page: Upon successful login, you'll land on the home page (/). Here you can:See your playlists on the left.See all available tracks on the right.Use the search bar to filter tracks by title or artist (press Enter or click Search).Click "Play" / "Pause" to listen to the 30-second preview.Create a new playlist using the form on the left.Add a track to one of your playlists using the dropdown selector next to the track.View Playlist: Click on any playlist name in the "My Playlists" list.Playlist Detail Page: (/playlist/:id)View all tracks currently in that playlist.Click the "Remove" button to remove a track from the playlist.Click "Back to Home" to return to the main page.Logout: Click the "Logout" button in the top navigation bar to end your session and return to the login page.Stopping the ApplicationTo stop all running containers, navigate to the spotify_project directory in your terminal and run:docker-compose down

To stop and also remove the database volume (deleting all users, playlists, etc.), use:docker-compose down -v

API DocumentationThe backend FastAPI application automatically generates interactive API documentation. You can access it via your browser when the containers are running:Swagger UI: http://localhost:8000/docsReDoc: http://localhost:8000/redocThese interfaces allow you to explore all available endpoints, view their expected request/response schemas, and even send test requests directly to the API.Potential Next Steps & ImprovementsPlaylist CRUD: Implement renaming and deleting playlists (requires backend endpoints and frontend UI).Track Details: Create a dedicated page (/track/:id) accessible by clicking a track title.Search UX: Implement debouncing or live search instead of requiring button click/Enter.UI Polish: Improve overall styling, add loading indicators for asynchronous actions (like adding/removing tracks), potentially use a UI component library.Error Handling: Provide more user-friendly error messages on the frontend.State Management: For larger applications, consider a dedicated state management library (like Zustand or Redux Toolkit) instead of just Context for auth.Testing:Backend: Add unit/integration tests using pytest and FastAPI's TestClient.Frontend: Add component tests using Vitest/React Testing Library and potentially end-to-end tests using Playwright or Cypress.CI/CD: Implement a GitHub Actions workflow to automatically lint, test, and potentially build Docker images on code push.Production Deployment: Create production-ready Dockerfiles (multi-stage builds, non-dev servers like gunicorn for backend, nginx for frontend static files). Use a separate docker-compose.prod.yml.