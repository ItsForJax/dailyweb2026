const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY, circleRadius;
let balls = [];

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    centerX = width / 2;
    centerY = height / 2;
    circleRadius = Math.min(width, height) * 0.35;
}

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.dx = (Math.random() - 0.5) * 16;
        this.dy = (Math.random() - 0.5) * 16;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        const distFromCenter = Math.sqrt(
            Math.pow(this.x - centerX, 2) + Math.pow(this.y - centerY, 2)
        );

        if (distFromCenter + this.radius >= circleRadius) {
            const angle = Math.atan2(this.y - centerY, this.x - centerX);

            const normalX = Math.cos(angle);
            const normalY = Math.sin(angle);

            const dotProduct = this.dx * normalX + this.dy * normalY;

            this.dx = this.dx - 2 * dotProduct * normalX;
            this.dy = this.dy - 2 * dotProduct * normalY;

            const overlap = (distFromCenter + this.radius) - circleRadius;
            this.x -= normalX * overlap;
            this.y -= normalY * overlap;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

const maxBalls = 5;

function drawCircle() {
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawBallCount() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`${balls.length} / ${maxBalls}`, centerX, centerY);
}

function gameLoop() {
    ctx.clearRect(0, 0, width, height);

    drawCircle();

    balls.forEach(ball => {
        ball.update();
        ball.draw();
    });

    drawBallCount();

    requestAnimationFrame(gameLoop);
}

function isInsideCircle(x, y) {
    const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    return dist < circleRadius;
}

canvas.addEventListener('click', (e) => {
    if (balls.length >= maxBalls) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isInsideCircle(x, y)) {
        balls.push(new Ball(x, y));
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (balls.length >= maxBalls) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (isInsideCircle(x, y)) {
        balls.push(new Ball(x, y));
    }
});

window.addEventListener('resize', () => {
    resizeCanvas();
    balls = [];
});

resizeCanvas();
balls.push(new Ball(centerX, centerY));
gameLoop();
