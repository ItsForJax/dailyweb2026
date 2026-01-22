const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const messageEl = document.getElementById('message');
const messageText = document.getElementById('messageText');

// Game dimensions
const GAME_WIDTH = 600;
const GAME_HEIGHT = 500;

// Responsive sizing
function setCanvasSize() {
    const maxWidth = Math.min(window.innerWidth - 40, GAME_WIDTH);
    const scale = maxWidth / GAME_WIDTH;
    canvas.width = GAME_WIDTH * scale;
    canvas.height = GAME_HEIGHT * scale;
    ctx.scale(scale, scale);
}

setCanvasSize();

// Game state
let gameState = 'start'; // start, playing, paused, gameover, win
let score = 0;
let lives = 3;

// Paddle
const paddle = {
    width: 100,
    height: 12,
    x: GAME_WIDTH / 2 - 50,
    y: GAME_HEIGHT - 30,
    speed: 8,
    dx: 0
};

// Ball
const ball = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 50,
    radius: 8,
    speed: 5,
    dx: 0,
    dy: 0
};

// Bricks
const brickConfig = {
    rows: 5,
    cols: 10,
    width: 54,
    height: 20,
    padding: 4,
    offsetTop: 50,
    offsetLeft: 20
};

let bricks = [];

const brickColors = [
    '#ff6b6b',
    '#ffc107',
    '#4ecdc4',
    '#45b7d1',
    '#9b59b6'
];

function createBricks() {
    bricks = [];
    for (let row = 0; row < brickConfig.rows; row++) {
        bricks[row] = [];
        for (let col = 0; col < brickConfig.cols; col++) {
            const x = brickConfig.offsetLeft + col * (brickConfig.width + brickConfig.padding);
            const y = brickConfig.offsetTop + row * (brickConfig.height + brickConfig.padding);
            bricks[row][col] = {
                x: x,
                y: y,
                visible: true,
                color: brickColors[row]
            };
        }
    }
}

function resetBall() {
    ball.x = paddle.x + paddle.width / 2;
    ball.y = GAME_HEIGHT - 50;
    ball.dx = 0;
    ball.dy = 0;
}

function launchBall() {
    const angle = (Math.random() * 60 + 60) * Math.PI / 180; // 60-120 degrees
    ball.dx = ball.speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -ball.speed * Math.sin(angle);
}

function resetGame() {
    score = 0;
    lives = 3;
    paddle.x = GAME_WIDTH / 2 - paddle.width / 2;
    createBricks();
    resetBall();
    updateUI();
}

function updateUI() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
}

function drawPaddle() {
    // Paddle body
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(paddle.x + 4, paddle.y + 2, paddle.width - 8, 4, 2);
    ctx.fill();
}

function drawBall() {
    // Glow
    const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius + 10);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius + 10, 0, Math.PI * 2);
    ctx.fill();

    // Ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawBricks() {
    bricks.forEach(row => {
        row.forEach(brick => {
            if (!brick.visible) return;

            // Brick body
            ctx.fillStyle = brick.color;
            ctx.beginPath();
            ctx.roundRect(brick.x, brick.y, brickConfig.width, brickConfig.height, 4);
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.roundRect(brick.x + 3, brick.y + 3, brickConfig.width - 6, 6, 2);
            ctx.fill();
        });
    });
}

