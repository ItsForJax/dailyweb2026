// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRID_SIZE = 20;
const CANVAS_SIZE = 600;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;

// Game state
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameSpeed = 200;
let gameLoop;

// DOM elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Initialize
highScoreElement.textContent = String(highScore).padStart(4, '0');

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (!gameRunning && (key === 'w' || key === 'a' || key === 's' || key === 'd' || e.key === ' ')) {
        startGame();
        return;
    }

    // Prevent default for WASD keys
    if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        e.preventDefault();
    }

    switch(key) {
        case 'w':
            if (dy === 0) { // Prevent 180-degree turns
                dx = 0;
                dy = -1;
            }
            break;
        case 's':
            if (dy === 0) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'a':
            if (dx === 0) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'd':
            if (dx === 0) {
                dx = 1;
                dy = 0;
            }
            break;
    }
});

function startGame() {
    startScreen.classList.add('hidden');
    gameRunning = true;
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    score = 0;
    gameSpeed = 200;
    updateScore();
    generateFood();
    gameLoop = setInterval(update, gameSpeed);
}

function resetGame() {
    gameOverScreen.classList.add('hidden');
    startGame();
}

function update() {
    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();

        // Increase speed slightly every 50 points
        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 5;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, gameSpeed);
        }
    } else {
        // Remove tail
        snake.pop();
    }

    draw();
}

function draw() {
    // Clear canvas with retro effect
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid (optional, for extra retro feel)
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head - brighter green
            ctx.fillStyle = '#0f0';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#0f0';
        } else {
            // Body - darker green
            ctx.fillStyle = '#0a0';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#0a0';
        }

        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );

        // Draw eyes on head
        if (index === 0) {
            ctx.fillStyle = '#000';
            ctx.shadowBlur = 0;

            const eyeSize = 3;
            const eyeOffset = 5;

            // Determine eye position based on direction
            if (dx === 1) { // Moving right
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset, segment.y * GRID_SIZE + GRID_SIZE - 8, eyeSize, eyeSize);
            } else if (dx === -1) { // Moving left
                ctx.fillRect(segment.x * GRID_SIZE + 2, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 2, segment.y * GRID_SIZE + GRID_SIZE - 8, eyeSize, eyeSize);
            } else if (dy === -1) { // Moving up
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 2, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - 8, segment.y * GRID_SIZE + 2, eyeSize, eyeSize);
            } else if (dy === 1) { // Moving down
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - 8, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset, eyeSize, eyeSize);
            }
        }
    });

    // Draw food with pulsing effect
    const pulseOffset = Math.sin(Date.now() / 200) * 2;
    ctx.fillStyle = '#f00';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f00';
    ctx.fillRect(
        food.x * GRID_SIZE + 2 - pulseOffset / 2,
        food.y * GRID_SIZE + 2 - pulseOffset / 2,
        GRID_SIZE - 4 + pulseOffset,
        GRID_SIZE - 4 + pulseOffset
    );
    ctx.shadowBlur = 0;
}

function generateFood() {
    let newFood;
    let validPosition = false;

    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };

        // Check if food is not on snake
        validPosition = !snake.some(segment =>
            segment.x === newFood.x && segment.y === newFood.y
        );
    }

    food = newFood;
}

function updateScore() {
    scoreElement.textContent = String(score).padStart(4, '0');

    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = String(highScore).padStart(4, '0');
        localStorage.setItem('snakeHighScore', highScore);
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Mobile control buttons
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');

btnUp.addEventListener('click', (e) => {
    e.preventDefault();
    if (!gameRunning) {
        startGame();
        return;
    }
    if (dy === 0) {
        dx = 0;
        dy = -1;
    }
});

btnDown.addEventListener('click', (e) => {
    e.preventDefault();
    if (!gameRunning) {
        startGame();
        return;
    }
    if (dy === 0) {
        dx = 0;
        dy = 1;
    }
});

btnLeft.addEventListener('click', (e) => {
    e.preventDefault();
    if (!gameRunning) {
        startGame();
        return;
    }
    if (dx === 0) {
        dx = -1;
        dy = 0;
    }
});

btnRight.addEventListener('click', (e) => {
    e.preventDefault();
    if (!gameRunning) {
        startGame();
        return;
    }
    if (dx === 0) {
        dx = 1;
        dy = 0;
    }
});

// Initial draw
draw();
