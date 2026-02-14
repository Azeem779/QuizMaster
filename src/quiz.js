import { state, resetQuizState } from "./state.js";
import { $, shuffle, formatTime } from "./utils.js";
import { playSound } from "./audio.js";
import { createConfetti } from "./confetti.js";
import {
  startTimer,
  stopTimer,
  setTimeoutCallback,
  getTimerDuration,
} from "./timer.js";
import {
  saveHighScore,
  loadHighScore,
  getUserStats,
  saveUserStats,
  saveScoreToSupabase
} from "./storage.js";

// ============ QUIZ MODULE ============

// DOM Elements
const startScreen = $("startScreen");
const quizScreen = $("quizScreen");
const resultsScreen = $("resultsScreen");
const topicSelect = $("topicSelect");
const questionText = $("questionText");
const optionsContainer = $("optionsContainer");
const currentQuestion = $("currentQuestion");
const totalQuestions = $("totalQuestions");
const currentScore = $("currentScore");
const progressFill = $("progressFill");
const explanationBox = $("explanationBox");
const explanationText = $("explanationText");
const streakIndicator = $("streakIndicator");
const streakCount = $("streakCount");
const nextBtn = $("nextBtn");
const highScoreDisplay = $("highScoreDisplay");
const quitModal = $("quitModal");
const modalScore = $("modalScore");
const modalCorrect = $("modalCorrect");
const modalProgress = $("modalProgress");

// ============ TOPICS ============

export async function loadTopics() {
  try {
    const response = await fetch("/topics.json");
    const data = await response.json();
    state.topics = data.topics;
    populateTopicDropdown();
  } catch (error) {
    console.error("Failed to load topics:", error);
    topicSelect.innerHTML =
      '<option value="" disabled selected>Failed to load topics</option>';
  }
}

function populateTopicDropdown() {
  topicSelect.innerHTML =
    '<option value="" disabled selected>-- Select a topic --</option>';

  state.topics.forEach((topic) => {
    const option = document.createElement("option");
    option.value = topic.id;
    option.textContent = `${topic.icon} ${topic.name} (${topic.questionCount} questions)`;
    topicSelect.appendChild(option);
  });
}

export function updateHighScoreDisplay() {
  highScoreDisplay.textContent = loadHighScore();
}

// ============ QUESTIONS ============

async function loadQuestions() {
  try {
    const topic = state.topics.find((t) => t.id === state.selectedTopic);
    if (!topic) throw new Error("Topic not found");

    const response = await fetch(`/${topic.file}`);
    let questions = await response.json();
    if (state.shuffleEnabled) {
      questions = shuffle(questions);
    }
    state.questions = questions;
    totalQuestions.textContent = questions.length;
  } catch (error) {
    console.error("Failed to load questions:", error);
    questionText.textContent = "Failed to load questions. Please refresh.";
  }
}

// ============ QUIZ FLOW ============

export async function startQuiz() {
  if (!state.selectedTopic) {
    topicSelect.focus();
    topicSelect.style.borderColor = "var(--accent-error)";
    setTimeout(() => (topicSelect.style.borderColor = ""), 2000);
    return;
  }

  resetQuizState();
  currentScore.textContent = "0";
  progressFill.style.width = "0%";
  updateStreakDisplay();

  startScreen.classList.add("hidden");
  resultsScreen.classList.remove("active");
  quizScreen.classList.add("active");

  state.startTime = Date.now();
  await loadQuestions();

  // Set timeout callback
  setTimeoutCallback(handleTimeout);

  showQuestion();
}

function showQuestion() {
  const question = state.questions[state.currentIndex];
  state.answered = false;
  state.questionStartTime = Date.now();

  questionText.textContent = question.question;
  currentQuestion.textContent = state.currentIndex + 1;
  progressFill.style.width =
    (state.currentIndex / state.questions.length) * 100 + "%";

  optionsContainer.innerHTML = "";
  const letters = ["A", "B", "C", "D"];

  question.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `
      <span class="option-letter">${letters[index]}</span>
      <span class="option-text">${option}</span>
      <span class="option-icon">✓</span>
    `;
    btn.addEventListener("click", () => handleOptionClick(index));
    optionsContainer.appendChild(btn);
  });

  // Reset UI states
  explanationBox.classList.remove("show");
  state.selectedAnswerIndex = null;

  // Disable the next button initially, used as submit now
  nextBtn.textContent = "Submit Answer";
  nextBtn.disabled = true;
  nextBtn.classList.remove("hidden");
  nextBtn.onclick = submitAnswer;

  startTimer();
}

function handleOptionClick(index) {
  if (state.answered) return;

  const options = optionsContainer.querySelectorAll(".option-btn");
  options.forEach((opt, i) => {
    if (i === index) {
      opt.classList.add("selected");
      state.selectedAnswerIndex = index;
    } else {
      opt.classList.remove("selected");
    }
  });

  nextBtn.disabled = false;

  // Update submit handler
  nextBtn.onclick = () => submitAnswer();
}

