# 🧪 Feature Testing Guide - Label Hiding & Telegram Alerts

## ✅ Features Implemented

### 1. Real-time Label Hiding
Labels like `{{Depression}}`, `{{Anxiety}}`, etc., are now **completely hidden** from users during chat streaming.

### 2. Telegram Alerts for Non-Normal Moods  
When the system detects any mood other than "normal", it automatically sends a casual, direct message to the user's emergency contact via Telegram.

---

## 🚀 Quick Start

### Step 1: Check Ollama is Running
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it:
ollama serve
```

### Step 2: Start the Application
```bash
cd /app/electron-app
yarn dev:next
```

Then open your browser to: **http://localhost:3000**

---

## 🧪 Testing Feature 1: Label Hiding

### What to Test:
Messages from the AI should **never** show labels like `{{Depression}}` or `{{Anxiety}}`.

### How to Test:

1. **Login/Register** to the app
2. **Start a chat** session
3. **Send test messages** with concerning content:
   ```
   - "I feel really depressed today"
   - "I'm so anxious I can't breathe"
   - "Everything feels overwhelming"
   ```

4. **Observe the AI response**:
   - ✅ **CORRECT**: "I hear you, and your feelings are valid."
   - ❌ **WRONG**: "I hear you, and your feelings are valid. {{Depression}}"

5. **Check the browser console** (F12):
   - Look for: `💬 Sending message to Ollama (Streaming)`
   - Should see clean responses being displayed

### Expected Behavior:
- AI responses appear smoothly without any `{{...}}` patterns
- UI theme changes to match detected mood (colors, emoji, gradient)
- No labels visible at any point during or after streaming

---

## 🧪 Testing Feature 2: Telegram Alerts

### What to Test:
When a non-normal mood is detected, the user's emergency contact should receive a Telegram message.

### Prerequisites:
1. User must have a `telegram_id` registered (set during signup)
2. Telegram bot must be active (already configured)
3. Emergency contact must have Telegram installed

### How to Test:

#### A. Register with Telegram ID

1. **Sign up** or update your profile with a valid Telegram chat ID
   - To get your chat ID: Message `@userinfobot` on Telegram
   - It will reply with your chat ID (e.g., `123456789`)

2. **Verify registration** in browser console:
   ```javascript
   // Open DevTools (F12) → Console tab
   JSON.parse(localStorage.getItem('soulsync_users'))
   // Should show your user with telegram_id
   ```

#### B. Trigger Different Mood Alerts

Send these test messages to trigger different moods:

| Mood | Test Message | Alert Triggered? |
|------|--------------|------------------|
| **Depression** | "I feel hopeless and worthless" | ✅ Yes |
| **Suicidal** | "I don't want to live anymore" | ✅ Yes |
| **Anxiety** | "I'm panicking and can't breathe" | ✅ Yes |
| **Stress** | "I'm so overwhelmed I can't handle this" | ✅ Yes |
| **Bipolar** | "I'm having extreme mood swings" | ✅ Yes |
| **Personality** | "I don't know who I am anymore" | ✅ Yes |
| **Normal** | "I'm feeling pretty good today" | ❌ No |

#### C. Check Alert Logs

Open browser console (F12) after sending a concerning message:

**Expected Log Sequence:**
```
💬 Sending message to Ollama (Streaming): ...
🚨 Non-normal mood detected, sending alert... depression
🔍 Looking for user data for alert... [user_id]
📦 Stored users: [array]
👤 Found user: {name: "...", telegram_id: "..."}
📝 Generating personalized alert message...
✉️ Generated message: "Hey, your friend [name] is going through..."
📤 Sending Telegram alert to: [chat_id]
✅ Crisis alert sent successfully to emergency contact
```

**If Alert Fails:**
```
⚠️ No emergency contact found for user
// OR
❌ Failed to send Telegram alert
```

#### D. Verify Telegram Message

Check the emergency contact's Telegram. They should receive:

```
🆘 SoulSync Alert

Hey, your friend [Name] is going through some mental health stuff (depression). Take some time to talk to them.

Time: 11/11/2025, 3:45 PM

