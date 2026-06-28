# Life Tracker — User Guide

A complete guide to using the Life Tracker app for daily productivity tracking.

---

## Getting Started

### Login

1. Open the app at `http://localhost:3001`
2. Enter your credentials:
   - **Email:** `admin@lifetracker.dev`
   - **Password:** `admin123`
3. Click **Sign in**

After logging in, you'll see the Dashboard — your daily overview.

---

## Navigation

The app has 4 main sections, accessible from the sidebar (desktop) or bottom tab bar (mobile):

| Section | Purpose |
|---------|---------|
| **Dashboard** | At-a-glance daily overview with charts |
| **Log** | Quick entry forms for daily tracking |
| **Courses** | Manage courses and track study progress |
| **Analytics** | Weekly summaries, patterns, and insights |

---

## Dashboard

The Dashboard shows a real-time overview of your day:

### Stat Cards
- **Today's Score** — your composite daily productivity score (0-10)
- **Last Night** — how long you slept and sleep quality
- **Energy Now** — your most recent energy check-in
- **Study Hours** — total study time this week

### Charts
- **Weekly Score** — bar chart of your daily scores for the last 7 days. Colors indicate performance: green (7+), amber (4-6), red (below 4)
- **Recent Sleep** — horizontal bars showing sleep duration for the last 7 nights. A vertical line marks the 8-hour recommendation

### "Not logged yet" Banner
If you haven't submitted a daily log today, a reminder banner appears encouraging you to visit the Log page.

---

## Log Page

This is the page you'll use most frequently. It has 4 tabs:

### Sleep Tab
**When to use:** Every morning, to record last night's sleep.

1. **Date** — defaults to today
2. **Bed time** — when you went to sleep (e.g., 23:30)
3. **Wake time** — when you woke up (e.g., 07:30)
4. The **estimated duration** appears automatically
5. **Sleep quality** — rate from 1 (Terrible) to 5 (Excellent)
6. **Note** — optional, add any context
7. Click **Log Sleep**

> **Tip:** The form handles overnight sleep automatically. If bed time is 23:30 and wake time is 07:30, it correctly calculates 8 hours.

### Daily Tab
**When to use:** Every evening, to assess your day.

1. **Date** — defaults to today
2. **Plan completed** — slide to estimate what % of your plan you finished (0-100%)
3. **Focus level** — Low / Medium / High
4. **End-of-day energy** — Drained / Still going
5. Watch the **live score preview** update as you adjust inputs
6. **Note** — optional reflection on the day
7. Click **Log Day**

**Score formula:** `score = (planPct / 100) × 5 + focus + energy`
- Maximum score: 100% plan (5) + High focus (3) + Still going (2) = **10**
- This same formula runs on the server, so the preview is accurate

> **Tip:** Submitting for the same date updates the existing entry (upsert), so you can adjust your score later.

### Energy Tab
**When to use:** Multiple times per day (after waking, after lunch, mid-afternoon, evening).

1. Use the **slider** or **quick-select buttons** to pick your energy level (1-10)
2. The large number display changes color based on level
3. Add an optional **note** (e.g., "post-lunch dip")
4. Click **Log Energy**

> **Tip:** This is designed for speed — you should be able to log in under 5 seconds. No date picker needed; it uses the current timestamp.

### Learning Tab
**When to use:** After each study session.

1. Select the **course** you studied (must create courses first in the Courses page)
2. **What did you learn?** — explain in your own words (Feynman technique)
3. **What's still confusing?** — note topics to revisit (optional)
4. **Study duration** — how many minutes you studied (optional)
5. Click **Save Learning**

> **Tip:** The "What did you learn?" field requires at least 10 characters — this encourages you to actually articulate what you learned rather than just noting "studied chapter 3".

---

## Courses Page

Manage your learning courses and track lesson progress.

### Adding a Course
1. Click **Add Course**
2. Enter the **course name** (e.g., "TypeScript Masterclass")
3. Set **total lessons** (e.g., 120)
4. Set the **deadline** (the date you want to finish by)
5. Click **Create Course**

### Course Cards
Each course shows:
- **Progress bar** — visual percentage of lessons completed
- **Current lesson** — where you are now
- **Remaining lessons** — how many left
- **Days to deadline** — countdown
- **Required pace** — lessons per day needed to finish on time
- **Total study time** — accumulated from progress logs

### Logging Study Progress
1. Click **Log Progress** on a course card
2. Enter **from lesson** and **to lesson** (e.g., lesson 15 to lesson 18)
3. Enter **duration** in minutes (optional)
4. Add a **note** (optional)
5. Click **Log Progress**

### Archiving a Course
When you finish a course, click **Archive** to hide it from the active list.

---

## Analytics Page

View trends and patterns in your data.

### Weekly Summary Table
Shows the last 4 weeks with:
- Average score
- Average sleep hours
- Average energy
- Total study hours

Color-coded cells make it easy to spot good and bad weeks at a glance.

### Pattern Insights
Compares your **weekday** vs **weekend** performance:
- Average scores for each
- Percentage difference
- Helps identify if you're more productive on certain days

### Sleep vs. Score Chart
A scatter plot showing the correlation between sleep duration and daily score. Helps answer: "Does more sleep = higher productivity?"

### Study by Course Chart
A horizontal bar chart showing how you distribute your study time across courses.

---

## Tips for Daily Use

### Morning Routine
1. Open the app → **Log tab** → **Sleep** — record last night's sleep
2. **Energy tab** — log your morning energy level
3. Check the **Dashboard** for yesterday's score

### During the Day
- Log **energy** after lunch and mid-afternoon
- After study sessions, log **learning insights**
- Log **study progress** on the Courses page

### Evening Routine
1. **Daily tab** — assess your day (plan completion, focus, energy)
2. Check **Dashboard** to see your score and weekly trend
3. Visit **Analytics** on weekends for a weekly review

### Weekly Review
Every Sunday, visit the **Analytics** page to:
- Review your weekly summary
- Compare weekday vs. weekend patterns
- Check if more sleep correlates with higher scores
- See how study time is distributed across courses

---

## Keyboard Shortcuts

The app is optimized for mobile touch, but on desktop:
- **Tab** moves between form fields
- **Enter** submits forms
- Use the sidebar to navigate between sections

---

## PWA Installation

Life Tracker is a Progressive Web App — you can install it on your phone:

### Android (Chrome)
1. Open `http://your-server:3001` in Chrome
2. Tap the **"Add to Home screen"** banner (or Menu → "Install app")
3. The app will appear as an icon on your home screen

### iOS (Safari)
1. Open the URL in Safari
2. Tap the **Share** button → **"Add to Home Screen"**
3. Name it and tap **Add**

### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click **Install**

Once installed, the app launches in its own window without browser chrome, and basic pages are cached for offline access.

---

## Telegram Bot (Optional)

If configured with a Telegram bot token, you can:
- Receive daily **reminders** to log your activities
- Send quick commands to log data from Telegram
- Get your daily summary via chat

To set up:
1. Create a bot via [@BotFather](https://t.me/BotFather) on Telegram
2. Add `TELEGRAM_BOT_TOKEN=your_token` to `apps/api/.env`
3. Set `TELEGRAM_WEBHOOK_URL=https://your-domain/telegram/webhook`
4. Restart the API
