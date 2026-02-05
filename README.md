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
- `SMTP_HOST` - SMTP host (optional, defaults to `smtp.gmail.com`)
- `SMTP_PORT` - SMTP port (optional, defaults to `587`)
- `SMTP_SECURE` - `true` for SSL (typically port 465), `false` for STARTTLS (typically 587)

### 3) Start behavior
- The app binds to `process.env.PORT` (required by Render).
- Health check endpoint is available at `/healthz`.

## Local run

```bash
npm install
npm start
```

App runs on `http://localhost:3000` by default.

## Troubleshooting contact email

If the contact endpoint times out, verify:
- You are using a Gmail **App Password** (not your account password).
- `EMAIL_USER` and `EMAIL_PASS` are set in the runtime environment.
- Outbound SMTP to your configured `SMTP_HOST`/`SMTP_PORT` is allowed by your hosting provider.

The app now loads `.env` automatically for local development and uses shorter SMTP timeouts so failures return faster.
