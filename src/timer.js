import { state } from './state.js';
import { $ } from './utils.js';
import { playSound } from './audio.js';

// ============ TIMER SYSTEM ============

const TIMER_DURATION = 30;
const TIMER_CIRCUMFERENCE = 163.36;

// DOM Elements
const timerContainer = $("timerContainer");
const timerProgress = $("timerProgress");
const timerText = $("timerText");

// Callbacks
let onTimeoutCallback = null;

export function setTimeoutCallback(callback) {
  onTimeoutCallback = callback;
}

export function startTimer() {
  if (!state.timerEnabled) {
    timerContainer.classList.add("hidden");
    return;
  }

  timerContainer.classList.remove("hidden");
  state.timeLeft = TIMER_DURATION;
  updateTimerDisplay();

  state.timerInterval = setInterval(() => {
    if (state.quizPaused) return;
    
    state.timeLeft--;
    updateTimerDisplay();

    if (state.timeLeft <= 5) playSound("tick");

    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      if (onTimeoutCallback) onTimeoutCallback();
    }
  }, 1000);
}

export function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function updateTimerDisplay() {
  timerText.textContent = state.timeLeft;
  const offset = TIMER_CIRCUMFERENCE * (1 - state.timeLeft / TIMER_DURATION);
  timerProgress.style.strokeDashoffset = offset;

  if (state.timeLeft <= 5) {
    timerProgress.style.stroke = "var(--timer-danger)";
  } else if (state.timeLeft <= 10) {
    timerProgress.style.stroke = "var(--timer-warning)";
  } else {
    timerProgress.style.stroke = "var(--timer-safe)";
  }
}

export function getTimerDuration() {
  return TIMER_DURATION;
}
