const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const linesDisplay = document.getElementById('lines');
const levelDisplay = document.getElementById('level');
const bestDisplay = document.getElementById('best');
const startBtn = document.getElementById('startBtn');
const overlay = document.getElementById('overlay');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;
const NEXT_SIZE = 4;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
nextCanvas.width = NEXT_SIZE * BLOCK_SIZE;
nextCanvas.height = NEXT_SIZE * BLOCK_SIZE;

const COLORS = [
    null,
    '#00f0f0', // I - cyan
    '#0000f0', // J - blue
    '#f0a000', // L - orange
    '#f0f000', // O - yellow
    '#00f000', // S - green
    '#a000f0', // T - purple
    '#f00000', // Z - red
];

const PIECES = [
    [[1, 1, 1, 1]],                     // I
    [[2, 0, 0], [2, 2, 2]],             // J
    [[0, 0, 3], [3, 3, 3]],             // L
    [[4, 4], [4, 4]],                   // O
    [[0, 5, 5], [5, 5, 0]],             // S
    [[0, 6, 0], [6, 6, 6]],             // T
    [[7, 7, 0], [0, 7, 7]],             // Z
];

let board = [];
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let gameRunning = false;
let dropInterval = null;
let best = parseInt(localStorage.getItem('tetris-best')) || 0;

bestDisplay.textContent = best;

function createBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board.push(new Array(COLS).fill(0));
    }
}

function randomPiece() {
    const index = Math.floor(Math.random() * PIECES.length);
    return PIECES[index].map(row => [...row]);
}

function drawBlock(ctx, x, y, color, size = BLOCK_SIZE) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size - 1, size - 1);

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * size, y * size, size - 1, 3);
    ctx.fillRect(x * size, y * size, 3, size - 1);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x * size + size - 4, y * size, 3, size - 1);
    ctx.fillRect(x * size, y * size + size - 4, size - 1, 3);
}

function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    // Draw placed blocks
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                drawBlock(ctx, c, r, COLORS[board[r][c]]);
            }
        }
    }
}

function drawPiece() {
    if (!currentPiece) return;

    for (let r = 0; r < currentPiece.length; r++) {
        for (let c = 0; c < currentPiece[r].length; c++) {
            if (currentPiece[r][c]) {
                drawBlock(ctx, currentX + c, currentY + r, COLORS[currentPiece[r][c]]);
            }
        }
    }
}

function drawGhost() {
    if (!currentPiece) return;

    let ghostY = currentY;
    while (isValidMove(currentPiece, currentX, ghostY + 1)) {
        ghostY++;
    }

    ctx.globalAlpha = 0.3;
    for (let r = 0; r < currentPiece.length; r++) {
        for (let c = 0; c < currentPiece[r].length; c++) {
            if (currentPiece[r][c]) {
                drawBlock(ctx, currentX + c, ghostY + r, COLORS[currentPiece[r][c]]);
            }
        }
    }
    ctx.globalAlpha = 1;
}

function drawNext() {
    nextCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (!nextPiece) return;

    const offsetX = (NEXT_SIZE - nextPiece[0].length) / 2;
    const offsetY = (NEXT_SIZE - nextPiece.length) / 2;

    for (let r = 0; r < nextPiece.length; r++) {
        for (let c = 0; c < nextPiece[r].length; c++) {
            if (nextPiece[r][c]) {
                drawBlock(nextCtx, offsetX + c, offsetY + r, COLORS[nextPiece[r][c]]);
            }
        }
    }
}

