# Frontend Demo Test Data

The backend code is unchanged. The current frontend can be tested without MongoDB using demo/localStorage data.

## Run frontend

```powershell
cd "C:\Users\LENOVO\Downloads\FreeLance3_Professional_Updated\FreeLance3_Professional_Updated\frontend"
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Fake Job Seeker Login

Open browser DevTools Console and paste:

```javascript
localStorage.setItem("token", "demo-token");
localStorage.setItem("user", JSON.stringify({
  id: "seeker-demo",
  name: "Test Job Seeker",
  email: "seeker@test.com",
  role: "jobseeker",
  isAdmin: false
}));
location.reload();
```

Test:

- `/jobs`
- Apply to a job
- Add email, phone, CV file, CV link, and detailed message
- `/dashboard`
- Check statuses: In Process, Accepted, Rejected

## Fake Employer Login

Open browser DevTools Console and paste:

```javascript
localStorage.setItem("token", "demo-token");
localStorage.setItem("user", JSON.stringify({
  id: "employer-demo",
  name: "Test Employer",
  email: "employer@test.com",
  role: "employer",
  isAdmin: false
}));
location.reload();
```

Test:

- `/dashboard`
- Read applicant message, email, phone, CV name, and CV link
- Click In Process, Accept, and Reject buttons
- Switch back to job seeker and check the status changed

## Fake Admin Login

```javascript
localStorage.setItem("token", "demo-admin-token");
localStorage.setItem("user", JSON.stringify({
  id: "admin-demo",
  name: "Test Admin",
  email: "admin@test.com",
  role: "admin",
  isAdmin: true
}));
location.reload();
```

Test:

- `/admin`
- `/dashboard`

## Reset demo jobs

```javascript
localStorage.removeItem("demoJobs");
location.reload();
```

## Included demo jobs

1. Frontend React Developer — BrightSoft Solutions — Remote
2. UI/UX Designer — Creative Hub — Cairo
3. Backend Node.js Developer — CodeWorks — Alexandria
4. Full Stack MERN Developer — FreeLancena — Remote
5. Data Visualization Specialist — Analytics Pro — Giza

## Demo application statuses

- In Process
- Accepted
- Rejected

These statuses are stored in localStorage for frontend testing only. Later, MongoDB can store the same fields in the backend.
