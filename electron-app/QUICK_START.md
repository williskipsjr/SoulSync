# 🚀 Quick Start - SoulSync Electron App

## Run in 3 Steps

```bash
# 1. Go to the app directory
cd /app/electron-app

# 2. Install dependencies (first time only)
yarn install

# 3. Run the app
yarn dev
```

That's it! The app will start with **fake mode** (no configuration needed).

---

## What You'll See

1. **Login Screen** - Click "Continue with Google" (auto-logs in with fake user)
2. **Account Setup** - Enter name and telegram IDs, click "Complete Setup"  
3. **Landing Page** - See mood-based UI with random mood
4. **Chat** - Click "💬 Start Chatting" to test the interface

---

## System Tray

- Click **X** to close window → App minimizes to system tray
- **Click tray icon** → Restore window
- **Right-click tray → Quit** → Actually exit the app

---

## Connect to Real Backend

Edit `.env` file:

```env
NEXT_PUBLIC_BACKEND_API_URL=http://192.168.1.100:8000
```

Your backend needs these endpoints:
- `POST /setup` - Save user data
- `GET /mood/{user_id}` - Return mood
- `POST /chat` - Chat with AI

See `SETUP.md` for detailed backend integration guide.

---

## Enable Real Authentication

Edit `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

See `SETUP.md` for Supabase configuration guide.

---

## Troubleshooting

**Blank screen?**
- Check if Next.js started on http://localhost:3000
- Open DevTools: Ctrl+Shift+I

**Port 3000 in use?**
```bash
# Kill it first
lsof -ti:3000 | xargs kill -9
```

**Module errors?**
```bash
rm -rf node_modules yarn.lock
yarn install
```

---

## Files Structure

```
electron-app/
├── app/               # Next.js pages
├── components/        # React components
├── electron/          # Electron main process
├── lib/              # Helper classes (API, Supabase, Store)
├── .env              # Configuration (optional)
├── package.json
└── README.md         # Full documentation
```

---

## Need Help?

- 📖 **Full Docs**: See `README.md`
- 🛠️ **Setup Guide**: See `SETUP.md`
- 🐛 **Issues**: Check console logs in Electron DevTools

---

## Backend API Reference

```python
# POST /setup
{
  "name": "John",
  "tgids": ["@user1", "@user2"],
  "userid": "user_id",
  "email": "email@test.com"
}

# GET /mood/{user_id}
Response: {
  "mood": "anxiety" | "depression" | "sad" | "happy" | "calm" | "neutral"
}

# POST /chat
{
  "user_id": "user_id",
  "message": "Hello"
}
Response: { "response": "AI response" }
```

---

## Console Messages

Watch for these:
- ✅ **Real mode enabled** - Configuration working
- ⚠️ **Fake mode** - Using mock data (default)

---

**Made with ❤️ for mental health support**
