# ◈ SavanaCRM — Client Lead Management System

> A full-stack SavanaCRM built with the MERN stack + Vite. Capture leads from your website, track them through a sales pipeline, add follow-up notes, and analyze your conversion funnel — all from a secure admin dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Seeding Demo Data](#seeding-demo-data)
- [Running the App](#running-the-app)
- [Using the Public Contact Form](#using-the-public-contact-form)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

SavanaCRM solves a real business problem: when someone fills out a contact form on your website, you need a way to store that lead, track its progress, follow up, and measure your conversion rate. This CRM does exactly that.

It has two parts:

- **Admin Dashboard** — a protected React app where you manage all leads
- **Public Contact Endpoint** — an API route (`POST /api/contact`) that any website form can POST to, automatically creating a new lead in the system

---

## Features

### Lead Management
- Create, view, edit, and delete leads
- Fields: name, email, phone, company, source, status, deal value, message
- Inline status updates directly from the leads table
- Search leads by name, email, or company in real time
- Filter by status and source
- Paginated results (15 per page)
- Export leads to CSV (all leads, or filtered by status)

### Sales Pipeline
- Five-stage pipeline: **New → Contacted → Qualified → Converted → Lost**
- Visual pipeline stepper on each lead's detail page
- One-click "advance to next stage" button
- Inline status dropdown in the leads table

### Follow-up Notes
- Add timestamped notes to any lead
- Notes show the author's name and exact time
- Delete individual notes
- Notes are displayed newest-first

### Analytics Dashboard
- Total leads count and conversion rate percentage
- Breakdown by status: New, Contacted, Qualified, Converted, Lost
- Monthly lead volume — area chart (last 12 months)
- Pipeline distribution — pie chart
- Lead sources breakdown — horizontal bar chart
- Recent 5 leads quick-view table

### Settings
- Update your profile name and email
- Change your password (requires current password)
- Export all leads as CSV, or export only converted or new leads
- API integration guide showing how to connect your website's contact form

### Authentication
- Register and login with email and password
- Passwords are hashed with bcrypt — never stored in plain text
- JWT tokens stored in localStorage, auto-attached to all API requests
- Protected routes redirect unauthenticated users to login
- Token expiry: 7 days

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React | 18 |
| Frontend build tool | Vite | 5 |
| Client-side routing | React Router | 6 |
| Charts | Recharts | 2 |
| HTTP client | Axios | 1 |
| Backend framework | Express | 4 |
| Runtime | Node.js | 18+ |
| Database | MongoDB | 7+ |
| ODM | Mongoose | 8 |
| Authentication | JSON Web Tokens (JWT) | — |
| Password hashing | bcryptjs | — |

---

## Project Structure

```
savana-crm/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js                 # JWT verification — protects private routes
│   ├── models/
│   │   ├── User.js                 # Admin user schema (name, email, hashed password)
│   │   └── Lead.js                 # Lead schema with embedded notes array
│   ├── routes/
│   │   ├── auth.js                 # Register, login, get profile, update profile, change password
│   │   ├── leads.js                # CRUD, notes management, status update, CSV export
│   │   ├── analytics.js            # Dashboard summary metrics
│   │   └── contact.js              # Public contact form endpoint (no auth required)
│   ├── seed.js                     # Loads 1 demo admin + 20 sample leads into the database
│   ├── server.js                   # Express app — middleware, routes, MongoDB connection
│   ├── package.json
│   └── .env.example                # Copy this to .env and fill in your values
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx          # App shell with collapsible sidebar navigation
│   │   │   ├── Layout.css
│   │   │   └── LeadModal.jsx       # Shared modal for adding and editing leads
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Global auth state: user, login(), logout()
│   │   │   └── ToastContext.jsx    # Global toast notification system
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Sign-in page
│   │   │   ├── Register.jsx        # New account page
│   │   │   ├── Auth.css            # Shared styles for auth pages
│   │   │   ├── Dashboard.jsx       # Analytics overview with charts
│   │   │   ├── Dashboard.css
│   │   │   ├── Leads.jsx           # Lead table with search, filters, pagination, export
│   │   │   ├── Leads.css
│   │   │   ├── LeadDetail.jsx      # Full lead view: info, pipeline stepper, notes
│   │   │   ├── LeadDetail.css
│   │   │   ├── Settings.jsx        # Profile, password, CSV export, API docs
│   │   │   └── Settings.css
│   │   ├── utils/
│   │   │   ├── api.js              # Axios instance with automatic JWT header injection
│   │   │   └── helpers.js          # Status/source constants, date formatters
│   │   ├── App.jsx                 # Router setup with private and public route guards
│   │   ├── index.css               # Global design system: CSS variables, typography, components
│   │   └── main.jsx                # React DOM entry point
│   ├── index.html
│   ├── vite.config.js              # Vite config — proxies /api requests to backend in dev
│   └── package.json
│
├── contact-form-demo.html          # Standalone demo of a business website contact form
├── .gitignore
├── package.json                    # Root convenience scripts
└── README.md
```

---

## Prerequisites

Make sure the following are installed on your machine before starting:

**Node.js 18 or higher**
```bash
node --version    # should print v18.x.x or higher
npm --version     # should print 9.x.x or higher
```
Download from [nodejs.org](https://nodejs.org/) if needed.

**MongoDB** — choose one option:
- **Local:** Install [MongoDB Community Edition](https://www.mongodb.com/docs/manual/installation/) and start it with `mongod`
- **Cloud (recommended):** Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) — no installation needed

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/savana-crm.git
cd savana-crm
```

### 2. Set up backend environment variables

```bash
cd backend
cp .env.example .env
```

Open the `.env` file and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/savana-crm
JWT_SECRET=replace_this_with_a_long_random_string
CLIENT_URL=http://localhost:5173
```

If you are using MongoDB Atlas, your `MONGO_URI` will look like:
```
mongodb+srv://youruser:yourpassword@cluster0.abcde.mongodb.net/savana-crm?retryWrites=true&w=majority
```

### 3. Install backend dependencies

```bash
# From inside /backend
npm install
```

### 4. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Seeding Demo Data

To start with a realistic dataset instead of an empty database, run the seed script. It creates one admin account and 20 sample leads covering all statuses, sources, and deal values — with dates spread across the last 6 months so the charts have data.

```bash
cd backend
npm run seed
```

Expected output:
```
✅ Connected to MongoDB
🗑  Cleared existing data
👤 Created admin: admin@savanacrm.dev / admin123
📋 Created 20 sample leads
🎉 Seed complete!
```

After seeding, log in with:

| Field | Value |
|-------|-------|
| Email | `admin@savanacrm.dev` |
| Password | `admin123` |

> **Warning:** The seed script deletes all existing users and leads before inserting demo data. Do not run it if you have real data you want to keep.

---

## Running the App

Open two terminal windows.

**Terminal 1 — Start the backend:**
```bash
cd backend
npm run dev
```
The API runs at `http://localhost:5000`

**Terminal 2 — Start the frontend:**
```bash
cd frontend
npm run dev
```
The app opens at `http://localhost:5173`

That's it. The Vite dev server automatically proxies all `/api` requests to the backend, so no CORS configuration is needed during development.

---

## Using the Public Contact Form

The file `contact-form-demo.html` in the project root simulates a business website's contact form. Any submission goes directly to your CRM as a new lead.

**To try it:**

1. Start the backend (`npm run dev` inside `/backend`)
2. Open `contact-form-demo.html` in your browser — drag the file into a browser tab, or right-click and choose "Open with"
3. Fill out the form and click **Send Message**
4. Open the SavanaCRM dashboard at `http://localhost:5173` — the new lead appears under Leads immediately

This is the real-world integration pattern: your public website posts contact form submissions to `/api/contact`, and your team manages them from the private admin dashboard.

**The endpoint:**
```
POST http://localhost:5000/api/contact
Content-Type: application/json
```

**Request body:**
```json
{
  "name":    "Jane Smith",
  "email":   "jane@company.com",
  "phone":   "+1 555 000 0000",
  "company": "Acme Corp",
  "message": "I would like to request a demo.",
  "source":  "website"
}
```

**Success response (201):**
```json
{
  "success": true,
  "message": "Thank you! We'll be in touch shortly.",
  "leadId":  "6612abc123def456"
}
```

Only `name` and `email` are required. All other fields are optional.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Port the Express server listens on |
| `MONGO_URI` | Yes | `mongodb://localhost:27017/savana-crm` | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret used to sign JWT tokens. Use a long random string. Never share this. |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin — set to your frontend URL in production |

> The `.env` file is listed in `.gitignore` and will never be committed to your repository.

---

## API Reference

Authenticated endpoints require a JWT token in the request header:
```
Authorization: Bearer <token>
```
The token is returned from `/api/auth/login` and `/api/auth/register`.

---

### Auth

| Method | Endpoint | Auth required | Description |
|--------|----------|:---:|-------------|
| POST | `/api/auth/register` | No | Create a new admin account. Body: `{ name, email, password }` |
| POST | `/api/auth/login` | No | Log in and receive a JWT token. Body: `{ email, password }` |
| GET | `/api/auth/me` | Yes | Get the currently authenticated user's profile |
| PUT | `/api/auth/profile` | Yes | Update name or email. Body: `{ name, email }` |
| PUT | `/api/auth/password` | Yes | Change password. Body: `{ currentPassword, newPassword }` |

---

### Leads

| Method | Endpoint | Auth required | Description |
|--------|----------|:---:|-------------|
| GET | `/api/leads` | Yes | List leads with optional filters. Query params: `search`, `status`, `source`, `page`, `limit`, `sort` |
| POST | `/api/leads` | Yes | Create a new lead |
| GET | `/api/leads/export/csv` | Yes | Download leads as a CSV file. Supports `?status=` and `?source=` filters |
| GET | `/api/leads/:id` | Yes | Get a single lead by its ID |
| PUT | `/api/leads/:id` | Yes | Replace all fields on a lead |
| DELETE | `/api/leads/:id` | Yes | Permanently delete a lead |
| PATCH | `/api/leads/:id/status` | Yes | Update only the status field. Body: `{ status }` |
| POST | `/api/leads/:id/notes` | Yes | Add a follow-up note. Body: `{ content }` |
| DELETE | `/api/leads/:id/notes/:noteId` | Yes | Remove a specific note from a lead |

**Valid status values:** `new`, `contacted`, `qualified`, `converted`, `lost`

**Valid source values:** `website`, `referral`, `social_media`, `email_campaign`, `cold_call`, `other`

---

### Analytics

| Method | Endpoint | Auth required | Description |
|--------|----------|:---:|-------------|
| GET | `/api/analytics/summary` | Yes | Returns: total count, count per status, conversion rate, source breakdown, monthly counts for the last 12 months, and 5 most recent leads |

---

### Public

| Method | Endpoint | Auth required | Description |
|--------|----------|:---:|-------------|
| POST | `/api/contact` | No | Submit a contact form. Creates a lead with status `new`. Body: `{ name, email, phone?, company?, message?, source? }` |
| GET | `/api/health` | No | Health check. Returns server status and current timestamp |

---

## Deployment

### Deploy the backend to Railway or Render

1. Push your project to a GitHub repository
2. On [Railway](https://railway.app) or [Render](https://render.com), create a new Web Service and connect your repository
3. Set the root directory to `backend`
4. Set the start command to `npm start`
5. Add environment variables in the platform dashboard:
   - `MONGO_URI` → your MongoDB Atlas connection string
   - `JWT_SECRET` → a strong random string (generate one at [1password.com/password-generator](https://1password.com/password-generator/))
   - `CLIENT_URL` → your frontend's deployed URL (set this after step 2 below)
   - `PORT` → leave unset; Railway/Render set this automatically

### Deploy the frontend to Vercel or Netlify

1. On [Vercel](https://vercel.com) or [Netlify](https://netlify.com), create a new project and connect your repository
2. Set the root directory to `frontend`
3. Set the build command to `npm run build`
4. Set the output directory to `dist`
5. Add this environment variable:
   - `VITE_API_URL` → your backend's deployed URL + `/api`, e.g. `https://savana-crm.railway.app/api`
6. Update `frontend/src/utils/api.js` to use the environment variable:
   ```js
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || '/api',
   });
   ```

Once both are deployed, go back to your backend service and update `CLIENT_URL` to your Vercel/Netlify URL so CORS is allowed.

---

## Troubleshooting

**Cannot connect to MongoDB**

Make sure MongoDB is running if you are using a local installation:
```bash
mongod --dbpath /data/db
```
If you are using Atlas, check that your current IP address is in the Atlas IP Access List under Network Access.

---

**Port 5000 is already in use**

Change the port in your `.env` file:
```env
PORT=5001
```
Then update the proxy in `frontend/vite.config.js` to match:
```js
proxy: {
  '/api': { target: 'http://localhost:5001' }
}
```

---

**The frontend shows a blank page or API errors**

- Confirm the backend server is running and shows "Connected to MongoDB" in the terminal
- Open your browser DevTools (F12) → Console and check for error messages
- Open DevTools → Network tab and look at any failed `/api` requests for the server's error response

---

**Getting logged out unexpectedly or seeing "Token invalid"**

- Make sure `JWT_SECRET` in your `.env` file has not changed since you last logged in
- Open DevTools → Application → Local Storage → clear the `crm_token` entry, then log in again

---

**Seed script fails with a connection error**

- Check that MongoDB is running and that `MONGO_URI` in `.env` is correct
- Run the seed from inside the `backend` folder, not from the project root:
  ```bash
  cd backend
  npm run seed
  ```

---

## Built for Future Interns — Full Stack Web Development Task 2 (2026)

> "I built this system to manage real clients."
