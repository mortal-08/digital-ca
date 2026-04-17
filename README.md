# 🏛️ Digital CA Platform

> A smart, full-stack SaaS platform for Chartered Accountants — built with React, Node.js, Express & MongoDB.

**Live Demo:** [Frontend (Vercel)](https://digital-ca-beige.vercel.app) • [Backend (Render)](https://digital-ca-backend.onrender.com)

---

## 📸 Screenshots

| Landing Page | Dashboard |
|:---:|:---:|
| Elite animated landing with scroll reveals | Personalized greeting, stat cards, charts |

| Login | Settings |
|:---:|:---:|
| Split-screen with floating particles | Profile, security, notifications, themes |

---

## ✨ Features

### 🔐 Authentication & Security
- [x] JWT-based authentication (login/register)
- [x] Password hashing with bcryptjs
- [x] Password visibility toggle (eye button)
- [x] Role-based access control (Admin / Client)
- [x] Protected routes with auto-redirect
- [x] Token stored in localStorage with logout support

### 🏠 Landing Page
- [x] Animated hero section with mesh gradient background
- [x] Auto-counting statistics (500+ clients, 15+ years, etc.)
- [x] Services showcase with hover effects
- [x] Team / About section with generated images
- [x] Client testimonials carousel
- [x] Live news ticker from regulatory sources
- [x] Contact form
- [x] Responsive footer with social links
- [x] Scroll-reveal animations (Framer Motion)

### 📊 Dashboard
- [x] Personalized greeting based on time of day
- [x] Quick action buttons (New ITR, GST Return, Add Client, New Task)
- [x] 4 animated stat cards with gradient backgrounds and trend badges
- [x] Revenue trend area chart (FY 2025-26)
- [x] Service mix donut chart
- [x] Recent activity feed with timestamped entries
- [x] Upcoming deadlines tracker with urgency indicators

### 🧮 Financial Calculators (5 Tools)
- [x] **Income Tax Calculator** — Old vs New Regime comparison with slab-wise breakdown
- [x] **GST Calculator** — Inclusive/exclusive with all rate options (5%, 12%, 18%, 28%)
- [x] **EMI Calculator** — Loan amount, rate, tenure with total interest calculation
- [x] **TDS Rate Explorer** — Section-wise TDS rates lookup (194A, 194C, 194H, etc.)
- [x] **HRA Exemption Calculator** — Metro/Non-metro with Section 10(13A) rules

### 📄 Document Management (Cloudinary)
- [x] Drag-and-drop file upload zone
- [x] Direct upload to Cloudinary (cloud_name: `dcy5ymdvl`)
- [x] File streaming via multer memory storage
- [x] Category tagging (Tax Returns, Invoices, Reports, Audit, KYC, General)
- [x] Document list with file type icons (PDF, Excel, Image)
- [x] View/download via Cloudinary secure URLs
- [x] Delete from both Cloudinary and MongoDB
- [x] Search and category filtering
- [x] Upload success/error feedback with animations

### 📈 Reports & Analytics
- [x] **3-tab layout**: Business Overview, Macro Trends, Compliance Scorecard
- [x] **ComposedChart**: Revenue (area) + Expenses (bar) + Profit (line) + Clients (dashed) — dual Y-axis
- [x] **Tax Obligation Donut**: Income Tax, GST, TDS, Prof. Tax, Advance Tax with % labels
- [x] **Service Performance Radar**: 6-axis radar (Revenue, Satisfaction, Efficiency)
- [x] **India Macro Indicators**: CPI Inflation, RBI Repo Rate, GDP Growth (2018–2026)
- [x] **Tax Collections Chart**: Direct vs Indirect stacked bars (FY19–FY26, ₹ Lakh Crore)
- [x] **Compliance Scorecard**: Animated progress bars for ITR, GST, TDS, Audit, ROC filing
- [x] Custom tooltips with ₹ Lakh formatting

### 📡 Live News & Regulatory Updates
- [x] RSS feed aggregation from official sources:
  - 🏦 RBI (`rbi.org.in`)
  - 📊 SEBI (`sebi.gov.in`)
  - 💰 Income Tax Dept (`incometax.gov.in`)
  - 🏢 MCA (`mca.gov.in`)
- [x] Live / Cached badges per article
- [x] Source-based filtering (All, Tax, RBI, SEBI, GST, MCA)
- [x] Manual refresh button with loading spinner
- [x] Graceful fallback to curated news if feeds fail
- [x] Urgent news banner at top

### ✅ Task Management
- [x] Create tasks with title, description, priority, deadline
- [x] Assign tasks to staff members (admin feature)
- [x] Status tracking: Pending → In Progress → Completed
- [x] Priority levels: Low, Medium, High, Urgent
- [x] Filter by status and priority
- [x] Overdue deadline warnings
- [x] Animated task cards

### 💬 Messages
- [x] Contact/query form for client communication
- [x] Subject and message fields

### ⚙️ Settings (4 Tabs)
- [x] **Profile**: Edit name, phone, firm name, avatar display
- [x] **Security**: Change password with eye toggles, security status indicators
- [x] **Notifications**: iOS-style toggle switches (Email, Deadlines, News, Tasks)
- [x] **Appearance**: Theme selector — Light, Dark, System (with live preview cards)

### 🎨 UI/UX Design System
- [x] Glassmorphism design with CSS custom properties
- [x] Dark / Light theme with consistent variables
- [x] Framer Motion animations throughout
- [x] Responsive design (desktop + tablet + mobile)
- [x] Loading spinners and skeleton states
- [x] Premium typography (Inter/system fonts)
- [x] Gradient accent colors and hover micro-animations
- [x] Split-screen authentication pages with floating particles

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Vanilla CSS with CSS Variables |
| **Animations** | Framer Motion |
| **Charts** | Recharts (Area, Bar, Line, Composed, Pie, Radar) |
| **Icons** | Lucide React |
| **Routing** | React Router v6 |
| **Backend** | Node.js, Express |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT + bcryptjs |
| **File Upload** | Multer → Cloudinary |
| **News Feeds** | rss-parser |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |

---

## 📁 Project Structure

```
digital-ca/
├── package.json              # Root runner (concurrently)
├── .gitignore
│
├── backend/
│   ├── index.js              # Express server + static file serving
│   ├── config/
│   │   ├── db.js             # MongoDB connection
│   │   └── cloudinary.js     # Cloudinary SDK config
│   ├── models/
│   │   ├── User.js           # User schema (bcrypt)
│   │   └── Document.js       # Document schema (Cloudinary metadata)
│   ├── routes/
│   │   ├── authRoutes.js     # Login / Register
│   │   ├── dashboardRoutes.js # Dashboard stats
│   │   ├── documentRoutes.js  # Upload / List / Delete
│   │   └── newsRoutes.js     # RSS feed aggregator
│   └── middleware/
│       └── authMiddleware.js  # JWT verification
│
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── src/
│   │   ├── App.tsx           # Routing (lazy loaded)
│   │   ├── main.tsx
│   │   ├── index.css         # Global design system
│   │   ├── config/
│   │   │   └── api.ts        # API base URL config
│   │   ├── context/
│   │   │   └── AuthContext.tsx # Global auth state
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AppLayout.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Sidebar.css
│   │   └── pages/
│   │       ├── LandingPage.tsx / .css
│   │       ├── Login.tsx / Register.tsx / Auth.css
│   │       ├── Dashboard.tsx / .css
│   │       ├── Calculators.tsx / .css
│   │       ├── Documents.tsx / .css
│   │       ├── Reports.tsx / .css
│   │       ├── TaskManager.tsx / .css
│   │       ├── NewsUpdates.tsx / .css
│   │       ├── Messages.tsx / .css
│   │       └── Settings.tsx / .css
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### 1. Clone the repo
```bash
git clone https://github.com/mortal-08/digital-ca.git
cd digital-ca
```

### 2. Set up environment variables
Create `backend/.env`:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Install dependencies & run
```bash
npm install          # Installs root + backend + frontend deps
npm run dev          # Starts both frontend (5173) and backend (5001)
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🌐 Deployment

### Frontend → Vercel
- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL` = `https://your-backend.onrender.com`

### Backend → Render
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**: All from `backend/.env`

---

## 📋 Changelog

### v1.0.0 (April 2026)
- Initial release with full feature set
- Landing page with scroll animations
- JWT authentication with admin/client roles
- 5 financial calculators
- Cloudinary document management
- Live RSS news from RBI, SEBI, Income Tax, MCA
- Professional charts with macro economic trends
- Task management system
- Settings with theme switcher
- Full responsive design

---

## 👨‍💻 Author

**mortal-08** — [GitHub](https://github.com/mortal-08)

---

## 📄 License

This project is for educational and portfolio purposes.
