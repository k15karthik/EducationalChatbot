from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.base import engine, Base
from app.api import auth, users, exams, lessons

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EduChatbot API",
    description="Backend API for Educational Chatbot",
    version="1.0.0"
)

# CORS middleware (allow Next.js frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(exams.router)
app.include_router(lessons.router)

@app.get("/")
def root():
    return {"message": "EduChatbot API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
