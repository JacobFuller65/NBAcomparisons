// Nickname Game JavaScript
let allQuestions = [];
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;

// DOM elements
const configSection = document.getElementById('config');
const gameArea = document.getElementById('game-area');
const gameOverSection = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const questionText = document.getElementById('question-text');
const choicesContainer = document.getElementById('choices');
const scoreDisplay = document.getElementById('score');
const totalQuestionsDisplay = document.getElementById('total-questions');
const additionalInfo = document.getElementById('additional-info');
const finalScore = document.getElementById('final-score');
const finalTotal = document.getElementById('final-total');
const percentage = document.getElementById('percentage');

// Event listeners
startBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', nextQuestion);
playAgainBtn.addEventListener('click', resetGame);

// Load questions from JSON file
async function loadQuestions() {
  try {
    const response = await fetch('nicknameGameQuestions.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }
    allQuestions = await response.json();
    console.log(`Loaded ${allQuestions.length} questions`);
  } catch (error) {
    console.error('Error loading questions:', error);
    alert('Error loading questions. Please try again.');
  }
}

// Start the game
async function startGame() {
  // Load questions if not already loaded
  if (allQuestions.length === 0) {
    await loadQuestions();
  }

  // Get number of questions from selection
  const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);
  
  // Shuffle and select questions
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  questions = shuffled.slice(0, numQuestions);
  
  // Reset game state
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswer = null;
  
  // Update displays
  totalQuestionsDisplay.textContent = questions.length;
  scoreDisplay.textContent = score;
  
  // Show game area, hide config
  configSection.classList.add('hidden');
  gameArea.classList.remove('hidden');
  gameOverSection.classList.add('hidden');
  
  // Load first question
  loadQuestion();
}

// Load current question
function loadQuestion() {
  if (currentQuestionIndex >= questions.length) {
    endGame();
    return;
  }
  
  const question = questions[currentQuestionIndex];
  
  // Display question
  questionText.textContent = question.question;
  
  // Clear previous choices
  choicesContainer.innerHTML = '';
  
  // Create choice buttons
  question.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.textContent = choice;
    button.className = 'choice-btn';
    button.addEventListener('click', () => selectAnswer(choice, button));
    choicesContainer.appendChild(button);
  });
  
  // Hide additional info and next button
  additionalInfo.classList.add('hidden');
  nextBtn.classList.add('hidden');
  selectedAnswer = null;
}

// Handle answer selection
function selectAnswer(choice, buttonElement) {
  if (selectedAnswer !== null) return; // Prevent multiple selections
  
  selectedAnswer = choice;
  const question = questions[currentQuestionIndex];
  const isCorrect = choice === question.answer;
  
  // Update score if correct
  if (isCorrect) {
    score++;
    scoreDisplay.textContent = score;
  }
  
  // Style all buttons to show correct/incorrect
  const allButtons = choicesContainer.querySelectorAll('.choice-btn');
  allButtons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === question.answer) {
      btn.classList.add('correct');
    } else if (btn === buttonElement && !isCorrect) {
      btn.classList.add('incorrect');
    }
  });
  
  // Show additional info
  additionalInfo.textContent = question['additional info'] || `The correct answer is ${question.answer}`;
  additionalInfo.classList.remove('hidden');
  
  // Show next button
  nextBtn.classList.remove('hidden');
}

// Move to next question
function nextQuestion() {
  currentQuestionIndex++;
  loadQuestion();
}

// End the game
function endGame() {
  gameArea.classList.add('hidden');
  gameOverSection.classList.remove('hidden');
  
  // Display final score
  finalScore.textContent = score;
  finalTotal.textContent = questions.length;
  const pct = Math.round((score / questions.length) * 100);
  percentage.textContent = pct;
}

// Reset game to initial state
function resetGame() {
  gameOverSection.classList.add('hidden');
  configSection.classList.remove('hidden');
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswer = null;
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Nickname Game loaded');
});