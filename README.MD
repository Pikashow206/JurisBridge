<div align="center">

# <i class="fa-solid fa-scale-balanced"></i> LexBridge AI

### AI-Powered Legal Assistance & Lawyer Consultation Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://mongodb.com/)

> **Bridging the gap between citizens and legal expertise — instantly, intelligently, and affordably.**

</div>

---

## :scroll: Table of Contents

- [:bulb: Overview](#-overview)
- [:warning: Problem Statement](#-problem-statement)
- [:sparkles: Key Features](#-key-features)
- [:hammer_and_wrench: Tech Stack](#-tech-stack)
- [:link: API Integrations](#-api-integrations)
- [:arrows_counterclockwise: AI Fallback Architecture](#-ai-fallback-architecture)
- [:classical_building: System Architecture](#-system-architecture)
- [:motorway: API Routes](#-api-routes)
- [:open_file_folder: Folder Structure](#-folder-structure)
- [:lock: Environment Variables](#-environment-variables)
- [:rocket: Getting Started](#-getting-started)
- [:crystal_ball: Future Enhancements](#-future-enhancements)
- [:page_with_curl: License](#-license)

---

## :bulb: Overview

**LexBridge AI** is a full-stack MERN legal-tech platform designed to make legal assistance **accessible, affordable, and intelligent**.

The system combines **Artificial Intelligence** with **professional lawyer consultation** to help users:

- :mag: Understand legal issues in plain language
- :page_facing_up: Analyze legal documents instantly
- :memo: Generate formal legal notices
- :busts_in_silhouette: Discover specialized lawyers nearby
- :card_index_dividers: Manage legal cases and evidence
- :speech_balloon: Communicate with lawyers in real time

Users can interact via **text or voice**, in **English or Hindi**, making it accessible to millions of non-English speakers.

---

## :warning: Problem Statement

Access to legal help remains out of reach for many citizens due to:

| Challenge | Impact |
|---|---|
| :moneybag: High consultation fees | Unaffordable for common citizens |
| :no_entry: Lack of legal awareness | Rights go unexercised |
| :mag_right: Hard to find specialists | Wrong legal guidance |
| :scroll: Complex documentation | Intimidating paperwork |
| :hourglass: Slow consultation | Justice delayed |
| :globe_with_meridians: Language barriers | Exclusion of non-English speakers |

> Most legal platforms are built **for professionals**, not ordinary citizens. **LexBridge AI** changes that.

---

## :sparkles: Key Features

### :robot: AI Legal Assistant *(English & Hindi)*

Users describe their legal problem in **plain language** and receive:

- :books: Legal explanations with relevant laws and sections
- :triangular_ruler: Possible legal options and strategies
- :rotating_light: Risk warnings and red flags
- :footprints: Suggested next steps
- :arrows_counterclockwise: Automatic escalation to lawyers when needed

---

### :microphone: Voice Interaction

Full voice-powered legal assistance:

- :sound: Speech-to-text via **Web Speech API**
- :loud_sound: Text-to-speech via **Google TTS / ElevenLabs**
- :globe_with_meridians: Hindi and English voice responses
- :brain: Automatic language detection

> Designed for rural users and people unfamiliar with typing.

---

### :earth_asia: Multilingual Support

| Feature | :gb: English | :india: Hindi |
|---|:---:|:---:|
| User Queries | :white_check_mark: | :white_check_mark: |
| AI Responses | :white_check_mark: | :white_check_mark: |
| Document Analysis | :white_check_mark: | :white_check_mark: |
| Voice Assistant | :white_check_mark: | :white_check_mark: |

Frontend translations powered by **i18next**.

---

### :arrows_counterclockwise: Multi-Provider AI Fallback

Reliability through a cascading AI architecture:

```
Claude API  (Primary)
     │
     └──► OpenAI API  (Fallback 1)
               │
               └──► Google Gemini API  (Fallback 2)
                          │
                          └──► Trigger Lawyer Consultation
```

---

### :classical_building: Lawyer Marketplace

Find verified lawyers by specialization:

| :label: Category | :label: Category |
|---|---|
| :police_car: Criminal Law | :office: Corporate Law |
| :family_man_woman_girl_boy: Family Law | :hammer: Civil Litigation |
| :computer: Cyber Law | :house: Property Law |
| :briefcase: Employment Law | :registered: Intellectual Property |

Each lawyer profile includes: **experience · fee · rating · availability · location**

---

### :bell: Smart Lawyer Notification System

When AI confidence is low, the system automatically:

1. :label: Categorizes the legal issue
2. :mag: Finds matching lawyers
3. :envelope: Sends email alerts via **SendGrid**
4. :iphone: Sends SMS via **Twilio**
5. :handshake: Lawyers accept or decline the consultation

---

### :bar_chart: Lawyer Dashboard

A dedicated portal for lawyers to:

- :inbox_tray: View and manage consultation requests
- :white_check_mark: Accept or reject cases
- :speech_balloon: Chat with clients in real time
- :page_facing_up: Review uploaded documents
- :card_index_dividers: Manage ongoing cases

---

### :page_facing_up: AI Legal Document Analyzer

Upload any legal document and get:

- :memo: Plain language summary
- :rotating_light: Risk indicators and red flags
- :mag: Clause-by-clause explanation
- :scales: Potential legal implications

**Supported formats:** Contracts · Agreements · Legal Notices · Property Documents

---

### :receipt: AI Legal Notice Generator

Generate formal legal notices in minutes:

The system collects → **sender details · recipient details · incident description · legal claim · resolution demanded**

AI generates a structured notice with:

- :label: Subject and dispute description
- :hammer: Legal demand and deadline
- :pen: Signature section

**Export options:** :arrow_down: Download as PDF · :floppy_disk: Save to case · :handshake: Send to lawyer for review

> :warning: **Disclaimer:** AI-generated notices are drafts and should be reviewed by a qualified lawyer before use.

---

### :card_index_dividers: Evidence Management System

Securely upload and organize case evidence:

| :file_folder: File Type | :lock: Storage |
|---|---|
| :framed_picture: Images | Cloudinary |
| :page_facing_up: PDFs | Cloudinary |
| :headphones: Audio | Cloudinary |
| :spiral_notepad: Documents | Cloudinary |

**Extras:** Case-based organization · Evidence timeline · Optional **SHA256** integrity hashing

---

### :speech_balloon: Real-Time Lawyer Chat

Once a lawyer accepts a case, users get instant messaging powered by **Socket.io** — no delays, no waiting.

---

### :calendar: Case Timeline

Every case maintains a full activity log:

- :handshake: Consultation requests
- :page_facing_up: Document uploads
- :card_index_dividers: Evidence submissions
- :speech_balloon: Lawyer responses

---

## :hammer_and_wrench: Tech Stack

| Layer | Technology |
|---|---|
| :computer: Frontend | React.js |
| :art: Styling | Tailwind CSS |
| :gear: Backend | Node.js, Express.js |
| :card_index_dividers: Database | MongoDB |
| :lock: Auth | JWT + bcrypt |
| :zap: Real-Time | Socket.io |
| :cloud: Storage | Cloudinary |
| :microphone: Voice Input | Web Speech API |
| :loud_sound: Voice Output | Google TTS / ElevenLabs |
| :globe_with_meridians: i18n | i18next |

---

## :link: API Integrations

| API | Purpose |
|---|---|
| :robot: Claude API | Primary AI assistant |
| :brain: OpenAI API | AI fallback #1 |
| :sparkles: Google Gemini API | AI fallback #2 |
| :iphone/android: Twilio API | SMS notifications |
| :envelope: SendGrid API | Email alerts |
| :cloud: Cloudinary API | File & media storage |
| :loud_sound: Google TTS | Voice responses |
| :microphone: ElevenLabs | Premium voice synthesis |
| :round_pushpin: Mapbox / Google Maps | Location services |

---

## :arrows_counterclockwise: AI Fallback Architecture

```
                    User Query
                        │
                        ▼
                  ┌─────────────┐
                  │  Claude API │ ◄── Primary
                  └──────┬──────┘
                         │
              ┌──────────▼──────────┐
              │  Success? → Return  │
              └──────────┬──────────┘
                         │ Failure
                         ▼
                  ┌─────────────┐
                  │ OpenAI API  │ ◄── Fallback 1
                  └──────┬──────┘
                         │
              ┌──────────▼──────────┐
              │  Success? → Return  │
              └──────────┬──────────┘
                         │ Failure
                         ▼
                  ┌─────────────┐
                  │ Gemini API  │ ◄── Fallback 2
                  └──────┬──────┘
                         │
              ┌──────────▼──────────┐
              │  Success? → Return  │
              └──────────┬──────────┘
                         │ All Failed
                         ▼
              ┌────────────────────┐
              │ Lawyer Consultation│
              └────────────────────┘
```

---

## :classical_building: System Architecture

```
     React Frontend
           │
           ▼
    Express Backend
           │
           ▼
     Service Layer
    ┌──────┴──────────────────────────────────┐
    │                                          │
    ▼              ▼             ▼             ▼
AI Service   Notification   File Storage  Case Mgmt
(Claude →    (Twilio +      (Cloudinary)  Service
OpenAI →     SendGrid)
Gemini)
    │
    └──────────────┐
                   ▼
            MongoDB Database
```

---

## :motorway: API Routes

<details>
<summary><strong>:lock: Authentication</strong></summary>

```http
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

</details>

<details>
<summary><strong>:robot: AI Assistant</strong></summary>

```http
POST   /api/ai/query
POST   /api/ai/query/voice
POST   /api/ai/analyze-document
POST   /api/ai/generate-legal-notice
POST   /api/ai/generate-legal-notice/pdf
GET    /api/ai/history
DELETE /api/ai/history/:id
```

</details>

<details>
<summary><strong>:classical_building: Lawyers</strong></summary>

```http
GET    /api/lawyers
GET    /api/lawyers/:id
GET    /api/lawyers/nearby
GET    /api/lawyers/specialization/:type
PUT    /api/lawyers/profile
```

</details>

<details>
<summary><strong>:card_index_dividers: Cases</strong></summary>

```http
POST   /api/cases
GET    /api/cases
GET    /api/cases/:id
PUT    /api/cases/:id
DELETE /api/cases/:id
```

</details>

<details>
<summary><strong>:file_folder: Evidence</strong></summary>

```http
POST   /api/evidence/upload
GET    /api/evidence/case/:caseId
DELETE /api/evidence/:id
```

</details>

<details>
<summary><strong>:handshake: Consultations</strong></summary>

```http
POST   /api/consultations/request
GET    /api/consultations
PUT    /api/consultations/:id/accept
PUT    /api/consultations/:id/decline
```

</details>

<details>
<summary><strong>:speech_balloon: Chat</strong></summary>

```http
GET    /api/chat/conversations
POST   /api/chat/send
DELETE /api/chat/message/:id
```

</details>

---

## :open_file_folder: Folder Structure

```
lexbridge-ai/
│
├── :open_file_folder: client/
│   ├── public/
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Route-level pages
│       ├── services/          # API call functions
│       ├── hooks/             # Custom React hooks
│       ├── context/           # Global state (Context API)
│       ├── utils/             # Helper utilities
│       └── locales/           # i18n translation files
│
└── :open_file_folder: server/
    ├── controllers/           # Route handler logic
    ├── routes/                # Express route definitions
    ├── models/                # Mongoose schemas
    ├── middleware/            # Auth, error handling
    ├── services/              # AI, notifications, storage
    ├── sockets/               # Socket.io event handlers
    ├── config/                # DB and app config
    └── utils/                 # Shared utilities
```

---

## :lock: Environment Variables

Create a `.env` file in the `/server` directory:

```env
# ── Server ──────────────────────────────
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# ── AI Providers ─────────────────────────
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# ── Voice ────────────────────────────────
GOOGLE_TTS_API_KEY=your_google_tts_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# ── Notifications ────────────────────────
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
SENDGRID_API_KEY=your_sendgrid_key

# ── Storage ──────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# ── Maps ─────────────────────────────────
MAPBOX_API_KEY=your_mapbox_key
```

---

## :rocket: Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/your-username/lexbridge-ai.git
cd lexbridge-ai
```

**2. Install dependencies**

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

**3. Configure environment**

```bash
cp server/.env.example server/.env
# Fill in your API keys
```

**4. Run development servers**

```bash
# Backend (from /server)
npm run dev

# Frontend (from /client)
npm start
```

> :globe_with_meridians: Frontend runs at `http://localhost:3000` · Backend at `http://localhost:5000`

---

## :crystal_ball: Future Enhancements

| :label: Feature | :memo: Description |
|---|---|
| :video_camera: Video Consultations | Live video calls between clients and lawyers |
| :link: Blockchain Evidence | Tamper-proof evidence storage on-chain |
| :brain: AI Legal Strategy | Predictive outcome analysis for cases |
| :classical_building: Court Tracking | Real-time court case status integration |
| :credit_card: Payment Gateway | Secure in-app consultation payments |
| :robot: Auto Document Generation | Full legal document automation |

---

## :page_with_curl: License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

:scales: **Built to make justice accessible for everyone.**

*LexBridge AI — Where Technology Meets Justice*

</div>