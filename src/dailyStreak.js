import { state } from './state.js';
import { $ } from './utils.js';

const dailyStreakCard = $("dailyStreakCard");
const dailyStreakCountDisplay = $("dailyStreakCountDisplay");
const streakNudge = $("streakNudge");

export function updateDailyStreak() {
  if (!state.currentUser) return;

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const lastDate = localStorage.getItem(`lastPlayedDate_${state.currentUser.id}`);
  let currentStreak = parseInt(localStorage.getItem(`dailyStreak_${state.currentUser.id}`) || "0");

  if (!lastDate) {
    // First time
    currentStreak = 1;
    saveStreak(today, currentStreak);
  } else {
    const lastDateObj = new Date(lastDate);
    const todayObj = new Date(today);
    const diffDays = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day!
      currentStreak += 1;
      saveStreak(today, currentStreak);
    } else if (diffDays > 1) {
      // Missed a day
      currentStreak = 1;
      saveStreak(today, currentStreak);
    }
    // If diffDays is 0, they already played today, streak remains same.
  }

  state.dailyStreak = currentStreak;
  displayDailyStreak(currentStreak);
}

function saveStreak(date, count) {
  localStorage.setItem(`lastPlayedDate_${state.currentUser.id}`, date);
  localStorage.setItem(`dailyStreak_${state.currentUser.id}`, count.toString());
}

function displayDailyStreak(count) {
  if (count > 0) {
    dailyStreakCard.classList.remove("hidden");
    dailyStreakCountDisplay.textContent = count;
    
    // Set Personalized Nudge
    if (count <= 2) {
      streakNudge.textContent = "Great start! Don't let the fire go out today.";
    } else if (count <= 5) {
      streakNudge.textContent = "You're on fire! 🔥 Keep learning every day.";
    } else if (count <= 10) {
      streakNudge.textContent = "Incredible consistency! You're becoming a pro.";
    } else {
      streakNudge.textContent = "Legendary! You're an unstoppable learning machine!";
    }
  }
}
