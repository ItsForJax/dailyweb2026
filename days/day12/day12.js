const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');

let width, height;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function drawBranch(x, y, length, angle, depth, hue) {
    if (depth === 0) return;

    const endX = x + length * Math.cos(angle);
    const endY = y + length * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);

    const alpha = depth / 8;
    ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
    ctx.lineWidth = depth;
    ctx.stroke();

    const newLength = length * 0.7;
    const angleOffset = Math.PI / 6;

    drawBranch(endX, endY, newLength, angle - angleOffset, depth - 1, hue);
    drawBranch(endX, endY, newLength, angle + angleOffset, depth - 1, hue);
}

function drawFractalTree(x, y) {
    const hue = Math.random() * 360;
    const initialLength = Math.min(width, height) * 0.15;
    const depth = 10;

    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        drawBranch(x, y, initialLength, angle, depth, hue);
    }
}

function drawCircleFractal(x, y, radius, depth, hue) {
    if (depth === 0 || radius < 2) return;

    const alpha = depth / 6;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    const newRadius = radius * 0.5;
    const positions = [
        { x: x + radius, y: y },
        { x: x - radius, y: y },
        { x: x, y: y + radius },
        { x: x, y: y - radius }
    ];

    positions.forEach(pos => {
        drawCircleFractal(pos.x, pos.y, newRadius, depth - 1, hue);
    });
}

function drawSierpinskiTriangle(x, y, size, depth, hue) {
    if (depth === 0) return;

    const height = size * Math.sqrt(3) / 2;

    ctx.beginPath();
    ctx.moveTo(x, y - height / 2);
    ctx.lineTo(x - size / 2, y + height / 2);
    ctx.lineTo(x + size / 2, y + height / 2);
    ctx.closePath();

    const alpha = depth / 6;
    ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    const newSize = size / 2;
    const newHeight = height / 2;

    drawSierpinskiTriangle(x, y - newHeight / 2, newSize, depth - 1, hue);
    drawSierpinskiTriangle(x - newSize / 2, y + newHeight / 2, newSize, depth - 1, hue);
    drawSierpinskiTriangle(x + newSize / 2, y + newHeight / 2, newSize, depth - 1, hue);
}

function drawSpiral(x, y, radius, angle, depth, hue) {
    if (depth === 0 || radius < 1) return;

    const endX = x + radius * Math.cos(angle);
    const endY = y + radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);

    const alpha = depth / 50;
    ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    drawSpiral(endX, endY, radius * 0.95, angle + 0.2, depth - 1, hue);
}

let clickCount = 0;

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const fractalType = clickCount % 4;

    const size = Math.min(width, height) * 0.3;

    switch(fractalType) {
        case 0:
            drawFractalTree(x, y);
            break;
        case 1:
            drawCircleFractal(x, y, size * 0.5, 8, Math.random() * 360);
            break;
        case 2:
            drawSierpinskiTriangle(x, y, size * 1.5, 8, Math.random() * 360);
            break;
        case 3:
            drawSpiral(x, y, size * 0.8, 0, 150, Math.random() * 360);
            break;
    }

    clickCount++;
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const fractalType = clickCount % 4;

    const size = Math.min(width, height) * 0.3;

    switch(fractalType) {
        case 0:
            drawFractalTree(x, y);
            break;
        case 1:
            drawCircleFractal(x, y, size * 0.5, 8, Math.random() * 360);
            break;
        case 2:
            drawSierpinskiTriangle(x, y, size * 1.5, 8, Math.random() * 360);
            break;
        case 3:
            drawSpiral(x, y, size * 0.8, 0, 150, Math.random() * 360);
            break;
    }

    clickCount++;
});

resetBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, width, height);
    clickCount = 0;
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
