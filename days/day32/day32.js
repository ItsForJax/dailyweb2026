const sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump.",
    "The five boxing wizards jump quickly.",
    "Sphinx of black quartz judge my vow.",
    "Two driven jocks help fax my big quiz.",
    "The jay pig fox and zebra quit.",
    "Quick zephyrs blow vexing daft Jim.",
    "Waltz nymph for quick jigs vex bud.",
    "Glib jocks quiz nymph to vex dwarf."
];

const textDisplay = document.getElementById('textDisplay');
const input = document.getElementById('input');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const timeEl = document.getElementById('time');
const restartBtn = document.getElementById('restartBtn');

let currentText = '';
let startTime = null;
let timerInterval = null;
let timeLeft = 60;
let totalChars = 0;
let correctChars = 0;
let isFinished = false;

function getRandomText() {
    const shuffled = [...sentences].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).join(' ');
}

function renderText() {
    const typed = input.value;
    let html = '';

    for (let i = 0; i < currentText.length; i++) {
        if (i < typed.length) {
            if (typed[i] === currentText[i]) {
                html += `<span class="correct">${currentText[i]}</span>`;
            } else {
                html += `<span class="incorrect">${currentText[i]}</span>`;
            }
        } else if (i === typed.length) {
            html += `<span class="current">${currentText[i]}</span>`;
        } else {
            html += `<span>${currentText[i]}</span>`;
        }
    }

    textDisplay.innerHTML = html;
}

function startTimer() {
    if (startTime) return;
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timeLeft = Math.max(0, 60 - elapsed);
        timeEl.textContent = timeLeft;

        if (timeLeft === 0) {
            endTest();
        }
    }, 100);
}

function calculateStats() {
    if (!startTime) return;

    const typed = input.value;
    correctChars = 0;

    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === currentText[i]) {
            correctChars++;
        }
    }

    totalChars = typed.length;

    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const words = correctChars / 5;
    const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    wpmEl.textContent = wpm;
    accuracyEl.textContent = accuracy;
}

function endTest() {
    isFinished = true;
    clearInterval(timerInterval);
    input.disabled = true;
    calculateStats();
}

function init() {
    currentText = getRandomText();
    input.value = '';
    input.disabled = false;
    startTime = null;
    timeLeft = 60;
    totalChars = 0;
    correctChars = 0;
    isFinished = false;

    if (timerInterval) clearInterval(timerInterval);

    wpmEl.textContent = '0';
    accuracyEl.textContent = '100';
    timeEl.textContent = '60';

    renderText();
    input.focus();
}

input.addEventListener('input', () => {
    if (isFinished) return;

    startTimer();
    renderText();
    calculateStats();

    if (input.value === currentText) {
        endTest();
    }
});

restartBtn.addEventListener('click', init);

init();
