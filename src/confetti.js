import { $ } from './utils.js';

// ============ CONFETTI ANIMATION ============

const CONFETTI_COLORS = ["#667eea", "#764ba2", "#f093fb", "#00d68f", "#ffd93d", "#ff6b6b"];

export function createConfetti() {
  const container = $("confettiContainer");
  if (!container) return;
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + "s";
    confetti.style.animationDuration = Math.random() * 2 + 2 + "s";
    container.appendChild(confetti);

    setTimeout(() => confetti.remove(), 4000);
  }
}
