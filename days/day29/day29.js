const holes = document.querySelectorAll('.hole');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const bestDisplay = document.getElementById('best');
const startBtn = document.getElementById('startBtn');
const overlay = document.getElementById('overlay');
const finalScoreDisplay = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');

let score = 0;
let timeLeft = 30;
let gameRunning = false;
let lastHole = null;
let moleTimeout = null;
let gameInterval = null;
let best = parseInt(localStorage.getItem('whackamole-best')) || 0;

bestDisplay.textContent = best;

function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole() {
    const index = Math.floor(Math.random() * holes.length);
    const hole = holes[index];

    if (hole === lastHole) {
        return randomHole();
    }

    lastHole = hole;
    return hole;
}

function popUp() {
    if (!gameRunning) return;

    const hole = randomHole();
    const time = randomTime(400, 1000);

    hole.classList.add('up');

    moleTimeout = setTimeout(() => {
        hole.classList.remove('up');
        if (gameRunning) popUp();
    }, time);
}

function whack(e) {
    if (!gameRunning) return;

    const hole = e.currentTarget;
    if (!hole.classList.contains('up')) return;

    score++;
    scoreDisplay.textContent = score;

    hole.classList.remove('up');
    hole.classList.add('whacked');

    setTimeout(() => {
        hole.classList.remove('whacked');
    }, 200);
}

function startGame() {
    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    gameRunning = true;
    startBtn.disabled = true;
    overlay.classList.remove('show');

    holes.forEach(hole => {
        hole.classList.remove('up', 'whacked');
    });

    gameInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    popUp();
}

function endGame() {
    gameRunning = false;
    clearTimeout(moleTimeout);
    clearInterval(gameInterval);
    startBtn.disabled = false;

    holes.forEach(hole => {
        hole.classList.remove('up');
    });

    if (score > best) {
        best = score;
        localStorage.setItem('whackamole-best', best);
        bestDisplay.textContent = best;
    }

    finalScoreDisplay.textContent = score;
    overlay.classList.add('show');
}

// Event listeners
holes.forEach(hole => {
    hole.addEventListener('click', whack);
    hole.addEventListener('touchstart', (e) => {
        e.preventDefault();
        whack(e);
    }, { passive: false });
});

startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', startGame);
