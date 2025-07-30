# Spanish-Pronunciation-Pro

A web application designed to help users improve their Spanish pronunciation through interactive lessons, real-time feedback, and fun achievements.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Usage](#usage)

---

## Features

- Speech-to-text transcription for Spanish pronunciation using Azure and Whisper
- IPA (International Phonetic Alphabet) transliteration for accurate feedback
- Real-time pronunciation feedback with visual and audio cues
- User authentication and personalized profiles
- Progress tracking, study streaks, and achievements to motivate learning
- Gamified lessons and practice sessions with interactive UI

## Tech Stack

- **Frontend:** React, Vite, JavaScript, Tailwind.CSS, shadcn
- **Backend:** Python FastAPI, Azure/Whisper for speech recognition
- **Database:** Firebase Firestore
- **Other:** Docker, Firebase

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Python (v3.8+)
- Docker (optional, for containerization)
- Firebase account and project (for authentication and Firestore)
- Azure account (for speech-to-text)

### Installation

#### Backend

```bash
cd backend
pip install -r requirements.txt
```

Set up environment variables for Azure/Firebase credentials as needed.

#### Frontend

```bash
cd frontend
npm install
```

### Running the App

#### Backend

```bash
cd backend
python main.py
```

or

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8080
```

#### Frontend

```bash
cd frontend
npm run dev
```

The frontend will typically run on `http://localhost:5173` and the backend on `http://0.0.0.0:8080/`.

## Project Structure

```
Spanish-Pronunciation-Pro/
  backend/
    main.py
    models.py
    requirements.txt
    Dockerfile
    ...
  frontend/
    src/
      App.jsx
      pages/
      components/
      ...
    package.json
    index.html
  README.md
```

## Usage

1. Register or log in to your account on the web app.
2. Select a lesson or practice session from the dashboard.
3. Use the built-in audio recorder to practice pronunciation.
4. Receive instant feedback and IPA transliteration.
5. Track your progress, earn achievements, and maintain your study streak.
6. Adjust your profile and settings as needed.

---