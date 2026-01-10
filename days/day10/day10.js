const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverDiv = document.getElementById('gameOver');

canvas.width = 1200;
canvas.height = 300;

const sprite = new Image();
sprite.src = 'dino_sprite.png';

let gameSpeed = 4;
let gravity = 0.6;
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
let isGameOver = false;
let gameStarted = false;
const dino = {
    x: 50,
    y: 200,
    width: 44,
    height: 47,
    dy: 0,
    jumpPower: -12,
    grounded: false,
    jumping: false,
    frame: 0,
    frameCount: 0,

    draw() {
        ctx.fillStyle = '#535353';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },

    update() {
        if (!this.jumping) {
            this.frameCount++;
            if (this.frameCount > 5) {
                this.frame = (this.frame + 1) % 2;
                this.frameCount = 0;
            }
        }

        this.dy += gravity;
        this.y += this.dy;

        if (this.y + this.height >= canvas.height - 20) {
            this.y = canvas.height - 20 - this.height;
            this.dy = 0;
            this.grounded = true;
            this.jumping = false;
        }
    },

    jump() {
        if (this.grounded && !this.jumping) {
            this.dy = this.jumpPower;
            this.grounded = false;
            this.jumping = true;
        }
    }
};

class Obstacle {
    constructor() {
        this.x = canvas.width;
        this.width = 25;
        this.height = 40 + Math.floor(Math.random() * 30);
        this.y = canvas.height - 20 - this.height;
        this.counted = false;
    }

    draw() {
        ctx.fillStyle = '#535353';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= gameSpeed;
    }
}

let obstacles = [];
let frameCount = 0;

function spawnObstacle() {
    const lastObstacle = obstacles[obstacles.length - 1];
    if (!lastObstacle || lastObstacle.x < canvas.width - 300 - Math.random() * 200) {
        obstacles.push(new Obstacle());
    }
}
function checkCollision() {
    for (let obstacle of obstacles) {
        if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            return true;
        }
    }
    return false;
}

function drawScore() {
    ctx.fillStyle = '#535353';
    ctx.font = '20px Courier New';
    ctx.textAlign = 'right';
    ctx.fillText(`HI ${Math.floor(highScore)}`, canvas.width - 20, 30);
    ctx.fillText(`${Math.floor(score)}`, canvas.width - 20, 60);
}

function drawGround() {
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 20);
    ctx.lineTo(canvas.width, canvas.height - 20);
    ctx.stroke();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    dino.update();
    dino.draw();

    if (gameStarted && !isGameOver) {
        frameCount++;
        if (frameCount % 100 === 0) {
            spawnObstacle();
        }

        obstacles.forEach((obstacle, index) => {
            obstacle.update();
            obstacle.draw();

            if (!obstacle.counted && obstacle.x + obstacle.width < dino.x) {
                score++;
                obstacle.counted = true;
            }

            if (obstacle.x + obstacle.width < 0) {
                obstacles.splice(index, 1);
            }
        });

        if (frameCount % 300 === 0) {
            gameSpeed += 0.3;
        }

        if (checkCollision()) {
            isGameOver = true;
            gameOverDiv.classList.remove('hidden');

            if (score > highScore) {
                highScore = score;
                localStorage.setItem('dinoHighScore', highScore);
            }
        }
    }

    drawScore();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    isGameOver = false;
    gameStarted = true;
    gameSpeed = 4;
    score = 0;
    frameCount = 0;
    obstacles = [];
    dino.y = 200;
    dino.dy = 0;
    dino.jumping = false;
    dino.grounded = false;
    gameOverDiv.classList.add('hidden');
}
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameStarted || isGameOver) {
            resetGame();
        } else {
            dino.jump();
        }
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameStarted || isGameOver) {
        resetGame();
    } else {
        dino.jump();
    }
});

canvas.addEventListener('click', (e) => {
    if (!gameStarted || isGameOver) {
        resetGame();
    } else {
        dino.jump();
    }
});

gameLoop();
