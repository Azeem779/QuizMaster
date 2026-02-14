import { state } from './state.js';
import { $ } from './utils.js';
import { getUserStats, getLeaderboard } from './storage.js';

// ============ DASHBOARD MODULE ============

const BADGES = [
  { id: 'first_quiz', label: 'First Quiz', icon: '🎯', description: 'Complete your first quiz' },
  { id: 'perfect_accuracy', label: 'Perfect 100', icon: '💎', description: 'Get 100% accuracy' },
  { id: 'streak_5', label: 'Streak 5', icon: '🔥', description: 'Reach a streak of 5' },
  { id: 'speed_demon', label: 'Speed Demon', icon: '⚡', description: 'Answer in under 3 seconds' },
  { id: 'loyal_user', label: 'Loyal Player', icon: '👑', description: 'Play 5 quizzes' },
  { id: 'night_owl', label: 'Night Owl', icon: '🦉', description: 'Play after 10 PM' }
];

const LEVELS = [
  { minXP: 0, label: 'Level 1: Novice' },
  { minXP: 500, label: 'Level 2: Apprentice' },
  { minXP: 1500, label: 'Level 3: Scholar' },
  { minXP: 3000, label: 'Level 4: Expert' },
  { minXP: 5000, label: 'Level 5: Master' },
  { minXP: 10000, label: 'Level 6: Grandmaster' }
];

export function updateDashboardUI() {
  const stats = getUserStats();
  if (!stats) return;

  // Header
  $('dashName').textContent = state.currentUser.name;
  $('dashAvatar').textContent = state.currentUser.avatar;
  
  // Level
  const level = [...LEVELS].reverse().find(l => stats.xp >= l.minXP);
  $('dashLevel').textContent = level.label;

  // Stats Grid
  $('statXP').textContent = stats.xp;
  $('statQuizzes').textContent = stats.totalQuizzes;
  $('statAccuracy').textContent = `${stats.bestAccuracy}%`;

  // Badges
  renderBadges(stats.badges || []);

  // History
  renderHistory(stats.history || []);

  // Global Leaderboard
  renderLeaderboard();
}

async function renderLeaderboard() {
  const leaderboard = await getLeaderboard(5);
  const container = $('leaderboardList');
  if (!container) return;

  container.innerHTML = '';
  
  if (leaderboard.length === 0) {
    container.innerHTML = '<p class="subtitle" style="text-align: center;">No scores yet.</p>';
    return;
  }

  leaderboard.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'history-item leaderboard-item';
    
    // Capitalize topic name (e.g., 'science' -> 'Science')
    const formattedTopic = item.topic.charAt(0).toUpperCase() + item.topic.slice(1);
    
    div.innerHTML = `
      <div class="history-info">
        <span class="topic-name">#${index + 1} ${item.username}</span>
        <span class="date">${formattedTopic}</span>
      </div>
      <div class="history-stats">
        <span class="score">${item.score} PTS</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderBadges(unlockedBadgeIds) {
  const grid = $('badgesGrid');
  grid.innerHTML = '';

  BADGES.forEach(badge => {
    const isUnlocked = unlockedBadgeIds.includes(badge.id);
    const item = document.createElement('div');
    item.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
    item.title = badge.description;
    
    item.innerHTML = `
      <div class="badge-icon">${badge.icon}</div>
      <div class="badge-label">${badge.label}</div>
    `;
    grid.appendChild(item);
  });
}

function renderHistory(history) {
  const list = $('historyList');
  list.innerHTML = '';

  if (history.length === 0) {
    list.innerHTML = '<p class="subtitle" style="text-align: center;">No activity yet. Start a quiz!</p>';
    return;
  }

  history.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="history-info">
        <span class="topic-name">${item.topic}</span>
        <span class="date">${item.date}</span>
      </div>
      <div class="history-stats">
        <span class="score">+${item.score} XP</span>
        <span class="accuracy">${item.accuracy}% Accuracy</span>
      </div>
    `;
    list.appendChild(div);
  });
}

export function showDashboard() {
  updateDashboardUI();
  $('startScreen').classList.add('hidden');
  $('dashboardScreen').classList.remove('hidden');
}

export function hideDashboard() {
  $('dashboardScreen').classList.add('hidden');
  $('startScreen').classList.remove('hidden');
}
