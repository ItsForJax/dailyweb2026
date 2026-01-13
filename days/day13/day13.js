const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 800;

const paddleWidth = 100;
const paddleHeight = 10;
const ballSize = 10;

const paddle = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: canvas.height - 40,
    width: paddleWidth,
    height: paddleHeight,
    speed: 6,
    dx: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: ballSize,
    height: ballSize,
    dx: 3,
    dy: -3,
    speed: 3
};

let score = 0;

const keys = {
    a: false,
    d: false,
    ArrowLeft: false,
    ArrowRight: false
};

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall() {
    drawRect(ball.x, ball.y, ball.width, ball.height, '#fff');
}

function drawPaddle() {
    drawRect(paddle.x, paddle.y, paddle.width, paddle.height, '#fff');
}

function drawWall() {
    drawRect(0, 0, canvas.width, paddleHeight, '#fff');
}

function drawCenterLine() {
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '32px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(score, canvas.width / 2, canvas.height / 2 - 20);
}

function updatePaddle() {
    if (keys.a || keys.ArrowLeft) {
        paddle.dx = -paddle.speed;
    } else if (keys.d || keys.ArrowRight) {
        paddle.dx = paddle.speed;
    } else {
        paddle.dx = 0;
    }

    paddle.x += paddle.dx;

    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x <= 0 || ball.x + ball.width >= canvas.width) {
        ball.dx *= -1;
    }

    if (
        ball.y + ball.height >= paddle.y &&
        ball.y + ball.height <= paddle.y + paddle.height + 5 &&
        ball.x + ball.width >= paddle.x &&
        ball.x <= paddle.x + paddle.width
    ) {
        ball.dy = -Math.abs(ball.dy);
        score++;

        const hitPos = (ball.x + ball.width / 2 - paddle.x) / paddle.width;
        ball.dx = (hitPos - 0.5) * 10;
    }

    if (ball.y <= paddleHeight) {
        ball.dy = Math.abs(ball.dy);
    }

    if (ball.y > canvas.height) {
        resetBall();
        score = 0;
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 3;
    ball.dy = -3;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawCenterLine();
    drawWall();
    drawPaddle();
    drawBall();
    drawScore();

    updatePaddle();
    updateBall();

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
        e.preventDefault();
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const rect = canvas.getBoundingClientRect();
    const canvasX = touchX - rect.left;

    paddle.x = canvasX - paddle.width / 2;

    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
});

gameLoop();