function submitAnswer() {
  if (state.answered || state.selectedAnswerIndex === null) return;

  const selectedIndex = state.selectedAnswerIndex;
  handleAnswer(selectedIndex);
}

function handleAnswer(selectedIndex) {
  if (state.answered) return;
  state.answered = true;
  stopTimer();

  const question = state.questions[state.currentIndex];
  const isCorrect = selectedIndex === question.correct;
  const timeTaken = Math.round((Date.now() - state.questionStartTime) / 1000);
  state.questionTimes.push(timeTaken);

  const options = optionsContainer.querySelectorAll(".option-btn");

  options.forEach((opt, i) => {
    opt.disabled = true;
    if (i === question.correct) {
      opt.classList.add("correct");
      opt.querySelector(".option-icon").textContent = "✓";
    } else if (i === selectedIndex && !isCorrect) {
      opt.classList.add("wrong");
      opt.querySelector(".option-icon").textContent = "✗";
    }
  });

  if (isCorrect) {
    state.correctCount++;
    state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;

    const timeBonus = state.timerEnabled ? Math.max(0, state.timeLeft * 2) : 10;
    const streakBonus = Math.min(state.streak * 5, 25);
    const points = 10 + timeBonus + streakBonus;
    state.score += points;

    currentScore.textContent = state.score;
    playSound("correct");
    createConfetti();
  } else {
    state.streak = 0;
    playSound("wrong");
    // Track missed question
    state.missedQuestions.push({
      ...question,
      userAnswer: selectedIndex,
    });
  }

  updateStreakDisplay();
  showExplanation(question.explanation);

  nextBtn.textContent = "Next Question";
  nextBtn.disabled = false;
  nextBtn.onclick = nextQuestion;
}

function handleTimeout() {
  if (state.answered) return;
  state.answered = true;
  state.streak = 0;
  updateStreakDisplay();

  const question = state.questions[state.currentIndex];
  const options = optionsContainer.querySelectorAll(".option-btn");

  options.forEach((opt, i) => {
    opt.disabled = true;
    if (i === question.correct) {
      opt.classList.add("correct");
    }
  });

  playSound("wrong");
  showExplanation(question.explanation);
  
  // Update Next Button for Timeout
  nextBtn.textContent = "Next Question";
  nextBtn.disabled = false;
  nextBtn.classList.remove("hidden");
  nextBtn.onclick = nextQuestion;

  state.questionTimes.push(getTimerDuration());

  // Track missed question (timeout)
  state.missedQuestions.push({
    ...question,
    userAnswer: -1, // -1 means timeout/no answer
  });
}

function showExplanation(text) {
  explanationText.textContent = text;
  explanationBox.classList.add("show");
}

export function nextQuestion() {
  state.currentIndex++;

  if (state.currentIndex >= state.questions.length) {
    showResults(false);
  } else {
    showQuestion();
  }
}

// ============ STREAK ============

function updateStreakDisplay() {
  streakCount.textContent = state.streak;
  if (state.streak >= 2) {
    streakIndicator.classList.add("show");
  } else {
    streakIndicator.classList.remove("show");
  }
}

// ============ RESULTS ============

export function showResults(wasQuit = false) {
  stopTimer();
  quizScreen.classList.remove("active");
  resultsScreen.classList.add("active");
  quitModal.classList.add("hidden");

  const answeredCount = wasQuit
    ? state.currentIndex + (state.answered ? 1 : 0)
    : state.questions.length;

  const totalTime = state.questionTimes.reduce((a, b) => a + b, 0);
  const avgTime = answeredCount > 0 ? Math.round(totalTime / answeredCount) : 0;
  const accuracy =
    answeredCount > 0
      ? Math.round((state.correctCount / answeredCount) * 100)
      : 0;

  $("finalScore").textContent = state.score;
  $("correctAnswers").textContent = `${state.correctCount}/${answeredCount}`;
  $("accuracy").textContent = `${accuracy}%`;
  $("bestStreak").textContent = state.bestStreak;
  $("timeTaken").textContent = formatTime(totalTime);
  $("avgTime").textContent = `${avgTime}s`;

  if (wasQuit) {
    $("resultsIcon").textContent = "🚪";
    $("resultsTitle").textContent = "Quiz Ended Early";
    $("resultsSubtitle").textContent =
      `You completed ${answeredCount} of ${state.questions.length} questions`;
  } else if (accuracy >= 80) {
    $("resultsIcon").textContent = "🏆";
    $("resultsTitle").textContent = "Outstanding!";
    $("resultsSubtitle").textContent = "You're a quiz master!";
    createConfetti();
  } else if (accuracy >= 60) {
    $("resultsIcon").textContent = "🎉";
    $("resultsTitle").textContent = "Great Job!";
    $("resultsSubtitle").textContent = "Well done on completing the quiz!";
  } else if (accuracy >= 40) {
    $("resultsIcon").textContent = "👍";
    $("resultsTitle").textContent = "Good Effort!";
    $("resultsSubtitle").textContent = "Keep practicing to improve!";
  } else {
    $("resultsIcon").textContent = "📚";
    $("resultsTitle").textContent = "Keep Learning!";
    $("resultsSubtitle").textContent = "Try again to beat your score!";
  }

  // Save basic high score
  saveHighScore();

  // Save to Supabase (Global score tracking)
  saveScoreToSupabase(state.correctCount, answeredCount);

  // Save advanced stats
  const stats = getUserStats();
  if (stats) {
    stats.xp += state.score;
    stats.totalQuizzes += 1;
    if (accuracy > stats.bestAccuracy) stats.bestAccuracy = accuracy;

    // Add to history (keep last 10)
    const topicName =
      state.topics.find((t) => t.id === state.selectedTopic)?.name || "Unknown";
    stats.history.unshift({
      topic: topicName,
      score: state.score,
      accuracy: accuracy,
      date: new Date().toLocaleDateString(),
    });
    if (stats.history.length > 10) stats.history.pop();

    // Check for new badges
    checkBadges(stats, accuracy);

    saveUserStats(stats);
  }

  // Toggle Review Mistakes button
  const reviewBtn = $("reviewBtn");
  if (state.missedQuestions.length > 0) {
    reviewBtn.classList.remove("hidden");
  } else {
    reviewBtn.classList.add("hidden");
  }

  updateHighScoreDisplay();
}

