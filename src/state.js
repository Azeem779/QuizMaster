// ============ APPLICATION STATE ============
export const state = {
  // Auth
  isLoggedIn: false,
  currentUser: null,
  
  // Quiz
  topics: [],
  selectedTopic: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  correctCount: 0,
  answered: false,
  shuffleEnabled: true,
  timerEnabled: true,
  soundEnabled: true,
  darkMode: false,
  timeLeft: 30,
  timerInterval: null,
  startTime: null,
  questionTimes: [],
  quizPaused: false,
  questionStartTime: null,
  missedQuestions: [], // Track incorrect answers for review
};

// Reset quiz state
export function resetQuizState() {
  state.currentIndex = 0;
  state.score = 0;
  state.selectedAnswerIndex = null;
  state.streak = 0;
  state.bestStreak = 0;
  state.correctCount = 0;
  state.answered = false;
  state.questionTimes = [];
  state.quizPaused = false;
  state.missedQuestions = [];
}