function movePaddle() {
    paddle.x += paddle.dx;

    // Wall collision
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > GAME_WIDTH) paddle.x = GAME_WIDTH - paddle.width;
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (left/right)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > GAME_WIDTH) {
        ball.dx = -ball.dx;
        ball.x = Math.max(ball.radius, Math.min(GAME_WIDTH - ball.radius, ball.x));
    }

    // Ceiling collision
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        ball.y = ball.radius;
    }

    // Floor collision (lose life)
    if (ball.y + ball.radius > GAME_HEIGHT) {
        lives--;
        updateUI();

        if (lives <= 0) {
            gameState = 'gameover';
            messageText.textContent = 'Game Over! Click to restart';
            messageEl.classList.remove('hidden');
        } else {
            resetBall();
            gameState = 'paused';
            messageText.textContent = 'Click to continue';
            messageEl.classList.remove('hidden');
        }
    }

    // Paddle collision
    if (
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        // Calculate bounce angle based on where ball hit paddle
        const hitPos = (ball.x - paddle.x) / paddle.width; // 0 to 1
        const angle = (hitPos - 0.5) * Math.PI * 0.7; // -63 to 63 degrees

        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = speed * Math.sin(angle);
        ball.dy = -Math.abs(speed * Math.cos(angle));
        ball.y = paddle.y - ball.radius;
    }

    // Brick collision
    bricks.forEach(row => {
        row.forEach(brick => {
            if (!brick.visible) return;

            if (
                ball.x + ball.radius > brick.x &&
                ball.x - ball.radius < brick.x + brickConfig.width &&
                ball.y + ball.radius > brick.y &&
                ball.y - ball.radius < brick.y + brickConfig.height
            ) {
                brick.visible = false;
                score += 10;
                updateUI();

                // Determine collision side
                const overlapLeft = ball.x + ball.radius - brick.x;
                const overlapRight = brick.x + brickConfig.width - (ball.x - ball.radius);
                const overlapTop = ball.y + ball.radius - brick.y;
                const overlapBottom = brick.y + brickConfig.height - (ball.y - ball.radius);

                const minOverlapX = Math.min(overlapLeft, overlapRight);
                const minOverlapY = Math.min(overlapTop, overlapBottom);

                if (minOverlapX < minOverlapY) {
                    ball.dx = -ball.dx;
                } else {
                    ball.dy = -ball.dy;
                }

                // Check win condition
                const remainingBricks = bricks.flat().filter(b => b.visible).length;
                if (remainingBricks === 0) {
                    gameState = 'win';
                    messageText.textContent = 'You Win! Click to play again';
                    messageEl.classList.remove('hidden');
                }
            }
        });
    });
}

function draw() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    drawBricks();
    drawPaddle();
    drawBall();
}

function update() {
    if (gameState === 'playing') {
        movePaddle();
        moveBall();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Input handling
let keys = {};

document.addEventListener('keydown', e => {
    keys[e.key] = true;

    if (e.key === 'ArrowLeft' || e.key === 'a') {
        paddle.dx = -paddle.speed;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        paddle.dx = paddle.speed;
    }
});

document.addEventListener('keyup', e => {
    keys[e.key] = false;

    if ((e.key === 'ArrowLeft' || e.key === 'a') && !keys['ArrowRight'] && !keys['d']) {
        paddle.dx = 0;
    }
    if ((e.key === 'ArrowRight' || e.key === 'd') && !keys['ArrowLeft'] && !keys['a']) {
        paddle.dx = 0;
    }
});

// Mouse/touch control
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    paddle.x = mouseX - paddle.width / 2;

    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > GAME_WIDTH) paddle.x = GAME_WIDTH - paddle.width;
});

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const touchX = (e.touches[0].clientX - rect.left) * scaleX;
    paddle.x = touchX - paddle.width / 2;

    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > GAME_WIDTH) paddle.x = GAME_WIDTH - paddle.width;
}, { passive: false });

// Click/tap to start
function handleStart() {
    if (gameState === 'start' || gameState === 'paused') {
        gameState = 'playing';
        messageEl.classList.add('hidden');
        if (ball.dx === 0 && ball.dy === 0) {
            launchBall();
        }
    } else if (gameState === 'gameover' || gameState === 'win') {
        resetGame();
        gameState = 'playing';
        messageEl.classList.add('hidden');
        launchBall();
    }
}

canvas.addEventListener('click', handleStart);
canvas.addEventListener('touchstart', e => {
    if (gameState !== 'playing') {
        e.preventDefault();
        handleStart();
    }
}, { passive: false });

window.addEventListener('resize', () => {
    setCanvasSize();
});

// Initialize
createBricks();
resetBall();
gameLoop();
