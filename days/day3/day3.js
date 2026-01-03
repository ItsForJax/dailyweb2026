class Minesweeper {
    constructor(rows = 9, cols = 9, mines = 10) {
        this.rows = rows;
        this.cols = cols;
        this.totalMines = mines;
        this.flaggedCount = 0;
        this.revealedCount = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;

        this.board = [];
        this.minePositions = new Set();

        this.initGame();
    }

    initGame() {
        this.createBoard();
        this.renderBoard();
        this.updateMineCounter();
        this.updateTimer();
        this.updateSmiley('normal');
    }

    createBoard() {
        this.board = [];
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.board[i][j] = {
                    mine: false,
                    revealed: false,
                    flagged: false,
                    adjacentMines: 0
                };
            }
        }
    }

    placeMines(excludeRow, excludeCol) {
        this.minePositions.clear();
        let minesPlaced = 0;

        while (minesPlaced < this.totalMines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);

            // Don't place mine on first click or adjacent cells
            if (row === excludeRow && col === excludeCol) continue;
            if (Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1) continue;

            const key = `${row},${col}`;
            if (!this.minePositions.has(key)) {
                this.board[row][col].mine = true;
                this.minePositions.add(key);
                minesPlaced++;
            }
        }

        this.calculateAdjacentMines();
    }

    calculateAdjacentMines() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!this.board[i][j].mine) {
                    let count = 0;
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (di === 0 && dj === 0) continue;
                            const ni = i + di;
                            const nj = j + dj;
                            if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols) {
                                if (this.board[ni][nj].mine) count++;
                            }
                        }
                    }
                    this.board[i][j].adjacentMines = count;
                }
            }
        }
    }

    renderBoard() {
        const gridElement = document.getElementById('mine-grid');
        gridElement.innerHTML = '';
        gridElement.style.gridTemplateColumns = `repeat(${this.cols}, 40px)`;
        gridElement.style.gridTemplateRows = `repeat(${this.rows}, 40px)`;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                cell.addEventListener('click', (e) => this.handleLeftClick(i, j, e));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(i, j, e));
                cell.addEventListener('mousedown', (e) => this.handleMouseDown(i, j, e));
                cell.addEventListener('mouseup', (e) => this.handleMouseUp(i, j, e));
                cell.addEventListener('mouseleave', (e) => this.handleMouseLeave(i, j, e));

                gridElement.appendChild(cell);
            }
        }
    }

    handleLeftClick(row, col, event) {
        event.preventDefault();

        if (this.gameOver || this.gameWon) return;

        const cell = this.board[row][col];
        if (cell.revealed || cell.flagged) return;

        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }

        this.revealCell(row, col);

        // Return to normal face after revealing
        if (!this.gameOver && !this.gameWon) {
            this.updateSmiley('normal');
        }
    }

    handleMouseDown(row, col, event) {
        if (event.button === 0 && !this.gameOver && !this.gameWon) {
            const cell = this.board[row][col];
            if (!cell.revealed && !cell.flagged) {
                this.updateSmiley('shocked');
            }
        }
    }

    handleMouseUp(row, col, event) {
        if (!this.gameOver && !this.gameWon) {
            this.updateSmiley('normal');
        }
    }

    handleMouseLeave(row, col, event) {
        if (!this.gameOver && !this.gameWon) {
            this.updateSmiley('normal');
        }
    }

    handleRightClick(row, col, event) {
        event.preventDefault();

        if (this.gameOver || this.gameWon) return;

        const cell = this.board[row][col];
        if (cell.revealed) return;

        cell.flagged = !cell.flagged;
        this.flaggedCount += cell.flagged ? 1 : -1;

        this.updateCell(row, col);
        this.updateMineCounter();
    }

    revealCell(row, col) {
        const cell = this.board[row][col];

        if (cell.revealed || cell.flagged) return;

        cell.revealed = true;
        this.revealedCount++;

        if (cell.mine) {
            this.endGame(false);
            return;
        }

        this.updateCell(row, col);

        // Check win condition
        if (this.revealedCount === this.rows * this.cols - this.totalMines) {
            this.endGame(true);
            return;
        }

        // Auto-reveal adjacent cells if no adjacent mines
        if (cell.adjacentMines === 0) {
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue;
                    const ni = row + di;
                    const nj = col + dj;
                    if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols) {
                        this.revealCell(ni, nj);
                    }
                }
            }
        }
    }

    updateCell(row, col) {
        const cell = this.board[row][col];
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        cellElement.className = 'mine-cell';

        if (cell.revealed) {
            cellElement.classList.add('revealed');
            if (cell.mine) {
                cellElement.classList.add('mine');
            } else if (cell.adjacentMines > 0) {
                cellElement.classList.add(`mine-${cell.adjacentMines}`);
                cellElement.textContent = cell.adjacentMines;
            }
        } else if (cell.flagged) {
            cellElement.classList.add('flagged');
        }
    }

    endGame(won) {
        this.gameOver = !won;
        this.gameWon = won;
        this.stopTimer();

        const boardElement = document.querySelector('.game-board');
        if (won) {
            boardElement.classList.add('game-won');
            this.updateSmiley('won');
        } else {
            boardElement.classList.add('game-over');
            this.updateSmiley('lost');
        }

        // Reveal all mines
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = this.board[i][j];
                if (cell.mine && !cell.flagged) {
                    cell.revealed = true;
                    this.updateCell(i, j);
                } else if (!cell.mine && cell.flagged) {
                    const cellElement = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    cellElement.classList.add('mine', 'wrong-flag');
                }
            }
        }
    }

    reset() {
        this.flaggedCount = 0;
        this.revealedCount = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.minePositions.clear();

        this.stopTimer();

        const boardElement = document.querySelector('.game-board');
        boardElement.classList.remove('game-over', 'game-won');

        this.createBoard();
        this.renderBoard();
        this.updateMineCounter();
        this.updateTimer();
        this.updateSmiley('normal');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            if (this.timer > 999) this.timer = 999;
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateMineCounter() {
        const remaining = this.totalMines - this.flaggedCount;
        this.updateSevenSegmentDisplay('mines', remaining);
    }

    updateTimer() {
        this.updateSevenSegmentDisplay('timer', this.timer);
    }

    updateSevenSegmentDisplay(type, value) {
        const isNegative = value < 0;
        const absValue = Math.abs(value);
        const str = absValue.toString().padStart(3, '0').substring(0, 3);

        for (let i = 0; i < 3; i++) {
            const digit = i === 0 && isNegative ? '-' : str[i];
            const displayElement = document.getElementById(`${type}-display-${i + 1}`);

            // Update image source to individual PNG files
            displayElement.src = `assets/${digit}.png`;
            displayElement.alt = digit;
        }
    }

    updateSmiley(state) {
        const smileyElement = document.getElementById('reset-button');
        const img = smileyElement.querySelector('img');

        // Use separate PNG images for each state
        if (state === 'lost') {
            img.src = 'assets/sad.png';
        } else if (state === 'won') {
            img.src = 'assets/smile.png'; // Keep smiling when won
        } else if (state === 'shocked') {
            img.src = 'assets/shocked.png'; // Shocked when clicking
        } else {
            img.src = 'assets/smile.png'; // Normal smile
        }
    }
}

// Initialize game when DOM is loaded
let game;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on day 3
    if (document.getElementById('mine-grid')) {
        game = new Minesweeper(9, 9, 10);

        const resetButton = document.getElementById('reset-button');
        resetButton.addEventListener('click', () => {
            game.reset();
        });
    }
});
