import { state, resetQuizState } from './state.js';
import { findUser, findUserById } from './users.js';
import { $ } from './utils.js';
import { saveUserSession, loadUserSession, clearUserSession } from './storage.js';
import { stopTimer } from './timer.js';

// ============ AUTH MODULE ============

// DOM Elements
const loginScreen = $("loginScreen");
const startScreen = $("startScreen");
const quizScreen = $("quizScreen");
const resultsScreen = $("resultsScreen");
const loginForm = $("loginForm");
const userIdInput = $("userId");
const passwordInput = $("password");
const loginError = $("loginError");
const userBadge = $("userBadge");
const userName = $("userName");
const userAvatar = $("userAvatar");
const logoutBtn = $("logoutBtn");
const quitModal = $("quitModal");
const dashboardScreen = $("dashboardScreen");

export function login(userId, password) {
  const user = findUser(userId, password);
  
  if (user) {
    state.isLoggedIn = true;
    state.currentUser = user;
    
    // Save session
    saveUserSession(user);
    
    // Update UI
    loginScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
    userBadge.classList.remove("hidden");
    userName.textContent = user.name;
    userAvatar.textContent = user.avatar;
    loginError.classList.add("hidden");
    
    // Reset form
    loginForm.reset();
    
    return true;
  }
  
  return false;
}

export function logout() {
  state.isLoggedIn = false;
  state.currentUser = null;
  
  // Clear session
  clearUserSession();
  
  // Stop any running quiz
  stopTimer();
  
  // Reset quiz state
  resetQuizState();
  
  // Update UI
  loginScreen.classList.remove("hidden");
  startScreen.classList.add("hidden");
  quizScreen.classList.remove("active");
  resultsScreen.classList.remove("active");
  userBadge.classList.add("hidden");
  quitModal.classList.add("hidden");
  dashboardScreen.classList.add("hidden");
}

export function checkSession() {
  const savedUser = loadUserSession();
  
  if (savedUser) {
    // Verify user still exists in our users list
    const validUser = findUserById(savedUser.id);
    
    if (validUser) {
      state.isLoggedIn = true;
      state.currentUser = validUser;
      
      // Update UI
      loginScreen.classList.add("hidden");
      startScreen.classList.remove("hidden");
      userBadge.classList.remove("hidden");
      userName.textContent = validUser.name;
      userAvatar.textContent = validUser.avatar;
      
      return true;
    }
  }
  
  return false;
}

// Initialize auth event listeners
export function initAuth() {
  // Login form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const userId = userIdInput.value.trim();
    const password = passwordInput.value;
    
    if (!login(userId, password)) {
      loginError.classList.remove("hidden");
      passwordInput.value = "";
      passwordInput.focus();
    }
  });

  // Logout button
  logoutBtn.addEventListener("click", logout);
}
