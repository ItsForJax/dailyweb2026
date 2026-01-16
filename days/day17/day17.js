const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const generateBtn = document.getElementById('generateBtn');

let width, height;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    generate();
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(random(min, max));
}

function randomColor() {
    return `hsl(${random(0, 360)}, ${random(50, 100)}%, ${random(40, 70)}%)`;
}

function drawCircles() {
    const count = randomInt(20, 50);
    for (let i = 0; i < count; i++) {
        const x = random(0, width);
        const y = random(0, height);
        const r = random(20, 150);
        const alpha = random(0.1, 0.5);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = randomColor();
        ctx.globalAlpha = alpha;
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawLines() {
    const count = randomInt(10, 30);
    ctx.lineWidth = random(1, 5);

    for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.moveTo(random(0, width), random(0, height));

        const points = randomInt(2, 5);
        for (let j = 0; j < points; j++) {
            ctx.lineTo(random(0, width), random(0, height));
        }

        ctx.strokeStyle = randomColor();
        ctx.globalAlpha = random(0.3, 0.8);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawRectangles() {
    const count = randomInt(10, 30);

    for (let i = 0; i < count; i++) {
        const x = random(0, width);
        const y = random(0, height);
        const w = random(30, 200);
        const h = random(30, 200);
        const rotation = random(0, Math.PI * 2);

        ctx.save();
        ctx.translate(x + w/2, y + h/2);
        ctx.rotate(rotation);
        ctx.fillStyle = randomColor();
        ctx.globalAlpha = random(0.1, 0.5);
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.restore();
    }
    ctx.globalAlpha = 1;
}

function drawTriangles() {
    const count = randomInt(10, 25);

    for (let i = 0; i < count; i++) {
        const x = random(0, width);
        const y = random(0, height);
        const size = random(30, 150);

        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();

        ctx.fillStyle = randomColor();
        ctx.globalAlpha = random(0.1, 0.5);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawSpirograph() {
    const cx = width / 2;
    const cy = height / 2;
    const R = random(100, 200);
    const r = random(30, 80);
    const d = random(50, 100);
    const hue = random(0, 360);

    ctx.beginPath();
    for (let t = 0; t < Math.PI * 20; t += 0.01) {
        const x = cx + (R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t);
        const y = cy + (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t);

        if (t === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawFlowField() {
    const gridSize = 20;
    const hue = random(0, 360);

    for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
            const angle = Math.sin(x * 0.01) * Math.cos(y * 0.01) * Math.PI * 2;
            const length = random(10, 30);

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            ctx.strokeStyle = `hsl(${hue + (x + y) * 0.1}, 70%, 60%)`;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.6;
            ctx.stroke();
        }
    }
    ctx.globalAlpha = 1;
}

function generate() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const styles = [
        () => { drawCircles(); drawLines(); },
        () => { drawRectangles(); drawTriangles(); },
        () => { drawSpirograph(); drawCircles(); },
        () => { drawFlowField(); },
        () => { drawCircles(); drawTriangles(); drawLines(); },
        () => { drawRectangles(); drawSpirograph(); }
    ];

    const style = styles[randomInt(0, styles.length)];
    style();
}

generateBtn.addEventListener('click', generate);
window.addEventListener('resize', resizeCanvas);

resizeCanvas();
