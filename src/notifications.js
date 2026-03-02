import { state } from './state.js';

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      showWelcomeNotification();
    }
  }
}

export function showWelcomeNotification() {
  if (Notification.permission === "granted") {
    const streak = state.dailyStreak || 1;
    let message = "Welcome back to QuizMaster!";
    
    if (streak > 2) {
      message = `You're on a ${streak}-day streak! Keep the fire burning! 🔥`;
    } else {
      message = "Ready to sharpen your knowledge? Take a quiz today!";
    }

    new Notification("🧠 QuizMaster Reminder", {
      body: message,
      icon: "/favicon.ico", // Or any relevant icon
    });
  }
}

// Scheduled Hours: 12 PM (12), 4 PM (16), 8 PM (20), 10 PM (22)
const REMINDER_HOURS = [12, 16, 20, 22];

export function checkScheduledReminders() {
  if (Notification.permission !== "granted" || !state.currentUser) return;

  const now = new Date();
  const currentHour = now.getHours();
  const today = now.toISOString().split('T')[0];
  
  // Check if we already sent a reminder for this specific hour today
  const lastReminderKey = `lastReminder_${state.currentUser.id}_${today}_${currentHour}`;
  if (localStorage.getItem(lastReminderKey)) return;

  if (REMINDER_HOURS.includes(currentHour)) {
    // Check if user played today
    const lastPlayedDate = localStorage.getItem(`lastPlayedDate_${state.currentUser.id}`);
    const alreadyPlayed = (lastPlayedDate === today);

    // Context-aware messages
    let title = "🚀 Study Time!";
    let message = "Ready for a quick 5-minute quiz?";

    if (currentHour === 12) {
       message = "Midday recharge! Test your knowledge for 5 minutes.";
    } else if (currentHour === 16) {
       message = "Evening is coming! Keep your streak alive with a quiz.";
    } else if (currentHour >= 20) {
       if (alreadyPlayed) {
          // If they already played, don't bother them with a nudge, maybe a 'Good job'
          return; 
       }
       title = "🔥 Don't Lose Your Streak!";
       message = "The day is almost over. Play a quiz now to keep your fire burnin'!";
    }

    new Notification(title, {
      body: message,
      icon: "/favicon.ico",
      tag: "scheduled-reminder" // Prevents stacking duplicate notifications
    });

    // Mark as reminded for this hour
    localStorage.setItem(lastReminderKey, "true");
  }
}

// Check every 5 minutes while app is open
export function initReminderInterval() {
  checkScheduledReminders(); // Initial check
  setInterval(checkScheduledReminders, 1000 * 60 * 5); // Every 5 mins
}