function isValidMove(piece, x, y) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
            if (piece[r][c]) {
                const newX = x + c;
                const newY = y + r;

                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return false;
                }

                if (newY >= 0 && board[newY][newX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function rotatePiece(piece) {
    const rows = piece.length;
    const cols = piece[0].length;
    const rotated = [];

    for (let c = 0; c < cols; c++) {
        rotated.push([]);
        for (let r = rows - 1; r >= 0; r--) {
            rotated[c].push(piece[r][c]);
        }
    }

    return rotated;
}

function placePiece() {
    for (let r = 0; r < currentPiece.length; r++) {
        for (let c = 0; c < currentPiece[r].length; c++) {
            if (currentPiece[r][c]) {
                const y = currentY + r;
                const x = currentX + c;
                if (y >= 0) {
                    board[y][x] = currentPiece[r][c];
                }
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;

    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(new Array(COLS).fill(0));
            linesCleared++;
            r++;
        }
    }

    if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800];
        score += points[linesCleared] * level;
        lines += linesCleared;
        level = Math.floor(lines / 10) + 1;

        scoreDisplay.textContent = score;
        linesDisplay.textContent = lines;
        levelDisplay.textContent = level;

        updateDropSpeed();
    }
}

function spawnPiece() {
    currentPiece = nextPiece || randomPiece();
    nextPiece = randomPiece();
    currentX = Math.floor((COLS - currentPiece[0].length) / 2);
    currentY = 0;

    drawNext();

    if (!isValidMove(currentPiece, currentX, currentY)) {
        gameOver();
    }
}

function drop() {
    if (!gameRunning) return;

    if (isValidMove(currentPiece, currentX, currentY + 1)) {
        currentY++;
    } else {
        placePiece();
        clearLines();
        spawnPiece();
    }

    draw();
}

function hardDrop() {
    while (isValidMove(currentPiece, currentX, currentY + 1)) {
        currentY++;
        score += 2;
    }
    scoreDisplay.textContent = score;
    placePiece();
    clearLines();
    spawnPiece();
    draw();
}

function moveLeft() {
    if (isValidMove(currentPiece, currentX - 1, currentY)) {
        currentX--;
        draw();
    }
}

function moveRight() {
    if (isValidMove(currentPiece, currentX + 1, currentY)) {
        currentX++;
        draw();
    }
}

function rotate() {
    const rotated = rotatePiece(currentPiece);
    let kick = 0;

    if (isValidMove(rotated, currentX, currentY)) {
        currentPiece = rotated;
    } else if (isValidMove(rotated, currentX - 1, currentY)) {
        currentX--;
        currentPiece = rotated;
    } else if (isValidMove(rotated, currentX + 1, currentY)) {
        currentX++;
        currentPiece = rotated;
    } else if (isValidMove(rotated, currentX - 2, currentY)) {
        currentX -= 2;
        currentPiece = rotated;
    } else if (isValidMove(rotated, currentX + 2, currentY)) {
        currentX += 2;
        currentPiece = rotated;
    }

    draw();
}

function softDrop() {
    if (isValidMove(currentPiece, currentX, currentY + 1)) {
        currentY++;
        score += 1;
        scoreDisplay.textContent = score;
        draw();
    }
}

function draw() {
    drawBoard();
    drawGhost();
    drawPiece();
}

function updateDropSpeed() {
    clearInterval(dropInterval);
    const speed = Math.max(100, 1000 - (level - 1) * 100);
    dropInterval = setInterval(drop, speed);
}

function startGame() {
    createBoard();
    score = 0;
    lines = 0;
    level = 1;
    scoreDisplay.textContent = score;
    linesDisplay.textContent = lines;
    levelDisplay.textContent = level;
    gameRunning = true;
    startBtn.disabled = true;
    overlay.classList.remove('show');

    nextPiece = randomPiece();
    spawnPiece();
    draw();
    updateDropSpeed();
}

function gameOver() {
    gameRunning = false;
    clearInterval(dropInterval);
    startBtn.disabled = false;

    if (score > best) {
        best = score;
        localStorage.setItem('tetris-best', best);
        bestDisplay.textContent = best;
    }

    finalScoreDisplay.textContent = score;
    overlay.classList.add('show');
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            moveLeft();
            break;
        case 'ArrowRight':
            e.preventDefault();
            moveRight();
            break;
        case 'ArrowUp':
            e.preventDefault();
            rotate();
            break;
        case 'ArrowDown':
            e.preventDefault();
            softDrop();
            break;
        case ' ':
            e.preventDefault();
            hardDrop();
            break;
    }
});

// Mobile controls
document.getElementById('leftBtn').addEventListener('click', () => gameRunning && moveLeft());
document.getElementById('rightBtn').addEventListener('click', () => gameRunning && moveRight());
document.getElementById('rotateBtn').addEventListener('click', () => gameRunning && rotate());
document.getElementById('downBtn').addEventListener('click', () => gameRunning && softDrop());
document.getElementById('dropBtn').addEventListener('click', () => gameRunning && hardDrop());

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Initial draw
drawBoard();
