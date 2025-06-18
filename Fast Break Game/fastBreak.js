let questions = [];
    let totalTime = 90;
    let timeLeft, timer, paused, filled, usedGuesses, currentQuestion, correctAnswers;

    const timerText = document.getElementById('timer-text');
    const timerBar = document.getElementById('timer-bar');
    const answerEl = document.getElementById('answer');
    const submitBtn = document.getElementById('submit-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const resultEl = document.getElementById('result');
    const answersList = document.getElementById('answers-list');
    const questionEl = document.getElementById('question');

    function capitalize(str) {
      return str.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }

    function pickRandomQuestion() {
      currentQuestion = questions[Math.floor(Math.random() * questions.length)];
      correctAnswers = currentQuestion.answers;
      questionEl.textContent = currentQuestion.question;
      filled = Array(correctAnswers.length).fill("");
      usedGuesses = [];
      renderAnswers();
    }

    function updateTimerDisplay() {
      let min = String(Math.floor(timeLeft / 60)).padStart(2, '0');
      let sec = String(timeLeft % 60).padStart(2, '0');
      timerText.textContent = `${min}:${sec}`;
      timerBar.style.width = `${(timeLeft / totalTime) * 100}%`;
    }

    function renderAnswers() {
      answersList.innerHTML = "";
      for (let i = 0; i < correctAnswers.length; i++) {
        const li = document.createElement('li');
        if (filled[i]) {
          li.textContent = capitalize(filled[i]);
          li.className = "filled";
        } else {
          li.textContent = `#${i + 1}`;
        }
        answersList.appendChild(li);
      }
    }

    function startTimer() {
      paused = false;
      pauseBtn.textContent = "Pause";
      timer = setInterval(() => {
        if (!paused) {
          timeLeft--;
          updateTimerDisplay();
          if (timeLeft <= 0) {
            clearInterval(timer);
            timerText.textContent = "00:00";
            timerBar.style.width = "0%";
            answerEl.disabled = true;
            submitBtn.disabled = true;
            pauseBtn.disabled = true;
            playAgainBtn.style.display = "";
            // Show missed answers
            for (let i = 0; i < correctAnswers.length; i++) {
              if (!filled[i]) filled[i] = capitalize(correctAnswers[i]);
            }
            renderAnswers();
            resultEl.textContent = "Time's up! Here are the answers.";
          }
        }
      }, 1000);
    }

    function pauseTimer() {
      paused = true;
      pauseBtn.textContent = "Resume";
    }

    function resumeTimer() {
      paused = false;
      pauseBtn.textContent = "Pause";
    }

    function resetGame() {
      pickRandomQuestion();
      answerEl.value = "";
      resultEl.textContent = "";
      answerEl.disabled = false;
      submitBtn.disabled = false;
      pauseBtn.disabled = false;
      playAgainBtn.style.display = "none";
      timeLeft = totalTime;
      updateTimerDisplay();
      if (timer) clearInterval(timer);
      paused = false;
      pauseBtn.textContent = "Pause";
      renderAnswers();
      startTimer();
      answerEl.focus();
    }

    // Fetch questions and start game
    fetch('../Fast Break Game/questions.json')
      .then(response => response.json())
      .then(data => {
        questions = data;
        resetGame();
      })
      .catch(err => {
        questionEl.textContent = "Could not load questions.";
        submitBtn.disabled = true;
        pauseBtn.disabled = true;
      });

    submitBtn.onclick = function() {
      let guess = answerEl.value.trim().toLowerCase();
      if (!guess) return;
      if (usedGuesses.includes(guess)) {
        resultEl.textContent = "Already guessed!";
        answerEl.value = "";
        answerEl.focus();
        return;
      }
      let found = false;
      for (let i = 0; i < correctAnswers.length; i++) {
        if (guess === correctAnswers[i] && !filled[i]) {
          filled[i] = correctAnswers[i];
          found = true;
        }
      }
      usedGuesses.push(guess);
      renderAnswers();
      if (found) {
        resultEl.textContent = "Correct!";
      } else {
        resultEl.textContent = "Incorrect, try again!";
      }
      answerEl.value = "";
      answerEl.focus();
      // Check if all filled
      if (filled.every(Boolean)) {
        clearInterval(timer);
        answerEl.disabled = true;
        submitBtn.disabled = true;
        pauseBtn.disabled = true;
        playAgainBtn.style.display = "";
        resultEl.textContent = "You got them all! Great job!";
      }
    };

    answerEl.addEventListener("keyup", function(event) {
      if (event.key === "Enter" && !submitBtn.disabled) {
        submitBtn.click();
      }
    });

    pauseBtn.onclick = function() {
      if (paused) {
        resumeTimer();
      } else {
        pauseTimer();
      }
    };

    playAgainBtn.onclick = function() {
      resetGame();
    };