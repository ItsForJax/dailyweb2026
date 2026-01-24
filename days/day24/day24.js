const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const messageEl = document.getElementById('message');
const messageText = document.getElementById('messageText');
const newGameBtn = document.getElementById('newGame');
const continueBtn = document.getElementById('continueBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');

const SIZE = 4;
const GAP = 10;
const PADDING = 10;

let grid = [];
let score = 0;
let best = parseInt(localStorage.getItem('2048Best')) || 0;
let won = false;
let gameOver = false;

let tileSize = 75;

bestEl.textContent = best;

function init() {
    // Calculate tile size based on board
    const cellEl = document.querySelector('.cell');
    if (cellEl) {
        tileSize = cellEl.offsetWidth;
    }

    // Create empty cells
    boardEl.innerHTML = '';
    for (let i = 0; i < SIZE * SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        boardEl.appendChild(cell);
    }

    // Initialize grid
    grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    score = 0;
    won = false;
    gameOver = false;
    scoreEl.textContent = score;
    messageEl.classList.add('hidden');

    // Add two starting tiles
    addRandomTile();
    addRandomTile();
    renderTiles();
}

function getEmptyCells() {
    const empty = [];
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) {
                empty.push({ r, c });
            }
        }
    }
    return empty;
}

function addRandomTile() {
    const empty = getEmptyCells();
    if (empty.length === 0) return;

    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function getTilePosition(row, col) {
    return {
        top: PADDING + row * (tileSize + GAP),
        left: PADDING + col * (tileSize + GAP)
    };
}

function renderTiles(newTiles = [], mergedTiles = []) {
    // Remove old tiles
    document.querySelectorAll('.tile').forEach(t => t.remove());

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) continue;

            const tile = document.createElement('div');
            const value = grid[r][c];
            const pos = getTilePosition(r, c);

            tile.className = `tile tile-${value > 2048 ? 'super' : value}`;
            tile.textContent = value;
            tile.style.top = pos.top + 'px';
            tile.style.left = pos.left + 'px';

            // Check if this is a new tile
            if (newTiles.some(t => t.r === r && t.c === c)) {
                tile.classList.add('new');
            }

            // Check if this is a merged tile
            if (mergedTiles.some(t => t.r === r && t.c === c)) {
                tile.classList.add('merged');
            }

            boardEl.appendChild(tile);
        }
    }
}

function slide(row) {
    // Remove zeros
    let arr = row.filter(val => val !== 0);

    // Merge adjacent equal values
    const merged = [];
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i];
            merged.push(i);
            arr[i + 1] = 0;
        }
    }

    // Remove zeros again after merging
    arr = arr.filter(val => val !== 0);

    // Pad with zeros
    while (arr.length < SIZE) {
        arr.push(0);
    }

    return { row: arr, merged };
}

function move(direction) {
    if (gameOver) return false;

    const oldGrid = grid.map(row => [...row]);
    const mergedPositions = [];

    if (direction === 'left') {
        for (let r = 0; r < SIZE; r++) {
            const result = slide(grid[r]);
            grid[r] = result.row;
        }
    } else if (direction === 'right') {
        for (let r = 0; r < SIZE; r++) {
            const result = slide(grid[r].slice().reverse());
            grid[r] = result.row.reverse();
        }
    } else if (direction === 'up') {
        for (let c = 0; c < SIZE; c++) {
            const col = grid.map(row => row[c]);
            const result = slide(col);
            for (let r = 0; r < SIZE; r++) {
                grid[r][c] = result.row[r];
            }
        }
    } else if (direction === 'down') {
        for (let c = 0; c < SIZE; c++) {
            const col = grid.map(row => row[c]).reverse();
            const result = slide(col);
            const newCol = result.row.reverse();
            for (let r = 0; r < SIZE; r++) {
                grid[r][c] = newCol[r];
            }
        }
    }

    // Check if grid changed
    let changed = false;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] !== oldGrid[r][c]) {
                changed = true;
                // Track merged positions
                if (grid[r][c] > oldGrid[r][c] && oldGrid[r][c] !== 0) {
                    mergedPositions.push({ r, c });
                }
            }
        }
    }

    if (changed) {
        const newTilePositions = [];
        addRandomTile();

        // Find new tile position
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] !== 0) {
                    let wasEmpty = true;
                    // Check if this position had a value in old grid or was target of slide
                    for (let r2 = 0; r2 < SIZE; r2++) {
                        for (let c2 = 0; c2 < SIZE; c2++) {
                            if (oldGrid[r2][c2] === grid[r][c]) {
                                wasEmpty = false;
                            }
                        }
                    }
                }
            }
        }

        // Find the new random tile
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] !== 0 && oldGrid[r][c] === 0) {
                    // Check if any tile could have moved here
                    let couldHaveMoved = false;
                    for (let r2 = 0; r2 < SIZE; r2++) {
                        for (let c2 = 0; c2 < SIZE; c2++) {
                            if (oldGrid[r2][c2] === grid[r][c]) {
                                couldHaveMoved = true;
                            }
                        }
                    }
                    if (!couldHaveMoved || (grid[r][c] === 2 || grid[r][c] === 4)) {
                        newTilePositions.push({ r, c });
                    }
                }
            }
        }

        scoreEl.textContent = score;

        if (score > best) {
            best = score;
            bestEl.textContent = best;
            localStorage.setItem('2048Best', best);
        }

        renderTiles(newTilePositions, mergedPositions);

        // Check for win
        if (!won) {
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (grid[r][c] === 2048) {
                        won = true;
                        messageText.textContent = 'You Win!';
                        messageEl.classList.remove('hidden');
                        continueBtn.style.display = 'block';
                        return true;
                    }
                }
            }
        }

        // Check for game over
        if (isGameOver()) {
            gameOver = true;
            messageText.textContent = 'Game Over!';
            messageEl.classList.remove('hidden');
            continueBtn.style.display = 'none';
        }
    }

    return changed;
}

function isGameOver() {
    // Check for empty cells
    if (getEmptyCells().length > 0) return false;

    // Check for possible merges
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const val = grid[r][c];
            // Check right
            if (c < SIZE - 1 && grid[r][c + 1] === val) return false;
            // Check down
            if (r < SIZE - 1 && grid[r + 1][c] === val) return false;
        }
    }

    return true;
}

// Keyboard controls
document.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase();
        move(direction);
    }
});

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

boardEl.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

boardEl.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    const minSwipe = 30;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > minSwipe) {
            move(dx > 0 ? 'right' : 'left');
        }
    } else {
        if (Math.abs(dy) > minSwipe) {
            move(dy > 0 ? 'down' : 'up');
        }
    }
}, { passive: true });

// Button controls
newGameBtn.addEventListener('click', init);
tryAgainBtn.addEventListener('click', init);
continueBtn.addEventListener('click', () => {
    messageEl.classList.add('hidden');
});

// Initialize
init();
