# QuizMaster - Deployment Guide

## 🚀 Deploy to Vercel (Free)

### Option 1: GitHub + Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit - QuizMaster app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/quizmaster.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "Add New Project"
   - Import your repository
   - Vercel auto-detects Vite - just click "Deploy"
   - Your app will be live in ~60 seconds!

### Option 2: Vercel CLI (Quick Deploy)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time will prompt for login)
vercel

# For production deployment
vercel --prod
```

---

## 📁 Project Structure

```
Quiz/
├── index.html          # Main HTML with all screens
├── package.json        # Project config
├── public/
│   └── questions.json  # Quiz questions (edit to customize!)
├── src/
│   ├── main.js         # Quiz engine & logic
│   └── style.css       # Design system & styles
└── dist/               # Production build (after npm run build)
```

---

## 🎨 Customization

### Adding Your Own Questions

Edit `public/questions.json`:

```json
{
  "question": "Your question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 0, // Index of correct answer (0-3)
  "explanation": "Why this is the correct answer"
}
```

### Changing Colors

Edit the CSS variables in `src/style.css`:

```css
:root {
  --bg-gradient-1: #667eea; /* Primary gradient color */
  --bg-gradient-2: #764ba2; /* Secondary gradient color */
  --bg-gradient-3: #f093fb; /* Tertiary gradient color */
}
```

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ✨ Features

- 🎨 Glassmorphism UI with animated gradients
- ⏱️ 15-second timer per question (toggleable)
- 🔀 Shuffle mode for randomized questions
- 🔥 Streak tracking with bonus points
- 🎉 Confetti animations on correct answers
- 🌙 Dark/Light mode toggle
- 🔊 Sound effects (toggleable)
- 💾 Local storage for high scores
- 📤 Share results functionality
- 📱 Fully responsive design

Enjoy your quiz app! 🎯
