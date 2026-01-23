const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');
const messageText = document.getElementById('messageText');
const highScoreEl = document.getElementById('highScore');

// Game dimensions
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

// Responsive sizing
function setCanvasSize() {
    const maxHeight = window.innerHeight - 40;
    const maxWidth = window.innerWidth - 40;

    let scale = Math.min(maxWidth / GAME_WIDTH, maxHeight / GAME_HEIGHT, 1);

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    canvas.style.width = GAME_WIDTH * scale + 'px';
    canvas.style.height = GAME_HEIGHT * scale + 'px';
}

setCanvasSize();

// Game state
let gameState = 'start';
let score = 0;
let highScore = parseInt(localStorage.getItem('flappyHighScore')) || 0;
highScoreEl.textContent = highScore;

// Colors
const COLORS = {
    sky: '#4fc3f7',
    ground: '#8bc34a',
    groundDark: '#689f38',
    bird: '#ffc107',
    birdDark: '#ff9800',
    pipe: '#4caf50',
    pipeDark: '#388e3c',
    pipeHighlight: '#81c784'
};

// Bird
const bird = {
    x: GAME_WIDTH * 0.3,
    y: GAME_HEIGHT / 2,
    width: 34,
    height: 24,
    velocity: 0,
    gravity: 0.5,
    jump: -9,
    rotation: 0
};

// Pipes
const pipeConfig = {
    width: 60,
    gap: 150,
    speed: 3,
    spawnInterval: 1500
};

let pipes = [];
let lastPipeSpawn = 0;

// Ground
const ground = {
    y: GAME_HEIGHT - 80,
    height: 80,
    offset: 0,
    speed: 3
};

function resetGame() {
    bird.y = GAME_HEIGHT / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    pipes = [];
    score = 0;
    lastPipeSpawn = 0;
    scoreEl.textContent = score;
}

function flap() {
    if (gameState === 'start') {
        gameState = 'playing';
        messageEl.classList.add('hidden');
        resetGame();
    } else if (gameState === 'playing') {
        bird.velocity = bird.jump;
    } else if (gameState === 'gameover') {
        gameState = 'start';
        messageText.textContent = 'Click or press Space to start';
        resetGame();
    }
}

function spawnPipe() {
    const minY = 100;
    const maxY = ground.y - pipeConfig.gap - 100;
    const gapY = Math.random() * (maxY - minY) + minY;

    pipes.push({
        x: GAME_WIDTH,
        gapY: gapY,
        scored: false
    });
}

function update() {
    if (gameState !== 'playing') return;

    // Bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Bird rotation based on velocity
    bird.rotation = Math.min(Math.max(bird.velocity * 3, -30), 90);

    // Ground scroll
    ground.offset = (ground.offset + ground.speed) % 24;

    // Spawn pipes
    const now = Date.now();
    if (now - lastPipeSpawn > pipeConfig.spawnInterval) {
        spawnPipe();
        lastPipeSpawn = now;
    }

    // Update pipes
    pipes.forEach(pipe => {
        pipe.x -= pipeConfig.speed;

        // Score
        if (!pipe.scored && pipe.x + pipeConfig.width < bird.x) {
            pipe.scored = true;
            score++;
            scoreEl.textContent = score;
        }
    });

    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x + pipeConfig.width > 0);

    // Collision detection
    // Ground collision
    if (bird.y + bird.height / 2 > ground.y) {
        gameOver();
        return;
    }

    // Ceiling collision
    if (bird.y - bird.height / 2 < 0) {
        bird.y = bird.height / 2;
        bird.velocity = 0;
    }

    // Pipe collision
    pipes.forEach(pipe => {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipeConfig.width;
        const gapTop = pipe.gapY;
        const gapBottom = pipe.gapY + pipeConfig.gap;

        // Check if bird overlaps pipe horizontally
        if (bird.x + bird.width / 2 > pipeLeft && bird.x - bird.width / 2 < pipeRight) {
            // Check if bird is outside the gap
            if (bird.y - bird.height / 2 < gapTop || bird.y + bird.height / 2 > gapBottom) {
                gameOver();
            }
        }
    });
}

function gameOver() {
    gameState = 'gameover';

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
        highScoreEl.textContent = highScore;
    }

    messageText.textContent = 'Game Over! Score: ' + score;
    messageEl.classList.remove('hidden');
}

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, ground.y);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, COLORS.sky);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, ground.y);
}

function drawGround() {
    // Main ground
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, ground.y, GAME_WIDTH, ground.height);

    // Ground pattern
    ctx.fillStyle = COLORS.groundDark;
    for (let x = -ground.offset; x < GAME_WIDTH; x += 24) {
        ctx.fillRect(x, ground.y, 12, 20);
    }

    // Ground top line
    ctx.fillStyle = COLORS.groundDark;
    ctx.fillRect(0, ground.y, GAME_WIDTH, 4);
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation * Math.PI / 180);

    // Body
    ctx.fillStyle = COLORS.bird;
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = COLORS.birdDark;
    ctx.beginPath();
    ctx.ellipse(-2, 2, 10, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(8, -4, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(10, -4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#ff5722';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(22, 2);
    ctx.lineTo(14, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawPipe(pipe) {
    const pipeWidth = pipeConfig.width;
    const capHeight = 30;
    const capOverhang = 6;

    // Top pipe
    ctx.fillStyle = COLORS.pipe;
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapY - capHeight);

    // Top pipe cap
    ctx.fillStyle = COLORS.pipe;
    ctx.fillRect(pipe.x - capOverhang, pipe.gapY - capHeight, pipeWidth + capOverhang * 2, capHeight);

    // Top pipe highlight
    ctx.fillStyle = COLORS.pipeHighlight;
    ctx.fillRect(pipe.x + 4, 0, 8, pipe.gapY - capHeight);

    // Top pipe shadow
    ctx.fillStyle = COLORS.pipeDark;
    ctx.fillRect(pipe.x + pipeWidth - 8, 0, 8, pipe.gapY - capHeight);

    // Bottom pipe
    const bottomY = pipe.gapY + pipeConfig.gap;
    ctx.fillStyle = COLORS.pipe;
    ctx.fillRect(pipe.x, bottomY + capHeight, pipeWidth, ground.y - bottomY - capHeight);

    // Bottom pipe cap
    ctx.fillStyle = COLORS.pipe;
    ctx.fillRect(pipe.x - capOverhang, bottomY, pipeWidth + capOverhang * 2, capHeight);

    // Bottom pipe highlight
    ctx.fillStyle = COLORS.pipeHighlight;
    ctx.fillRect(pipe.x + 4, bottomY + capHeight, 8, ground.y - bottomY - capHeight);

    // Bottom pipe shadow
    ctx.fillStyle = COLORS.pipeDark;
    ctx.fillRect(pipe.x + pipeWidth - 8, bottomY + capHeight, 8, ground.y - bottomY - capHeight);
}

function draw() {
    drawBackground();

    pipes.forEach(pipe => drawPipe(pipe));

    drawGround();
    drawBird();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Input handling
document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        flap();
    }
});

canvas.addEventListener('click', flap);
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    flap();
}, { passive: false });

window.addEventListener('resize', setCanvasSize);

// Start
gameLoop();
