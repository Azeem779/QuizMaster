import { state } from './state.js';

// ============ LOCAL STORAGE ============

export function saveHighScore() {
  if (!state.selectedTopic || !state.currentUser) return;
  const key = `quizHighScore_${state.currentUser.id}_${state.selectedTopic}`;
  const highScore = localStorage.getItem(key) || 0;
  if (state.score > highScore) {
    localStorage.setItem(key, state.score);
  }
}

export function loadHighScore() {
  if (!state.selectedTopic || !state.currentUser) return 0;
  return localStorage.getItem(`quizHighScore_${state.currentUser.id}_${state.selectedTopic}`) || 0;
}

// ============ USER STATS & PROGRESS ============

export function getUserStats() {
  if (!state.currentUser) return null;
  const key = `quizStats_${state.currentUser.id}`;
  const stats = localStorage.getItem(key);
  return stats ? JSON.parse(stats) : {
    xp: 0,
    totalQuizzes: 0,
    bestAccuracy: 0,
    history: [],
    badges: []
  };
}

export function saveUserStats(newStats) {
  if (!state.currentUser) return;
  const key = `quizStats_${state.currentUser.id}`;
  localStorage.setItem(key, JSON.stringify(newStats));
}


export function loadSettings() {
  state.darkMode = localStorage.getItem("quizDarkMode") === "true";
  state.soundEnabled = localStorage.getItem("quizSound") !== "false";
}

export function saveSettings() {
  localStorage.setItem("quizDarkMode", state.darkMode);
  localStorage.setItem("quizSound", state.soundEnabled);
}

// ============ SESSION STORAGE ============

export function saveUserSession(user) {
  sessionStorage.setItem("quizUser", JSON.stringify(user));
}

export function loadUserSession() {
  const savedUser = sessionStorage.getItem("quizUser");
  return savedUser ? JSON.parse(savedUser) : null;
}

export function clearUserSession() {
  sessionStorage.removeItem("quizUser");
}
