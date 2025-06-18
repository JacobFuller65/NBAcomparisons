let allQuestions = []; // Store all questions from the JSON file
let questions = []; // Store filtered questions for the current game
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let isPaused = false;
// Function to load questions from the JSON file
async function loadQuestions() {
  try {
    // Get the selected team
    const team = document.getElementById("teamSelect").value.toLowerCase();

    // Decide which file to load
    let questionsFile = "Questions/AllQuestions.json";
    if (team === "okc") {
      questionsFile = "Questions/okcQuestions.json";
    } 
    if (team === "2k25") {
      questionsFile = "Questions/2k25Questions.json";
    }
    else if (team === "lal") {
      questionsFile = "Questions/lalQuestions.json";
    }
    console.log("Fetching questions from:", questionsFile);
    const response = await fetch(questionsFile);
    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }
    allQuestions = await response.json();
    questions = [...allQuestions]; // <-- Add this line
    shuffleQuestions(); // Shuffle the filtered questions

    const numQuestions =
      parseInt(document.getElementById("numQuestions").value, 10) || 10;
    questions = questions.slice(0, numQuestions);

    startQuiz();
  } catch (error) {
    alert("Error loading questions: " + error.message);
    document.getElementById("config").classList.remove("hidden"); // Show config again
    document.getElementById("controls").classList.add("hidden"); // Hide controls
  }
}


// Function to shuffle the questions array
function shuffleQuestions() {
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
}

function startQuiz() {
  if (questions.length === 0) {
    alert(
      "No questions available for the selected criteria. Please try again."
    );
    return;
  }

  document.getElementById("config").classList.add("hidden"); // Hide config
  document.getElementById("controls").classList.remove("hidden"); // Show controls
  score = 0;
  currentQuestionIndex = 0;
  document.getElementById("score").textContent = `Score: 0 / 0`;
  updateQuestionsRemaining();
  showQuestion();
}

function pauseQuiz() {
  if (isPaused) {
    isPaused = false;
    document.getElementById("pauseBtn").textContent = "Pause";
    startTimer(); // Resume the timer
  } else {
    isPaused = true;
    document.getElementById("pauseBtn").textContent = "Resume";
    clearInterval(timerInterval); // Stop the timer
  }
}
//restart the quiz and reset everything
function startOverQuiz() {
  clearInterval(timerInterval);
  isPaused = false;
  document.getElementById("pauseBtn").textContent = "Pause";
  document.getElementById("config").classList.remove("hidden"); // Show config
  document.getElementById("controls").classList.add("hidden"); // Hide controls
  document.getElementById("question").textContent = "";
  document.getElementById("choices").innerHTML = "";
  document.getElementById("timer").textContent = "Time Left: 15s";
  document.getElementById("timer-bar").style.width = "100%";
  document.getElementById("score").textContent = "";
}
// Function to show the current question and choices
function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
  }
  const questionData = questions[currentQuestionIndex];
  const questionElement = document.getElementById("question");
  const choicesElement = document.getElementById("choices");
  questionElement.textContent = questionData.question;
  choicesElement.innerHTML = "";

  // Shuffle choices before displaying
  const shuffledChoices = [...questionData.choices];
  for (let i = shuffledChoices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledChoices[i], shuffledChoices[j]] = [shuffledChoices[j], shuffledChoices[i]];
  }

  shuffledChoices.forEach((choice) => {
    const button = document.createElement("button");
    button.textContent = choice;
    button.classList.add("choice-btn");
    button.addEventListener("click", () => checkAnswer(choice));
    choicesElement.appendChild(button);
  });

  startTimer();
}
// Function to check the selected answer and show if it's correct or wrong
function checkAnswer(selectedChoice) {
  const correctAnswer = questions[currentQuestionIndex]?.answer;
  if (selectedChoice === correctAnswer) {
    score++;
  }
  document.getElementById("score").textContent = `Score: ${score} / ${currentQuestionIndex + 1}`;
  updateQuestionsRemaining();
  showPopup(
    selectedChoice === correctAnswer ? "Correct!" : `Wrong! The correct answer was: ${correctAnswer}`,
    selectedChoice === correctAnswer
  );
}

