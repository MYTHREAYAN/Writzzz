# TRIO ASSIGNMENT — Module 01 Authentication

Production-quality authentication for **TRIO ASSIGNMENT**, an AI-powered personalized handwritten assignment platform. This repository contains **Module 01 only**: register, login, logout, forgot/reset password, profile, protected routes, and a session API Module 02 can consume.

Later modules (Dashboard, handwriting, Gemini, PDF) are **not** included.

---

## 1. Folder structure

```
.
├── README.md
├── .gitignore
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       │   ├── env.js
│       │   └── db.js
│       ├── models/
│       │   └── User.js
│       ├── routes/
│       │   ├── index.js
│       │   └── auth.routes.js
│       ├── controllers/
│       │   └── auth.controller.js
│       ├── services/
│       │   ├── auth.service.js
│       │   └── email.service.js
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── error.middleware.js
│       │   ├── rateLimit.middleware.js
│       │   └── validate.middleware.js
│       ├── validators/
│       │   └── auth.validators.js
│       └── utils/
│           ├── apiResponse.js
│           ├── asyncHandler.js
│           ├── cookies.js
│           ├── jwt.js
│           ├── password.js
│           └── resetToken.js
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── auth/index.js              ← Module 02 import surface
        ├── api/
        │   ├── client.js
        │   └── authApi.js
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── auth/
        │   │   ├── ProtectedRoute.jsx
        │   │   └── PublicOnlyRoute.jsx
        │   ├── layout/AuthLayout.jsx
        │   └── ui/
        │       ├── Alert.jsx
        │       ├── Button.jsx
        │       ├── FormInput.jsx
        │       └── LoadingSpinner.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── ForgotPasswordPage.jsx
        │   ├── ResetPasswordPage.jsx
        │   └── ProfilePage.jsx
        ├── constants/routes.js
        └── utils/validation.js
```

---

## 2. Environment files

Copy examples, then change secrets:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

On macOS/Linux:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env.example` and `frontend/.env.example` list every variable. Never commit `.env`. Never expose `JWT_SECRET`.

---

## 3. MongoDB setup

**Option A — local MongoDB**

1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Start the service so it listens on `127.0.0.1:27017`.
3. Keep `MONGODB_URI=mongodb://127.0.0.1:27017/trio_assignment`.

**Option B — MongoDB Atlas**

1. Create a free cluster and a database user.
2. Allow your IP in Network Access.
3. Set `MONGODB_URI` to the SRV connection string, for example:
   `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/trio_assignment`

The database and `users` collection are created on first successful registration.

---

## 4. Run commands

Requires Node.js 18+.

```bash
cd backend
npm install
npm run dev
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

- API: http://localhost:5000  
- Health: http://localhost:5000/api/health  
- App: http://localhost:5173  

Production-style:

```bash
cd backend && npm start
cd frontend && npm run build && npm run preview
```

---

## 5. API documentation

Base URL: `http://localhost:5000/api`

All JSON responses:

```json
{ "success": true|false, "message": "string", "data": {}, "errors": null }
```

Auth uses an **HTTP-only cookie** (`COOKIE_NAME`, default `trio_auth_token`). Send `credentials: include` / axios `withCredentials: true`. The JWT is not stored in `localStorage`.

| Method | Path | Auth | Rate limit | Body | Success |
| --- | --- | --- | --- | --- | --- |
| POST | `/auth/register` | No | 20 / 15 min | `fullName`, `email`, `password`, `confirmPassword` | 201, sets cookie, `{ user }` |
| POST | `/auth/login` | No | 20 / 15 min | `email`, `password` | 200, sets cookie, `{ user }` |
| POST | `/auth/logout` | Cookie optional | — | — | 200, clears cookie, invalidates JWT via `tokenVersion` |
| POST | `/auth/forgot-password` | No | 8 / 15 min | `email` | 200, generic message (no email enumeration). Dev only: `data.resetUrl` |
| POST | `/auth/reset-password` | No | 8 / 15 min | `token`, `password`, `confirmPassword` | 200, clears cookie |
| GET | `/auth/me` | Cookie | — | — | 200, `{ user }` |
| PUT | `/auth/profile` | Cookie | — | `fullName?`, `email?`, `bio?`, `preferences?` | 200, `{ user }` |
| GET | `/health` | No | — | — | API status |

Password rules: 8–72 characters, at least one letter and one number.

Reset tokens are random 32-byte hex values, stored as SHA-256 hashes, and expire (`RESET_TOKEN_EXPIRY_MINUTES`, default 30). If SMTP is not configured, the server logs the reset URL. In development the same URL is returned so the UI can complete the flow without mail.

CORS: only `CLIENT_URL` is allowed, with credentials.

---

## 6. Testing instructions

1. Start MongoDB, backend, and frontend.
2. Open http://localhost:5173 — you should land on **Sign in**.
3. Open `/profile` while logged out — you must be redirected to `/login`.
4. Register with mismatched passwords — client validation error.
5. Register a valid account — you land on **Profile**, cookie is set.
6. Refresh the profile page — session remains (`GET /auth/me`).
7. Register the same email again — `409` duplicate email.
8. Sign out — cookie cleared; `/profile` redirects to login.
9. Login with a wrong password — `401` “Invalid email or password”.
10. Forgot password with the real email — success message; in development use the on-screen reset link.
11. Reset password, then login with the new password.
12. Wait for token expiry or reuse an old reset link — request fails.

Manual API check (PowerShell):

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

---

## 7. How Module 02 connects

Module 02 (Dashboard) should **not** invent a second login. Reuse this module:

1. Keep `AuthProvider` around the whole app (already in `src/main.jsx`).
2. Import from `src/auth/index.js`:

```js
import { useAuth, ProtectedRoute } from "./auth";
```

3. Wrap dashboard routes:

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

4. Read the signed-in user:

```js
const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
```

5. Call future APIs with the same `src/api/client.js` instance so the HTTP-only cookie is sent automatically.

6. Backend: reuse `requireAuth` from `backend/src/middleware/auth.middleware.js` on dashboard, assignment, and AI routes. `req.user` is the Mongoose user document.

The `User` model already has extensible fields for later modules: `handwritingProfile`, `preferences`, `assignmentIds`, `studyMaterialIds`, `createdAt`, `updatedAt`. Do not implement those modules here — only the schema hooks exist.

Suggested Module 02 change: after login, navigate to `/dashboard` instead of `/profile` by updating `APP_ROUTES` / `MODULE_02_HOME` in `frontend/src/constants/routes.js`.
