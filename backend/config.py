import os

# MongoDB Config
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "beingbulls"
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# SMTP Config
SMTP_SENDER = os.getenv("SMTP_SENDER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp-relay.brevo.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

# JWT & Security
JWT_SECRET = os.getenv("JWT_SECRET", "beingbullssecret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_SECONDS = 86400  # 1 day

# Razorpay (optional for backend use)
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_4m8sOLItBTRWyF")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "d1FAujWM7x9oijj2k7dmHsgX")
