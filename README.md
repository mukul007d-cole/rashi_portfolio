# Rashi Portfolio

## Deploying to Render

This app is now Render-ready.

### 1) Create a new **Web Service** in Render
- Connect this repo.
- Render will auto-detect `render.yaml`.

### 2) Environment variables
Set these in Render:
- `EMAIL_USER` - Gmail address used to send mail
- `EMAIL_PASS` - Gmail app password
- `CONTACT_TO` - Destination inbox for contact form submissions (optional, defaults to `EMAIL_USER`)

### 3) Start behavior
- The app binds to `process.env.PORT` (required by Render).
- Health check endpoint is available at `/healthz`.

## Local run

```bash
npm install
npm start
```

App runs on `http://localhost:3000` by default.
