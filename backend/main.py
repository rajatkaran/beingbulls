from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import scan, feedback, auth, payment  # sirf ye import karo
from ai.pattern_utils import detect_all_patterns, calculate_ema

app = FastAPI(
    title="BeingBulls API",
    description="Real-time chart pattern recognition engine 🧠", 
    version="1.0.0"
)

# Enable CORS for Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 Lock this down in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(scan.router, prefix="/scan", tags=["Pattern Scan"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
app.include_router(payment.router, prefix="/payment", tags=["Payments"])  # ✅ Razorpay

# Default route
@app.get("/")
def root():
    return {"message": "BeingBulls backend is live 🚀"}

