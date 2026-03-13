# Campus Queue — CIT
### Supabase + Vanilla JS · No backend server needed

---

## Project Structure

```
campus-queue/
├── frontend/
│   ├── index.html    ← Main HTML (all pages)
│   ├── style.css     ← All styles
│   ├── config.js     ← Supabase credentials (edit this first)
│   ├── auth.js       ← Login, Signup, Logout
│   └── app.js        ← Services, Queue, Real-time
│
└── database/
    └── schema.sql    ← Run this in Supabase SQL Editor
```

---

## Setup in IntelliJ

### Step 1 — Open the project
1. Open IntelliJ IDEA
2. File → Open → select the `campus-queue` folder
3. You'll see the file tree on the left

---

### Step 2 — Create your Supabase project
1. Go to https://supabase.com → New Project
2. Name: `campus-queue` | Choose a region close to you
3. Wait ~2 minutes for it to provision
4. Go to **Settings (gear icon) → API**
5. Copy:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon / public key** (long `eyJ...` string)

---

### Step 3 — Add your credentials
Open `frontend/config.js` and replace:
```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';   // paste Project URL here
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; // paste anon key here
```

---

### Step 4 — Create the database tables
1. In Supabase → **SQL Editor → New Query**
2. Open `database/schema.sql` from IntelliJ
3. Copy all the SQL and paste it into the Supabase editor
4. Click **Run**
5. You should see 6 rows created in the `services` table

---

### Step 5 — Create a test user
Option A (Quick):
- Supabase → **Authentication → Settings**
- Disable "Enable email confirmations"
- Then use the signup form in the app

Option B (Manual):
- Supabase → **Authentication → Users → Add user**
- Email: `student@cit.edu` | Password: `demo123`

---

### Step 6 — Enable Real-time
1. Supabase → **Database → Replication**
2. Toggle ON the `services` table
3. Toggle ON the `queue_entries` table

This makes queue counts update live across all browsers.

---

### Step 7 — Open the app in IntelliJ
Right-click `frontend/index.html` → **Open In → Browser**
(or install the IntelliJ **Live Server** plugin for hot reload)

---

## How it works

| What you see | What Supabase does |
|---|---|
| Login form | `sb.auth.signInWithPassword()` |
| Sign up form | `sb.auth.signUp()` |
| Service cards | `sb.from('services').select('*')` |
| Join queue button | `sb.from('queue_entries').insert({...})` |
| Leave queue button | `sb.from('queue_entries').update({status:'cancelled'})` |
| Live wait time updates | `sb.channel().on('postgres_changes', ...)` |

---

## Optional: Enable Google / GitHub login
1. Supabase → **Authentication → Providers**
2. Enable Google or GitHub
3. Follow their OAuth app setup guide
4. The buttons in the app will work automatically
