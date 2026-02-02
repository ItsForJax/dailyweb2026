const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsList = document.getElementById('laps');

let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let lapCount = 0;

function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

function updateDisplay() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    display.textContent = formatTime(elapsedTime);
}

function start() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateDisplay, 10);
        startBtn.textContent = 'Stop';
        startBtn.classList.add('running');
        lapBtn.disabled = false;
        resetBtn.disabled = true;
    } else {
        isRunning = false;
        clearInterval(timerInterval);
        startBtn.textContent = 'Start';
        startBtn.classList.remove('running');
        lapBtn.disabled = true;
        resetBtn.disabled = false;
    }
}

function lap() {
    if (isRunning) {
        lapCount++;
        const li = document.createElement('li');
        li.innerHTML = `<span>Lap ${lapCount}</span><span>${formatTime(elapsedTime)}</span>`;
        lapsList.insertBefore(li, lapsList.firstChild);
    }
}

function reset() {
    isRunning = false;
    clearInterval(timerInterval);
    elapsedTime = 0;
    lapCount = 0;
    display.textContent = '00:00:00.000';
    startBtn.textContent = 'Start';
    startBtn.classList.remove('running');
    lapBtn.disabled = true;
    resetBtn.disabled = true;
    lapsList.innerHTML = '';
}

startBtn.addEventListener('click', start);
lapBtn.addEventListener('click', lap);
resetBtn.addEventListener('click', reset);
