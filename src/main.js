// ============ QUIZMASTER - MAIN ENTRY POINT ============

import './style.css';

// Import modules
import { state } from './state.js';
import { $ } from './utils.js';
import { loadSettings, saveSettings } from './storage.js';
import { initAuth, checkSession } from './auth.js';
import { 
  loadTopics, 
  updateHighScoreDisplay, 
  startQuiz, 
  nextQuestion, 
  goToHome,
  showQuitModal,
  hideQuitModal,
  confirmQuit,
  shareResults,
  showReview,
  hideReview
} from './quiz.js';
import { showDashboard, hideDashboard } from './dashboard.js';

// ============ DOM ELEMENTS ============
const themeToggle = $("themeToggle");
const soundToggle = $("soundToggle");
const shuffleToggle = $("shuffleToggle");
const timerToggle = $("timerToggle");
const topicSelect = $("topicSelect");
const startBtn = $("startBtn");
const nextBtn = $("nextBtn");
const restartBtn = $("restartBtn");
const shareBtn = $("shareBtn");
const homeBtn = $("homeBtn");
const quitBtn = $("quitBtn");
const resumeBtn = $("resumeBtn");
const confirmQuitBtn = $("confirmQuitBtn");
const quitModal = $("quitModal");
const dashboardBtn = $("dashboardBtn");
const dashHomeBtn = $("dashHomeBtn");
const userBadge = $("userBadge");
const reviewBtn = $("reviewBtn");
const reviewBackBtn = $("reviewBackBtn");
const reviewPlayAgainBtn = $("reviewPlayAgainBtn");

// ============ THEME & SETTINGS ============
function applySettings() {
  if (state.darkMode) {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☀️";
  }
  if (!state.soundEnabled) {
    soundToggle.textContent = "🔇";
  }
}

// ============ EVENT LISTENERS ============

// Quiz controls
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", startQuiz);
homeBtn.addEventListener("click", goToHome);

// Quit modal
quitBtn.addEventListener("click", showQuitModal);
resumeBtn.addEventListener("click", hideQuitModal);
confirmQuitBtn.addEventListener("click", confirmQuit);
shareBtn.addEventListener("click", shareResults);

// Dashboard
dashboardBtn.addEventListener("click", showDashboard);
dashHomeBtn.addEventListener("click", hideDashboard);
userBadge.addEventListener("click", (e) => {
  if (e.target.id !== "logoutBtn") showDashboard();
});

// Mistake Review
reviewBtn.addEventListener("click", showReview);
reviewBackBtn.addEventListener("click", hideReview);
reviewPlayAgainBtn.addEventListener("click", () => {
  $("reviewScreen").classList.add("hidden");
  startQuiz();
});

// Topic selection
topicSelect.addEventListener("change", (e) => {
  state.selectedTopic = e.target.value;
  updateHighScoreDisplay();
});

// Theme toggle
themeToggle.addEventListener("click", () => {
  state.darkMode = !state.darkMode;
  document.documentElement.setAttribute("data-theme", state.darkMode ? "dark" : "");
  themeToggle.textContent = state.darkMode ? "☀️" : "🌙";
  saveSettings();
});

// Sound toggle
soundToggle.addEventListener("click", () => {
  state.soundEnabled = !state.soundEnabled;
  soundToggle.textContent = state.soundEnabled ? "🔊" : "🔇";
  saveSettings();
});

// Shuffle toggle
shuffleToggle.addEventListener("click", () => {
  state.shuffleEnabled = !state.shuffleEnabled;
  shuffleToggle.classList.toggle("active");
});

// Timer toggle
timerToggle.addEventListener("click", () => {
  state.timerEnabled = !state.timerEnabled;
  timerToggle.classList.toggle("active");
});

// Close modal on overlay click
quitModal.addEventListener("click", (e) => {
  if (e.target === quitModal) {
    hideQuitModal();
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !quitModal.classList.contains("hidden")) {
    hideQuitModal();
  }
});

// ============ INITIALIZATION ============
function init() {
  console.log("🧠 QuizMaster initialized");
  
  // Load saved settings
  loadSettings();
  applySettings();
  
  // Load available topics
  loadTopics();
  
  // Initialize authentication
  initAuth();
  
  // Check for existing session
  checkSession();
}

// Start the app
init();