// ============ MISTAKE REVIEW ============

export function showReview() {
  resultsScreen.classList.remove("active");
  $("reviewScreen").classList.remove("hidden");
  renderMistakes();
}

export function hideReview() {
  $("reviewScreen").classList.add("hidden");
  resultsScreen.classList.add("active");
}

function renderMistakes() {
  const list = $("reviewList");
  list.innerHTML = "";

  state.missedQuestions.forEach((q, index) => {
    const item = document.createElement("div");
    item.className = "review-item";

    item.innerHTML = `
      <div class="review-question">${index + 1}. ${q.question}</div>
      <div class="review-answers">
        <div class="review-answer wrong">
          <span>❌ Your Answer:</span> 
          <strong>${q.userAnswer === -1 ? "Timeout (No Answer)" : q.options[q.userAnswer]}</strong>
        </div>
        <div class="review-answer correct">
          <span>✅ Correct Answer:</span> 
          <strong>${q.options[q.correct]}</strong>
        </div>
      </div>
      <div class="review-explanation">
        <strong>💡 Explanation:</strong> ${q.explanation}
      </div>
    `;
    list.appendChild(item);
  });
}

function checkBadges(stats, accuracy) {
  if (!stats.badges) stats.badges = [];

  const unlock = (id) => {
    if (!stats.badges.includes(id)) {
      stats.badges.push(id);
    }
  };

  // Badge: First Quiz
  unlock("first_quiz");

  // Badge: Perfect 100
  if (accuracy === 100) unlock("perfect_accuracy");

  // Badge: Streak 5
  if (state.bestStreak >= 5) unlock("streak_5");

  // Badge: Speed Demon (Any question answered in < 3s)
  if (state.questionTimes.some((t) => t < 3)) unlock("speed_demon");

  // Badge: Loyal Player
  if (stats.totalQuizzes >= 5) unlock("loyal_user");

  // Badge: Night Owl (Played after 10 PM)
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) unlock("night_owl");
}

// ============ NAVIGATION ============

export function goToHome() {
  stopTimer();
  quizScreen.classList.remove("active");
  resultsScreen.classList.remove("active");
  startScreen.classList.remove("hidden");
  quitModal.classList.add("hidden");
  state.quizPaused = false;
  updateHighScoreDisplay();
}

// ============ QUIT MODAL ============

export function showQuitModal() {
  state.quizPaused = true;
  quitModal.classList.remove("hidden");

  const answeredCount = state.currentIndex + (state.answered ? 1 : 0);
  const progress = Math.round((answeredCount / state.questions.length) * 100);

  modalScore.textContent = state.score;
  modalCorrect.textContent = state.correctCount;
  modalProgress.textContent = `${progress}%`;
}

export function hideQuitModal() {
  state.quizPaused = false;
  quitModal.classList.add("hidden");
}

export function confirmQuit() {
  showResults(true);
}

// ============ SHARE ============

export function shareResults() {
  const answeredCount = state.currentIndex + (state.answered ? 1 : 0);
  const accuracy =
    answeredCount > 0
      ? Math.round((state.correctCount / answeredCount) * 100)
      : 0;
  const topicName =
    state.topics.find((t) => t.id === state.selectedTopic)?.name || "Quiz";

  const text = `🧠 QuizMaster Results!\n📚 Topic: ${topicName}\n\n⭐ Score: ${state.score}\n✅ Correct: ${state.correctCount}/${answeredCount}\n📊 Accuracy: ${accuracy}%\n🔥 Best Streak: ${state.bestStreak}\n\nCan you beat my score?`;

  if (navigator.share) {
    navigator.share({ title: "QuizMaster Results", text });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const shareBtn = $("shareBtn");
      shareBtn.textContent = "✓ Copied!";
      setTimeout(() => (shareBtn.textContent = "📤 Share"), 2000);
    });
  }
}
