import { state } from './state.js';
import { supabase } from './supabase.js';

// ============ SUPABASE STORAGE ============

export async function saveScoreToSupabase(correctCount, totalCount) {
  if (!state.selectedTopic || !state.currentUser) return;
  
  const { data, error } = await supabase
    .from('scores')
    .insert([
      { 
        username: state.currentUser.name, 
        score: state.score, 
        topic: state.selectedTopic,
        correct_count: correctCount,
        total_questions: totalCount
      }
    ]);

  if (error) {
    console.error("Error saving score to Supabase:", error);
  } else {
    console.log("Score saved successfully to Supabase!");
  }
}

export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false });

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  // Filter to only show the highest score for each topic
  const champions = [];
  const seenTopics = new Set();

  for (const entry of data) {
    if (!seenTopics.has(entry.topic)) {
      champions.push(entry);
      seenTopics.add(entry.topic);
    }
  }

  return champions.slice(0, limit);
}

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
