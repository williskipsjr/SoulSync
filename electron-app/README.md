# SoulSync - Electron Desktop App

An empathetic AI mental health companion built with Electron, Next.js, TypeScript, and TailwindCSS.

## Features

- 🔐 **Supabase Authentication** - Google Sign-in with fallback to fake mode
- 🧠 **Mood Detection** - Beautiful UI adapts to your emotional state
- 💬 **AI Chat** - Connect with backend API for empathetic conversations
- 🔔 **System Tray** - Minimize to tray instead of closing
- 🎨 **Beautiful UI** - Mood-based color schemes and animations
- 📱 **Emergency Contacts** - Store Telegram IDs for crisis support

## Tech Stack

- **Electron.js** - Desktop application framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first styling
- **Supabase** - Authentication (optional)
- **Zustand** - State management

## Installation

```bash
# Install dependencies
yarn install

# Or using npm
npm install
```

## Configuration

Create a `.env` file in the root directory (or use `.env.example` as template):

```env
# Supabase Configuration (Optional - will use fake auth if not provided)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend API Configuration (Optional - will use fake data if not provided)
NEXT_PUBLIC_BACKEND_API_URL=http://192.168.1.100:8000
```

### Backend API Endpoints Expected

The app connects to these endpoints:

1. **POST /setup** - Save user setup data
   ```json
   {
     "name": "John Doe",
     "tgids": ["@telegram_user1", "@telegram_user2"],
     "userid": "supabase_user_id",
     "email": "user@example.com"
   }
   ```

2. **GET /mood/{user_id}** - Get current mood
   ```json
   {
     "mood": "anxiety" | "depression" | "sad" | "happy" | "calm" | "neutral",
     "message": "Optional message"
   }
   ```

3. **POST /chat** - Send chat message
   ```json
   {
     "user_id": "user_id",
     "message": "User message"
   }
   ```
   Response: `{ "response": "AI response" }`

## Development

```bash
# Start Next.js dev server and Electron
yarn dev

# Or using npm
npm run dev
```

This will:
1. Start Next.js on http://localhost:3000
2. Launch Electron app
3. Open DevTools for debugging

## Building

```bash
# Build Next.js app
yarn build

# Package Electron app
yarn electron:build
```

## Features in Detail

### 1. Dual-Mode Architecture

#### Fake Mode (Development)
- **Supabase**: Returns mock user data without real authentication
- **Backend API**: Returns simulated responses for testing
- Useful when credentials are not configured

#### Real Mode (Production)
- **Supabase**: Real Google OAuth authentication
- **Backend API**: Connects to actual backend server over LAN

### 2. System Tray Functionality

- App minimizes to system tray instead of closing
- Right-click tray icon for menu:
  - **Show SoulSync** - Restore window
  - **Quit** - Exit application
- Click tray icon to restore window

### 3. Account Setup Flow

1. User signs in with Google (or fake mode)
2. Setup screen collects:
   - Name
   - Multiple Telegram IDs for emergency contacts
   - Email (auto-filled from auth)
3. Data sent to backend `/setup` endpoint

### 4. Mood-Based UI

The landing page adapts based on detected mood:

- **Anxiety** 😰 - Calming teal/cyan colors
- **Depression** 😔 - Muted grays with supportive messaging
- **Sad** 😢 - Soft blues with validation
- **Happy** 😊 - Bright yellows/oranges with positivity
- **Calm** 😌 - Peaceful greens
- **Neutral** 😐 - Balanced purple/pink tones

### 5. Chat Interface

- Real-time messaging with backend
- Mood-appropriate color scheme
- Message history display
- Loading states and error handling

## Project Structure

```
electron-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page with auth flow
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── LoginScreen.tsx    # Google sign-in
│   ├── AccountSetup.tsx   # User setup form
│   └── LandingPage.tsx    # Mood-based main page
├── electron/              # Electron main process
│   ├── main.js           # Main process & tray
│   ├── preload.js        # Preload script
│   └── icon.png          # App icon
├── lib/                   # Helper libraries
│   ├── supabase.ts       # Supabase helper (dual-mode)
│   ├── api.ts            # Backend API helper (dual-mode)
│   └── store.ts          # Zustand state management
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Helper Classes

### Supabase Helper (`lib/supabase.ts`)

```typescript
import { supabaseHelper } from '@/lib/supabase';

// Check if in fake mode
supabaseHelper.isFake(); // boolean

// Sign in with Google
await supabaseHelper.signInWithGoogle();

// Get current user
await supabaseHelper.getCurrentUser();

// Sign out
await supabaseHelper.signOut();

// Listen to auth changes
supabaseHelper.onAuthStateChange((user) => {
  console.log('User changed:', user);
});
```

### Backend API Helper (`lib/api.ts`)

```typescript
import { backendAPI } from '@/lib/api';

// Check if in fake mode
backendAPI.isFake(); // boolean

// Setup user
await backendAPI.setupUser({
  name: 'John',
  tgids: ['@user1'],
  userid: 'id',
  email: 'email@example.com'
});

// Get mood
await backendAPI.getMood('user_id');

// Send chat message
await backendAPI.sendChat({
  user_id: 'user_id',
  message: 'Hello'
});
```

## Troubleshooting

### Electron not starting
- Make sure Next.js dev server is running on port 3000
- Check `electron/main.js` for errors in console

### Supabase authentication not working
- Verify `.env` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase dashboard for Google OAuth configuration
- Ensure redirect URL is configured in Supabase

### Backend API not connecting
- Verify backend is running and accessible
- Check `NEXT_PUBLIC_BACKEND_API_URL` in `.env`
- Test backend endpoints manually with curl/Postman
- Check browser console for CORS errors

### System tray not showing
- On Linux, ensure system tray extension is enabled
- On Windows, check system tray settings
- Icon might be hidden in overflow area

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
