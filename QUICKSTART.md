# 🚀 SoulSync - Quick Start Guide

Get SoulSync up and running in 5 minutes!

## Prerequisites Check ✅

```bash
# Check Node.js (need 18+)
node --version

# Check Python (need 3.8+)
python --version

# Check yarn
yarn --version
```

## Step 1: Backend Setup (2 minutes)

### Start the Backend Server

```bash
# The backend server should already be running at http://127.0.0.1:8000
# If not, navigate to your backend directory and run:
python telegram_api_server.py
```

**Verify backend is running:**
```bash
curl http://127.0.0.1:8000
# Should return: {"message": "🧠 SoulSync API is running and ready for chat."}
```

## Step 2: Frontend Setup (3 minutes)

### Install Dependencies (if not already done)

```bash
cd /app/electron-app
yarn install
```

### Configure Environment

The `.env.local` file is already configured:
```bash
cat .env.local
# Should show: NEXT_PUBLIC_BACKEND_API_URL=http://127.0.0.1:8000
```

### Start the Application

**Option A: Web Browser (Testing)**
```bash
cd /app/electron-app
yarn dev:next

# Open browser to: http://localhost:3000
```

**Option B: Full Electron Desktop App**
```bash
cd /app/electron-app
yarn dev

# Desktop app will launch automatically
```

## Step 3: First Login (1 minute)

### Create Your Account

1. Click **"Sign Up"** tab
2. Fill in the form:
   - **Full Name**: John Doe
   - **Username**: johndoe
   - **Email**: john@example.com
   - **Password**: your_password
   - **Telegram ID**: Your telegram chat ID

### 📱 Getting Your Telegram ID

**Don't know your Telegram ID?**

1. Open Telegram
2. Search for `@userinfobot`
3. Start chat and send `/start` or forward any message
4. Bot will reply with your chat ID (e.g., `123456789`)
5. Copy this number and paste in the Telegram ID field

### Complete Registration

- Click **"Create Account"**
- Wait for confirmation
- You'll be redirected to Mood Dashboard

## Step 4: Using SoulSync 💬

### Daily Mood Check-In

**This appears every time you open the app!**

1. **Rate Your Day**: Slide between 1-10
2. **Feeling Scale**: Slide between 1-5
3. Browse **Mental Health Tips** (use arrows)
4. Click **"Continue to Chat"** when ready

### Chat Interface

1. Click **"New Chat"** to start a conversation
2. Type your message in the input field
3. Press Enter or click Send
4. AI will respond with empathetic support
5. UI adapts to your detected mood

### Managing Chats

- **Rename**: Hover over chat → Click pencil icon
- **Delete**: Hover over chat → Click trash icon
- **Export**: Hover over chat → Click download icon

## 🚨 Testing Crisis Alerts

**⚠️ WARNING: Only test with YOUR OWN Telegram account!**

To verify the alert system works:

1. Use your own Telegram ID during signup
2. In chat, type a test message: "I'm feeling really hopeless"
3. If backend detects crisis keywords, you'll receive a Telegram message
4. Check your Telegram for the alert

**Testing Backend Alert Directly:**
```bash
curl -X POST http://127.0.0.1:8000/alert \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "condition": "test_alert"
  }'
```

## 📊 Architecture Overview

```
┌─────────────────────────────────────┐
│  Desktop App (Electron + Next.js)   │
│  http://localhost:3000               │
│                                      │
│  1. Login/Signup + Telegram ID      │
│  2. Mood Dashboard (every launch)   │
│  3. Chat with AI                    │
└──────────────┬──────────────────────┘
               │ API Calls
               ▼
┌─────────────────────────────────────┐
│  Backend API (FastAPI)              │
│  http://127.0.0.1:8000              │
│                                      │
│  • /register_user                   │
│  • /register_contact                │
│  • /chat (AI + Mood Detection)      │
│  • /alert (Crisis Notification)     │
└──────────────┬──────────────────────┘
               │ On Crisis Detection
               ▼
        ┌──────────────┐
        │   Telegram   │
        │   Alert 🚨   │
        └──────────────┘
```

## 🎨 Features Implemented

✅ **Email Authentication** with Telegram ID (required)  
✅ **Mood Dashboard** - Opens every app launch  
✅ **Mental Health Tips** - Rotating carousel with animations  
✅ **AI Chat** - Real-time conversations  
✅ **Mood Detection** - 7 mood types with adaptive UI  
✅ **Crisis Alerts** - Automatic Telegram notifications  
✅ **Chat Management** - History, rename, delete, export  

## 🛠️ Troubleshooting

### Backend Not Connecting

**Error**: "Failed to send message" or "Cannot connect to backend"

**Fix**:
```bash
# Verify backend is running
curl http://127.0.0.1:8000

# If not, start backend:
python telegram_api_server.py

# Check .env.local has correct URL:
cat /app/electron-app/.env.local
# Should show: NEXT_PUBLIC_BACKEND_API_URL=http://127.0.0.1:8000
```

### Telegram Alerts Not Working

**Issue**: No Telegram messages received

**Checklist**:
- [ ] Backend has valid `BOT_TOKEN` configured
- [ ] Telegram chat ID is correct (use @userinfobot to verify)
- [ ] Backend logs show no errors (`tail -f backend.log`)
- [ ] Test alert endpoint directly with curl

### Port Already in Use

**Error**: "Port 3000 is already in use"

**Fix**:
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port:
PORT=3001 yarn dev:next
```

### Dependencies Issues

**Error**: Module not found or dependency errors

**Fix**:
```bash
cd /app/electron-app

# Clean install
rm -rf node_modules yarn.lock
yarn install

# Or use npm
rm -rf node_modules package-lock.json
npm install
```

## 📝 Next Steps

1. **Read Full Documentation**: See `README_COMPREHENSIVE.md` for detailed info
2. **Customize Backend**: Add your own LLM integration
3. **Adjust Mood Triggers**: Modify crisis detection keywords
4. **Add Features**: Extend with mood analytics, journaling, etc.
5. **Deploy**: Build production version with `yarn electron:build`

## 🆘 Need Help?

- **Documentation**: `README_COMPREHENSIVE.md`
- **API Docs**: http://127.0.0.1:8000/docs (when backend running)
- **Issues**: Report bugs on GitHub
- **Support**: contact@soulsync.example.com

---

## 🎯 Quick Command Reference

```bash
# Backend
python telegram_api_server.py              # Start backend

# Frontend
cd /app/electron-app
yarn install                                # Install dependencies
yarn dev:next                              # Web mode
yarn dev                                   # Desktop mode
yarn build                                 # Build for production
yarn electron:build                        # Package desktop app

# Testing
curl http://127.0.0.1:8000                # Test backend
curl http://127.0.0.1:8000/docs           # API documentation
```

---

**Happy SoulSyncing! 💜**

*Remember: This app is a supportive tool, not a replacement for professional mental health care. If you're in crisis, please contact emergency services or a crisis helpline immediately.*
