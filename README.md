# 🎓 Campus-HelpDesk — Vibe Coding Workshop Final Showcase

A professional, full-stack incident tracking and operations management system designed for campus IT, classroom multimedia, ID card access, and facility operations.

---

## 🌟 Key Features

1. **Incident Intake Form (`<dialog>` Modal)**:
   - Category selector with visual tiles (`Wi-Fi & Network`, `Classroom Equipment`, `ID Card & Access`, `Lab Software & PC`, `Hostel & Facility`, `Other`).
   - Title, Urgency Priority (`Low`, `Medium`, `High`, `Urgent`), Description with character counter, Reporter Name, Campus Email, and Phone.
   - Quick Location Suggestion chips (`Science Block - Rm 204`, `Lecture Hall 301`, `Central Library 2F`, `Hostel Block B`, `CAD Lab 2`).
   - Client and server-side validation with `:user-invalid` styling and helpful error messages.

2. **Operations Dashboard & Live Status Management**:
   - Displays unique Ticket IDs (e.g. `CMP-1048`), issue details, location, reporter information, priority badges, and relative submission time.
   - Immediate **Status Management** (`Open` ➜ `In Progress` ➜ `Resolved`) with optimistic UI update and server synchronization.
   - Expandable **Activity Trail (Audit History)** recording status transitions, timestamps, and technician notes.

3. **Interactive Statistics Overview**:
   - 4 metric cards: **Total Requests**, **Open**, **In Progress**, and **Resolved**.
   - One-click filtering: Clicking any metric card instantly filters the dashboard to that status.

4. **Multi-criteria Search & Filtering**:
   - Real-time search across ticket IDs, titles, descriptions, campus locations, and reporter names.
   - Filter dropdowns by Category and Status.
   - Sorting by Newest First or Oldest First.
   - Active filter chips and one-click "Reset Filters" action.

5. **Dual Display Modes**:
   - **Card Grid View**: Rich card layout with quick action dropdowns and hover elevation.
   - **Compact Table View**: High-density tabular layout for coordinators and department heads.

6. **Persistent Multi-Engine Storage**:
   - Supports **MongoDB with Mongoose**.
   - Automatic zero-crash fallback to **Persistent JSON Storage** (`server/data/requests.json`), ensuring tickets persist across page refreshes and server reboots even if MongoDB is not locally installed.

7. **Aesthetics & Responsive Design**:
   - Tailored campus palette: Deep Navy Blue (`#0F172A`), Slate, Crisp White, and vibrant status colors (Amber, Royal Blue, Emerald Green).
   - Clean typography with `Plus Jakarta Sans` and `Inter`.
   - Accessible WCAG contrast ratios, focus rings, and reduced-motion support.
   - Fully responsive on Desktop, Tablet, and Mobile.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v10+

### 2. Running the Server (Backend)
```bash
cd server
npm start
# Server starts on http://localhost:5000
```

### 3. Running the Client (Frontend)
```bash
cd client
npm run dev
# Frontend starts on http://localhost:5173
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check and storage engine status |
| `GET` | `/api/tickets` | Query tickets (`?q=`, `?category=`, `?status=`, `?sortBy=`) |
| `GET` | `/api/tickets/stats` | Aggregated counts for Total, Open, In Progress, Resolved |
| `GET` | `/api/tickets/:id` | Fetch details of a single ticket |
| `POST` | `/api/tickets` | Create a new ticket (validates required fields) |
| `PATCH` | `/api/tickets/:id/status` | Update status (`Open`, `In Progress`, `Resolved`) |
| `DELETE` | `/api/tickets/:id` | Delete a ticket |

---

## 🏗️ Technology Stack

- **Frontend**: React 19, Vite, Vanilla CSS Design System, Lucide React icons.
- **Backend**: Node.js, Express 4, CORS, Dotenv, Mongoose.
- **Data Persistence**: Dual MongoDB / Persistent File-Backed JSON Store.
- **API Communication**: RESTful JSON API with Vite proxy.
