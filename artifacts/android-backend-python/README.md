# Android Backend (Production Stack)

FastAPI production backend for Android app using:

- Google OAuth 2.0
- Firestore
- Tesseract OCR + OpenCV preprocessing
- RapidFuzz medicine matching
- APScheduler
- Firebase Cloud Messaging
- JWT auth

## Run

```bash
cd artifacts/android-backend-python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Required Environment Variables

```bash
export JWT_SECRET="your-strong-secret"
export GOOGLE_CLIENT_ID="google-oauth-web-client-id"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/firebase-service-account.json"
```

## Implemented Endpoints

- `POST /auth/google`
- `POST /auth/device-token`
- `POST /caregiver/link`
- `POST /ocr/extract` (multipart image)
- `POST /prescriptions/process`
- `POST /dose-events`
- `POST /risk/analyze`
- `POST /alerts/intelligent`
- `POST /emergency/trigger`
- `GET /sync/timeline/{patient_id}`
- `POST /assistant/chat`
- `GET /medicines`
- `GET /location/nearby`

## Two-part Delivery Plan

- Part 1 (done): production stack migration + secure API foundations + feature endpoints.
- Part 2 (next): full hardening for Play Store readiness (rate limits, audits, retries, idempotency, observability, CI tests, deployment manifest).
