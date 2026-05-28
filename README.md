# 🚀 TalentBridge — AI-Powered MERN Job Portal

A full-stack job portal built with MongoDB, Express.js, React, and Node.js, featuring **AI-powered tools** using the Anthropic Claude API.

---

## ✨ Features

### For Job Seekers
- 🔍 **Browse & Search Jobs** — filter by type, location, category, experience, salary
- 📝 **Apply with AI** — auto-generate personalized cover letters using Claude AI
- 🤖 **AI Career Coach** — ask career questions and get expert AI advice
- 📄 **Resume Analyzer** — get ATS score and improvement tips
- 🎯 **Job Matcher** — AI finds the best matching jobs for your profile
- 🎙️ **Interview Prep** — get tailored questions and tips for any job
- 🔖 **Save Jobs** — bookmark jobs to apply later
- 📊 **Track Applications** — monitor status with a full timeline

### For Employers
- 📢 **Post Jobs** — rich job posting with all details
- ✨ **AI Job Description Generator** — Claude writes complete job descriptions
- 👥 **Manage Applications** — view, filter, and update all applicants
- 🤖 **AI Candidate Scoring** — score applicants 0-100 with AI analysis
- 📈 **Dashboard** — overview of all jobs and applications

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Tokens) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Styling | Custom CSS with CSS Variables |
| Notifications | React Hot Toast |

---

## 📁 Project Structure

```
job-portal/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (seeker + employer)
│   │   ├── Job.js           # Job listing schema
│   │   └── Application.js   # Application schema
│   ├── routes/
│   │   ├── auth.js          # Register, login, profile
│   │   ├── jobs.js          # CRUD for jobs
│   │   ├── applications.js  # Apply, track, update
│   │   ├── users.js         # User data
│   │   └── ai.js            # All AI endpoints
│   ├── middleware/
│   │   └── auth.js          # JWT auth + role guards
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Navbar.js / .css
        │   ├── Footer.js / .css
        │   └── JobCard.js / .css
        ├── context/
        │   └── AuthContext.js   # Global auth state
        ├── pages/
        │   ├── Home.js          # Landing with hero + search
        │   ├── Jobs.js          # Job listing with filters
        │   ├── JobDetail.js     # Job details + apply modal
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js     # User dashboard
        │   ├── PostJob.js       # Post/edit job (employer)
        │   ├── Applications.js  # Track applications
        │   ├── Profile.js       # Edit profile
        │   ├── AITools.js       # All AI tools
        │   └── SavedJobs.js     # Bookmarked jobs
        ├── App.js               # Routes + providers
        ├── index.js
        └── index.css            # Global design system
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Anthropic API Key

### 1. Clone / Extract the project

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=your_super_secret_key_here
ANTHROPIC_API_KEY=sk-ant-your-key-here
NODE_ENV=development
```

Start backend:
```bash
npm run dev   # with nodemon (recommended)
# or
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**

> The React app proxies API calls to `http://localhost:5000` via the `proxy` field in `package.json`.

---

## 🤖 AI Features (Anthropic Claude)

All AI features require a valid `ANTHROPIC_API_KEY` in backend `.env`.

| Endpoint | Description |
|----------|-------------|
| `POST /api/ai/generate-cover-letter` | Personalized cover letter |
| `POST /api/ai/generate-job-description` | Full job description for employers |
| `POST /api/ai/score-application/:id` | 0-100 candidate scoring with analysis |
| `POST /api/ai/career-advice` | Career coaching Q&A |
| `POST /api/ai/analyze-resume` | Resume feedback + ATS score |
| `POST /api/ai/job-match` | Match candidate to jobs |
| `POST /api/ai/interview-prep` | Interview questions + tips |

---

## 🔐 Authentication & Roles

- **Job Seeker** — browse, apply, save jobs, use AI tools
- **Employer** — post jobs, manage applications, score candidates
- **Admin** — full access (set `role: 'admin'` in DB)

JWT tokens expire in 7 days.

---

## 📦 Production Build

```bash
# Build frontend
cd frontend && npm run build

# Serve frontend from backend (add to server.js):
# app.use(express.static(path.join(__dirname, '../frontend/build')));
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));
```

---

## 🌱 Seeding Demo Data

Register accounts manually:
1. Go to `/register` → choose **Job Seeker**
2. Go to `/register` → choose **Employer**
3. Employer: post jobs at `/post-job`
4. Job Seeker: browse and apply at `/jobs`

---

## 📄 License

MIT — free to use, modify, and distribute.
