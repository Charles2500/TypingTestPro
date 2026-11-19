
document.addEventListener("DOMContentLoaded", () => {
    // =========================================
    // ELEMENTS
    // =========================================

    const wpmDisplay = document.getElementById("wpm");
    const accuracyDisplay = document.getElementById("accuracy");
    const timerDisplay = document.getElementById("timer");

    const textDisplay = document.getElementById("text");
    const typingInput = document.getElementById("cap");

    const difficultySelect = document.getElementById("difficulty");
    const durationSelect = document.getElementById("duration");

    const progressBar = document.getElementById("progressBar");
    const statusDisplay = document.getElementById("status");

    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");

    const charactersDisplay = document.getElementById("characters");
    const correctDisplay = document.getElementById("correct");
    const errorsDisplay = document.getElementById("errors");

    const themeToggle = document.getElementById("themeToggle");

    const toastContainer = document.getElementById("toastContainer");

    // Modal
    const resultModal = document.getElementById("resultModal");
    const modalBackdrop = document.getElementById("modalBackdrop");
    const closeModalBtn = document.getElementById("closeModal");
    const closeResultBtn = document.getElementById("closeResultBtn");
    const tryAgainBtn = document.getElementById("tryAgainBtn");

    const finalWpm = document.getElementById("finalWpm");
    const finalAccuracy = document.getElementById("finalAccuracy");
    const finalErrors = document.getElementById("finalErrors");

    const resultTitle = document.getElementById("resultTitle");
    const resultMessage = document.getElementById("resultMessage");

    // History
    const historyList = document.getElementById("historyList");
    const emptyHistory = document.getElementById("emptyHistory");
    const historyTableWrapper = document.getElementById("historyTableWrapper");
    const personalBestDisplay = document.getElementById("personalBest");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");

    // =========================================
    // SETTINGS AND STATE
    // =========================================

    const HISTORY_KEY = "typingTestHistory";
    const THEME_KEY = "typingTestTheme";

    let currentText = "";
    let timerInterval = null;

    let timeLeft = Number(durationSelect.value);
    let totalDuration = Number(durationSelect.value);

    let isActive = false;
    let hasStarted = false;
    let isFinished = false;

    let startTime = null;
    let elapsedSeconds = 0;

    // =========================================
    // SAMPLE TEXTS
    // =========================================

    const sampleTexts = {
        easy: [
            "The quick brown fox jumps over the lazy dog. Practice typing every day to become faster and more accurate.",
            "Learning a new skill takes time and patience. Start slowly and focus on typing each word correctly.",
            "Technology helps people communicate, learn, and work. Good typing skills make everyday tasks easier."
        ],

        medium: [
            "Success comes from consistent practice and a willingness to improve. Every small step brings you closer to your goals.",
            "Typing is an important skill in the modern world. Accuracy, speed, and concentration can help you become more productive.",
            "Developing good habits requires patience, discipline, and determination. Keep practicing and measure your progress."
        ],

        hard: [
            "JavaScript developers use variables, functions, arrays, and objects to create interactive applications. Accuracy matters!",
            "In 2026, technology continues to evolve: artificial intelligence, automation, and cloud computing are changing workflows.",
            "The equation is simple: (10 + 5) * 2 = 30. Can you type numbers, symbols, punctuation, and letters accurately?"
        ]
    };

    // =========================================
    // TOAST NOTIFICATIONS
    // =========================================

    function showToast(message, type = "success") {
        const toast = document.createElement("div");

        toast.className = `toast ${type}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("removing");

            setTimeout(() => {
                toast.remove();
            }, 250);
        }, 3000);
    }

    // =========================================
    // THEME
    // =========================================

    function applyTheme(theme) {
        document.body.classList.toggle("dark", theme === "dark");
        themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";

        document.querySelector('meta[name="theme-color"]')
            ?.setAttribute("content", theme === "dark" ? "#171923" : "#f6f5f1");

        localStorage.setItem(THEME_KEY, theme);
    }

    const savedTheme = localStorage.getItem(THEME_KEY) || "light";
    applyTheme(savedTheme);

    themeToggle.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("dark")
            ? "light"
            : "dark";

        applyTheme(nextTheme);
        showToast(`${nextTheme === "dark" ? "Dark" : "Light"} mode enabled`, "info");
    });

    // =========================================
    // TEXT GENERATION AND DISPLAY
    // =========================================

    function generateText() {
        const difficulty = difficultySelect.value;
        const choices = sampleTexts[difficulty];

        return choices[Math.floor(Math.random() * choices.length)];
    }

    function renderText() {
        textDisplay.innerHTML = "";

        for (let i = 0; i < currentText.length; i++) {
            const span = document.createElement("span");
            span.textContent = currentText[i];

            if (i === 0) {
                span.classList.add("current");
            }

            textDisplay.appendChild(span);
        }
    }

    // =========================================
    // STATISTICS
    // =========================================

    function calculateStats() {
        const typedText = typingInput.value;
        const spans = textDisplay.querySelectorAll("span");

        let correct = 0;
        let errors = 0;

        for (let i = 0; i < typedText.length; i++) {
            if (i >= currentText.length) {
                errors++;
            } else if (typedText[i] === currentText[i]) {
                correct++;
            } else {
                errors++;
            }
        }

        const characters = typedText.length;
        const accuracy = characters === 0
            ? 100
            : Math.round((correct / characters) * 100);

        let wpm = 0;

        if (elapsedSeconds > 0) {
            wpm = Math.round((correct / 5) / (elapsedSeconds / 60));
        }

        // Update character colors
        spans.forEach((span, index) => {
            span.classList.remove("correct", "incorrect", "current");

            if (index < typedText.length) {
                if (typedText[index] === currentText[index]) {
                    span.classList.add("correct");
                } else {
                    span.classList.add("incorrect");
                }
            }

            if (index === typedText.length && !isFinished) {
                span.classList.add("current");
            }
        });

        return {
            characters,
            correct,
            errors,
            accuracy,
            wpm
        };
    }

    function updateStats() {
        const stats = calculateStats();

        wpmDisplay.textContent = stats.wpm;
        accuracyDisplay.textContent = `${stats.accuracy}%`;

        charactersDisplay.textContent = stats.characters;
        correctDisplay.textContent = stats.correct;
        errorsDisplay.textContent = stats.errors;

        const progress = currentText.length === 0
            ? 0
            : Math.min((stats.characters / currentText.length) * 100, 100);

        progressBar.style.width = `${progress}%`;

        return stats;
    }

    // =========================================
    // TIMER
    // =========================================

    function startTimer() {
        if (timerInterval !== null || isFinished) {
            return;
        }

        startTime = Date.now();

        timerInterval = setInterval(() => {
            elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

            timeLeft = Math.max(0, totalDuration - elapsedSeconds);

            timerDisplay.textContent = timeLeft;

            updateStats();

            if (timeLeft <= 0) {
                finishTest("time");
            }
        }, 200);
    }

    function stopTimer() {
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // =========================================
    // START TEST
    // =========================================

    function startTest() {
        if (isActive) {
            typingInput.focus();
            return;
        }

        if (isFinished) {
            resetTest();
        }

        isActive = true;
        hasStarted = false;
        isFinished = false;

        typingInput.disabled = false;
        typingInput.value = "";

        typingInput.focus();

        startBtn.textContent = "Test Running...";
        startBtn.disabled = true;

        statusDisplay.textContent = "Start typing to begin the timer";

        showToast("Your test is ready. Start typing!", "info");

        renderText();
        updateStats();
    }

    // =========================================
    // TYPING INPUT
    // =========================================

    typingInput.addEventListener("input", () => {
        if (!isActive || isFinished) {
            return;
        }

        // Start timer with first typed character
        if (!hasStarted && typingInput.value.length > 0) {
            hasStarted = true;
            startTimer();

            statusDisplay.textContent = "Typing in progress...";
            showToast("Timer started!", "success");
        }

        // Prevent typing beyond displayed text
        if (typingInput.value.length > currentText.length) {
            typingInput.value = typingInput.value.slice(0, currentText.length);
        }

        const stats = updateStats();

        if (typingInput.value.length === currentText.length) {
            finishTest("complete");
        } else if (stats.errors > 0) {
            statusDisplay.textContent = "Check your mistakes and keep going";
        } else {
            statusDisplay.textContent = "Great! Keep typing...";
        }
    });

    // Clicking the displayed text focuses the input
    textDisplay.addEventListener("click", () => {
        if (isActive && !isFinished) {
            typingInput.focus();
        }
    });

    // =========================================
    // FINISH TEST
    // =========================================

    function finishTest(reason = "time") {
        if (isFinished) {
            return;
        }

        isFinished = true;
        isActive = false;

        stopTimer();

        if (hasStarted && startTime !== null) {
            elapsedSeconds = Math.max(
                1,
                Math.min(totalDuration, Math.ceil((Date.now() - startTime) / 1000))
            );
        }

        typingInput.disabled = true;
        startBtn.disabled = false;
        startBtn.textContent = "Start Test";

        const stats = updateStats();

        statusDisplay.textContent = reason === "complete"
            ? "Text completed!"
            : "Time is up!";

        timerDisplay.textContent = timeLeft;

        saveResult(stats);

        openResults(stats);

        if (reason === "complete") {
            showToast("Excellent! You completed the text.", "success");
        } else {
            showToast("Time is up! Your results are ready.", "info");
        }
    }

    // =========================================
    // RESULTS MODAL
    // =========================================

    function openResults(stats) {
        finalWpm.textContent = stats.wpm;
        finalAccuracy.textContent = `${stats.accuracy}%`;
        finalErrors.textContent = stats.errors;

        if (stats.wpm >= 60 && stats.accuracy >= 95) {
            resultTitle.textContent = "Excellent Work!";
            resultMessage.textContent = "Amazing typing speed and accuracy. Keep it up!";
        } else if (stats.accuracy >= 90) {
            resultTitle.textContent = "Great Job!";
            resultMessage.textContent = "You have good accuracy. Keep practicing to improve your speed.";
        } else {
            resultTitle.textContent = "Keep Practicing!";
            resultMessage.textContent = "Focus on accuracy first. Your speed will improve with practice.";
        }

        resultModal.classList.add("show");
        resultModal.setAttribute("aria-hidden", "false");

        closeModalBtn.focus();
    }

    function closeResults() {
        resultModal.classList.remove("show");
        resultModal.setAttribute("aria-hidden", "true");
    }

    closeModalBtn.addEventListener("click", closeResults);
    closeResultBtn.addEventListener("click", closeResults);
    modalBackdrop.addEventListener("click", closeResults);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && resultModal.classList.contains("show")) {
            closeResults();
        }
    });

    // =========================================
    // RESET TEST
    // =========================================

    function resetTest(showMessage = false) {
        stopTimer();

        isActive = false;
        hasStarted = false;
        isFinished = false;

        startTime = null;
        elapsedSeconds = 0;

        totalDuration = Number(durationSelect.value);
        timeLeft = totalDuration;

        currentText = generateText();

        typingInput.value = "";
        typingInput.disabled = true;

        timerDisplay.textContent = timeLeft;

        startBtn.disabled = false;
        startBtn.textContent = "Start Test";

        statusDisplay.textContent = "Ready to start";

        wpmDisplay.textContent = "0";
        accuracyDisplay.textContent = "100%";

        charactersDisplay.textContent = "0";
        correctDisplay.textContent = "0";
        errorsDisplay.textContent = "0";

        progressBar.style.width = "0%";

        closeResults();
        renderText();

        if (showMessage) {
            showToast("Test has been reset.", "info");
        }
    }

    // =========================================
    // HISTORY STORAGE
    // =========================================

    function getHistory() {
        try {
            const saved = JSON.parse(localStorage.getItem(HISTORY_KEY));

            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Could not read typing history:", error);
            return [];
        }
    }

    function saveResult(stats) {
        // Do not save a test that was never started
        if (!hasStarted) {
            return;
        }

        const history = getHistory();

        const result = {
            date: new Date().toISOString(),
            wpm: stats.wpm,
            accuracy: stats.accuracy,
            errors: stats.errors,
            duration: totalDuration,
            difficulty: difficultySelect.value
        };

        history.unshift(result);

        // Keep only the latest 50 results
        const limitedHistory = history.slice(0, 50);

        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
            renderHistory();
        } catch (error) {
            console.error("Could not save typing history:", error);
            showToast("Unable to save history in this browser.", "error");
        }
    }

    function renderHistory() {
        const history = getHistory();

        historyList.innerHTML = "";

        if (history.length === 0) {
            emptyHistory.hidden = false;
            historyTableWrapper.hidden = true;
            personalBestDisplay.textContent = "0";
            return;
        }

        emptyHistory.hidden = true;
        historyTableWrapper.hidden = false;

        const bestWpm = Math.max(...history.map(item => Number(item.wpm) || 0));

        personalBestDisplay.textContent = bestWpm;

        history.forEach(item => {
            const row = document.createElement("tr");

            const dateCell = document.createElement("td");
            const wpmCell = document.createElement("td");
            const accuracyCell = document.createElement("td");
            const errorsCell = document.createElement("td");
            const durationCell = document.createElement("td");
            const difficultyCell = document.createElement("td");

            const date = new Date(item.date);

            dateCell.textContent = isNaN(date.getTime())
                ? "Unknown"
                : date.toLocaleDateString();

            wpmCell.textContent = item.wpm;
            accuracyCell.textContent = `${item.accuracy}%`;
            errorsCell.textContent = item.errors;
            durationCell.textContent = `${item.duration}s`;

            difficultyCell.textContent =
                item.difficulty.charAt(0).toUpperCase() +
                item.difficulty.slice(1);

            row.append(
                dateCell,
                wpmCell,
                accuracyCell,
                errorsCell,
                durationCell,
                difficultyCell
            );

            historyList.appendChild(row);
        });
    }

    // =========================================
    // CLEAR HISTORY
    // =========================================

    clearHistoryBtn.addEventListener("click", () => {
        const history = getHistory();

        if (history.length === 0) {
            showToast("There is no history to clear.", "info");
            return;
        }

        const confirmed = confirm(
            "Are you sure you want to delete all typing history?"
        );

        if (!confirmed) {
            return;
        }

        localStorage.removeItem(HISTORY_KEY);

        renderHistory();

        showToast("Typing history cleared successfully.", "success");
    });

    // =========================================
    // BUTTON EVENTS
    // =========================================

    startBtn.addEventListener("click", startTest);

    resetBtn.addEventListener("click", () => {
        resetTest(true);
    });

    tryAgainBtn.addEventListener("click", () => {
        resetTest();
        startTest();
    });

    // =========================================
    // DIFFICULTY AND DURATION
    // =========================================

    difficultySelect.addEventListener("change", () => {
        if (isActive || hasStarted) {
            resetTest();
        } else {
            currentText = generateText();
            renderText();
        }

        showToast(
            `${difficultySelect.value.charAt(0).toUpperCase() + difficultySelect.value.slice(1)} difficulty selected.`,
            "info"
        );
    });

    durationSelect.addEventListener("change", () => {
        resetTest();

        showToast(
            `${durationSelect.value} seconds selected.`,
            "info"
        );
    });

    // =========================================
    // INITIALIZE
    // =========================================

    currentText = generateText();

    renderText();
    updateStats();
    renderHistory();

    timerDisplay.textContent = durationSelect.value;

});
