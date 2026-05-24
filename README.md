# Login Risk Scoring System

## Overview
A **full‑stack MERN** application that demonstrates an **adaptive identity and cyber‑security platform**.  It captures device fingerprints, evaluates risk scores, enforces adaptive MFA, logs every authentication attempt, and provides an admin dashboard with real‑time telemetry.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Setup & Development](#setup--development)
- [Environment Variables](#environment-variables)
- [Backend API](#backend-api)
- [Frontend Overview](#frontend-overview)
- [Security & Identity Model](#security--identity-model)
- [Testing & Linting](#testing--linting)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

## Features
- **Device fingerprinting** using `@fingerprintjs/fingerprintjs`
- **Risk scoring** based on location, device, behavior, and historic logs
- **Adaptive MFA** (OTP via `speakeasy` + `nodemailer`)
- **Real‑time admin metrics** (login attempts, failed logins, high‑risk logins, active sessions, flagged warnings)
- **Per‑user audit logs** visible only to the owning user; admins can filter globally
- **Threat simulation & mitigation** endpoints for SOC‑style incident handling
- **Dynamic dashboards** built with `recharts` and glass‑morphism UI
- **Role‑based access control** (`protect`, `adminOnly` middleware)

## Architecture
```
Project/
├─ Backend/                 # Express + Mongoose API
│   ├─ routes/               # auth, dashboard, admin routes
│   ├─ models/               # User, Log, Threat, Device
│   ├─ middleware/           # auth, riskAnalyzer
│   └─ index.js              # server entry point
├─ Frontend/                # Vite + React
│   ├─ src/
│   │   ├─ pages/           # Dashboard, Activity, Admin, Settings
│   │   ├─ components/       # reusable UI (layout, cards, charts)
│   │   └─ context/          # SecurityContext (state & API calls)
│   └─ index.html
└─ .env                     # secrets & DB connection string
```
The backend exposes a **REST API** consumed by the React frontend.  All sensitive routes are protected by JWT authentication and role checks.

## Tech Stack
- **Backend**: Node.js, Express, Mongoose, MongoDB Atlas
- **Frontend**: React, Vite, vanilla CSS (glass‑morphism), Recharts
- **Auth**: JWT, bcrypt, speakeasy (TOTP), nodemailer (email OTP)
- **Fingerprint**: `@fingerprintjs/fingerprintjs`
- **Dev Tools**: Nodemon, ESLint, Prettier

## Setup & Development
1. **Clone the repo**
   ```bash
   git clone https://github.com/omkumavat/Login-Risk-Scoring-System.git
   cd Login-Risk-Scoring-System/Project
   ```
2. **Install dependencies**
   ```bash
   # Backend
   cd Backend && npm install
   # Frontend
   cd ../Frontend && npm install
   ```
3. **Configure environment** – copy the example file and fill in your values:
   ```bash
   cp .env.example .env
   ```
4. **Run the services** (in separate terminals)
   ```bash
   # Backend (nodemon watches for changes)
   cd Backend && npx nodemon index.js
   # Frontend (Vite dev server)
   cd ../Frontend && npm run dev
   ```
5. Open `http://localhost:5173` (or the fallback port shown in the console) in a browser.

## Environment Variables
| Variable | Description |
|----------|-------------|
| `PORT` | Port for the Express server (default 5000). |
| `MONGO_URI` | MongoDB Atlas connection string. |
| `JWT_SECRET` | Secret for signing JWT tokens. |
| `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` | SMTP credentials for OTP email delivery. |
| `FRONTEND_URL` | URL where the React app is served (used in email links). |
| `NODE_ENV` | `development` | `production`. |

## Backend API
### Auth
- `POST /api/auth/register` – create a new user.
- `POST /api/auth/login` – login, returns JWT, OTP flag, and fingerprint data.
- `POST /api/auth/verify-otp` – validate OTP and complete session.

### Dashboard (user‑scoped)
- `GET /api/dashboard/logs` – last 50 logs for the authenticated user.
- `GET /api/dashboard/devices` – active devices for the user.

### Admin (role = Admin only)
- `GET /api/admin/metrics?userId=<optional>` – returns:
  - `metrics` (totalLoginAttempts, failedLogins, highRiskLogins, activeBans, userCount, activeSessions)
  - `threats` (latest 10 threats)
  - `logs` (latest 50 logs, optionally filtered by userId)
  - `flaggedWarnings` (high‑risk denied logs, max 20)
  - `riskDistribution` (profile counts for Low/Medium/High/Blocked)
- `POST /api/admin/threats/mitigate` – mark a threat as mitigated and log the action.
- `POST /api/admin/threats/simulate` – create a fake threat for testing.

## Frontend Overview
- **Pages**: `DashboardPage`, `ActivityPage`, `AdminPage`, `SettingsPage`, `LoginPage`, `RegisterPage`, `OtpPage`.
- **SecurityContext**: Central React context handling auth state, periodic telemetry polling, and providing helper functions (`login`, `register`, `verifyOtp`, `mitigateThreat`, etc.).
- **Components**: Glass‑styled panels, risk‑score cards, live threat ticker, device list, and Recharts graphs.

## Security & Identity Model
1. **Identity** – each user record stores hashed password, role, and optional MFA secret.  Fingerprint data (`visitorId`) is stored on login attempts for device correlation.
2. **Risk Engine** – evaluates:
   - IP reputation (via third‑party lookup or internal blocklist)
   - Browser/OS fingerprint mismatch
   - Geolocation anomalies
   - Historical risk score from previous logs
   When risk exceeds a configurable threshold, the `adminOnly` middleware can enforce additional challenges (OTP, device revocation).
3. **Audit Logs** – immutable `Log` documents capture every authentication event with full context (IP, device, risk level, decision).  Users can only read their own logs; admins can optionally filter by `userId`.
4. **Threat Management** – SOC‑style workflow: simulate a threat, view in the admin dashboard, mitigate (adds to blocklist and logs the action).
5. **Transport Security** – In production you should terminate TLS at a reverse proxy (NGINX, Cloudflare) and enforce `HTTPS`.  JWTs are signed with a strong secret and validated on every request.
6. **Data Privacy** – No personally‑identifiable information (PII) is stored beyond email address and hashed password.  All logs are retained according to configurable retention policies.

## Testing & Linting
```bash
# Backend unit tests (Jest) – not included yet but recommended
npm run test
# Lint the codebase
npm run lint
```
The project uses **ESLint** with the AirBnB style guide and **Prettier** for consistent formatting.

## Contribution Guidelines
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome‑feature`).
3. Ensure code passes linting and tests.
4. Submit a Pull Request with a clear description of the change.
5. All contributions must adhere to the security model – any new endpoint must be protected by `protect` middleware and optionally `adminOnly`.

---
*Built with a focus on **identity awareness**, **adaptive security**, and **real‑time visibility** for security operations.*