function showPopup(message, isCorrect) {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popup-message");
  const popupCloseBtn = document.getElementById("popup-close-btn");

  // Get the additional info and image for the current question
  const additionalInfo = questions[currentQuestionIndex]?.["additional info"] || "No additional information available.";
  const imageUrl = questions[currentQuestionIndex]?.image || "";

  // Debug: Log the image URL
  console.log("Image URL:", imageUrl);

  // Update the popup message to include the additional info and image
  popupMessage.innerHTML = `
    <p>${message}</p>
    <p><strong>Did you know?</strong> ${additionalInfo}</p>
    ${imageUrl ? `<img src="${imageUrl}" alt="Correct Answer Image" style="max-width: 100%; height: auto; margin-top: 10px;">` : ""}
  `;

  popup.classList.remove("hidden");

  popupCloseBtn.onclick = () => {
    popup.classList.add("hidden");
    currentQuestionIndex++;
    showQuestion(); // Move to the next question
  };
}
// Function to start the timer
function startTimer() {
  let timeLeft = 15;
  const timerElement = document.getElementById("timer");
  const timerBar = document.getElementById("timer-bar");
  timerElement.textContent = `Time Left: ${timeLeft}s`;
  //start / restart the timer
  clearInterval(timerInterval);
  timerBar.style.width = "100%";

  // Function to update the timer every second
  timerInterval = setInterval(() => {
    if (isPaused) return; // Skip timer updates if paused
    timeLeft--;
    timerElement.textContent = `Time Left: ${timeLeft}s`;
    timerBar.style.width = `${(timeLeft / 15) * 100}%`; // Update progress bar width

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showPopup("Time is up! Moving to the next question.", false);
    }
  }, 1000);
}
// Function to end the quiz and show the summary
function endQuiz() {
  clearInterval(timerInterval);

  // Hide the game elements
  document.getElementById("config").classList.remove("hidden"); // Show config again
  document.getElementById("controls").classList.add("hidden"); // Hide controls
  document.getElementById("question").classList.add("hidden");
  document.getElementById("choices").classList.add("hidden");
  document.getElementById("timer").classList.add("hidden");
  document.getElementById("timer-container").classList.add("hidden");

  // Show the summary page
  document.getElementById("summary").classList.remove("hidden");

  // Display the final score as "X out of Y"
  const totalQuestions = questions.length;
  document.getElementById(
    "final-score"
  ).textContent = `Your Final Score: ${score} out of ${totalQuestions}`;

  // Update the leaderboard
  updateLeaderboard(score, totalQuestions);
}

function updateLeaderboard(score, totalQuestions) {
  // Get the leaderboard from localStorage or initialize it
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  // Add the current score to the leaderboard
  const playerName =
    prompt("Enter your name for the leaderboard:") || "Anonymous";
  leaderboard.push({ name: playerName, score, totalQuestions });

  // Sort the leaderboard by score in descending order
  leaderboard.sort((a, b) => b.score - a.score);

  // Save the updated leaderboard to localStorage
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  // Display the leaderboard
  const leaderboardElement = document.getElementById("leaderboard");
  leaderboardElement.innerHTML = "";
  leaderboard.forEach((entry, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${index + 1}. ${entry.name} - ${
      entry.score
    } out of ${entry.totalQuestions}`;
    leaderboardElement.appendChild(listItem);
  });
}

function updateQuestionsRemaining() {
  const remaining = questions.length - currentQuestionIndex;
  document.getElementById("questions-remaining").textContent =
    `Questions Remaining: ${remaining}`;
}
// Event listeners for buttons
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("startBtn").addEventListener("click", loadQuestions);
  document.getElementById("pauseBtn").addEventListener("click", pauseQuiz);
  document.getElementById("startOverBtn").addEventListener("click", startOverQuiz);
  document.getElementById("playAgainBtn").addEventListener("click", () => {
    document.getElementById("summary").classList.add("hidden");
    document.getElementById("config").classList.remove("hidden");
    document.getElementById("question").classList.remove("hidden");
    document.getElementById("choices").classList.remove("hidden");
    document.getElementById("timer").classList.remove("hidden");
    document.getElementById("timer-container").classList.remove("hidden");
    startOverQuiz();
  });
  document.getElementById("teamSelect").addEventListener("change", function() {
    const body = document.body;
    body.classList.remove("okc-theme", "lal-theme");
    if (this.value === "okc") {
      body.classList.add("okc-theme");
    } else if (this.value === "lal") {
      body.classList.add("lal-theme");
    }
  });
});