---
Automated alert from SoulSync
```

#### E. Test Alert Cooldown

The system has a **30-minute cooldown per mood type** to prevent spam:

1. Send a depression message → Alert sent ✅
2. Immediately send another depression message → No alert (cooldown) ⏰
3. Wait 30 minutes or test a different mood → Alert sent ✅

**Check console for:**
```
⏰ Alert cooldown active, skipping duplicate alert
```

---

## 🐛 Troubleshooting

### Problem: Labels Still Showing

**Possible Causes:**
- Streaming not working (check Ollama connection)
- JavaScript error in api.ts

**Solutions:**
1. Check browser console for errors
2. Verify Ollama is running: `curl http://localhost:11434/api/tags`
3. Restart the app: `yarn dev:next`

### Problem: No Telegram Alerts

**Possible Causes:**
1. ❌ No telegram_id registered
2. ❌ Telegram bot token invalid
3. ❌ Ollama not generating alert message
4. ⏰ Cooldown period active

**Solutions:**

1. **Verify User Data:**
   ```javascript
   // In browser console
   const users = JSON.parse(localStorage.getItem('soulsync_users'));
   console.log(users);
   // Check if your user has telegram_id
   ```

2. **Check Telegram Bot:**
   ```bash
   # Test bot connection
   curl https://api.telegram.org/bot5911086963:AAEJnmtGFfGAOCDlkNf5ymQCIUw3Qpq3_XU/getMe
   ```

3. **Clear Cooldown:**
   ```javascript
   // In browser console
   // Clear all alert cooldowns
   Object.keys(localStorage)
     .filter(key => key.startsWith('last_alert_'))
     .forEach(key => localStorage.removeItem(key));
   ```

4. **Check Ollama for Alert Generation:**
   ```bash
   curl http://localhost:11434/api/chat -d '{
     "model": "llama2:latest",
     "messages": [{"role": "user", "content": "Say hi"}],
     "stream": false
   }'
   ```

### Problem: Alert Messages Too Formal

**Solution:**
Edit `/app/electron-app/lib/api.ts` → `generateAlertMessage` function:
```typescript
const prompt = `Write a casual message to tell someone their friend is struggling with [mood]. Keep it short.`;
```

---

## 📊 Verification Checklist

### Label Hiding:
- [ ] No `{{Label}}` patterns visible in chat
- [ ] AI responses display cleanly
- [ ] UI theme changes based on mood
- [ ] Console shows no errors

### Telegram Alerts:
- [ ] User has telegram_id registered
- [ ] Console shows alert logs
- [ ] Telegram message received
- [ ] Message is casual and direct
- [ ] Cooldown prevents spam
- [ ] Alert notification appears in UI

---

## 🎯 Success Criteria

✅ **Feature 1 Complete** when:
- Users never see `{{Label}}` in any chat message
- Streaming works smoothly
- UI adapts to detected mood

✅ **Feature 2 Complete** when:
- Non-normal moods trigger alerts
- Emergency contact receives Telegram message
- Message is casual: "your friend is going through some mental stuff"
- Cooldown prevents spam (30min per mood)
- User sees notification: "Your close one has been notified"

---

## 📝 Notes

- **Cooldown Period**: 30 minutes per mood type
- **Telegram Bot Token**: Pre-configured in code
- **Supported Moods**: normal, depression, suicidal, anxiety, bipolar, stress, personality
- **Alert Generation**: Uses Ollama to create personalized messages
- **Data Storage**: localStorage (no backend server)

---

## 🆘 Need Help?

If features aren't working:

1. **Check all prerequisites** (Ollama running, telegram_id set)
2. **Review console logs** (F12 in browser)
3. **Clear localStorage** and re-register if needed
4. **Restart Ollama** if responses are slow/failing
5. **Check network tab** in DevTools for API errors

---

## ✨ Bonus: Manual Testing Script

Run this in browser console to test label filtering:

```javascript
// Test label removal
const testText = "I'm here for you. {{Depression}}";
const cleaned = testText.replace(/\{\{[^}]+\}\}/g, '').trim();
console.log('Original:', testText);
console.log('Cleaned:', cleaned);
console.assert(cleaned === "I'm here for you.", 'Label not removed!');
```

---

**All features are ready for testing! 🎉**

Follow the steps above to verify everything works as expected.
