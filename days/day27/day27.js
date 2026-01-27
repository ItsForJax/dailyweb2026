const drawCanvas = document.getElementById('drawCanvas');
const fourierCanvas = document.getElementById('fourierCanvas');
const drawCtx = drawCanvas.getContext('2d');
const fourierCtx = fourierCanvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const circleCountInput = document.getElementById('circleCount');
const circleValueSpan = document.getElementById('circleValue');
const speedInput = document.getElementById('speed');
const hint = document.getElementById('hint');

const SIZE = 400;
drawCanvas.width = drawCanvas.height = SIZE;
fourierCanvas.width = fourierCanvas.height = SIZE;

let isDrawing = false;
let drawingPoints = [];
let fourierX = [];
let time = 0;
let path = [];
let isAnimating = false;

// Complex number helpers
function dft(x) {
    const X = [];
    const N = x.length;
    for (let k = 0; k < N; k++) {
        let re = 0;
        let im = 0;
        for (let n = 0; n < N; n++) {
            const phi = (2 * Math.PI * k * n) / N;
            re += x[n].x * Math.cos(phi) + x[n].y * Math.sin(phi);
            im += x[n].y * Math.cos(phi) - x[n].x * Math.sin(phi);
        }
        re /= N;
        im /= N;
        const freq = k;
        const amp = Math.sqrt(re * re + im * im);
        const phase = Math.atan2(im, re);
        X.push({ re, im, freq, amp, phase });
    }
    return X;
}

function epicycles(x, y, rotation, fourier, ctx) {
    const numCircles = Math.min(parseInt(circleCountInput.value), fourier.length);

    for (let i = 0; i < numCircles; i++) {
        const prevX = x;
        const prevY = y;
        const freq = fourier[i].freq;
        const radius = fourier[i].amp;
        const phase = fourier[i].phase;

        x += radius * Math.cos(freq * time + phase + rotation);
        y += radius * Math.sin(freq * time + phase + rotation);

        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(prevX, prevY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    return { x, y };
}

function draw() {
    if (!isAnimating) return;

    fourierCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    fourierCtx.fillRect(0, 0, SIZE, SIZE);

    const v = epicycles(SIZE / 2, SIZE / 2, 0, fourierX, fourierCtx);
    path.unshift({ x: v.x, y: v.y });

    // Draw the path
    fourierCtx.beginPath();
    fourierCtx.strokeStyle = '#4ade80';
    fourierCtx.lineWidth = 2;
    for (let i = 0; i < path.length; i++) {
        if (i === 0) {
            fourierCtx.moveTo(path[i].x, path[i].y);
        } else {
            fourierCtx.lineTo(path[i].x, path[i].y);
        }
    }
    fourierCtx.stroke();

    const speed = parseInt(speedInput.value);
    const dt = (2 * Math.PI) / fourierX.length * (speed / 3);
    time += dt;

    if (time > 2 * Math.PI) {
        time = 0;
        path = [];
    }

    requestAnimationFrame(draw);
}

function startFourier() {
    if (drawingPoints.length < 10) return;

    // Sample points evenly
    const skip = Math.max(1, Math.floor(drawingPoints.length / 200));
    const sampled = [];
    for (let i = 0; i < drawingPoints.length; i += skip) {
        sampled.push({
            x: drawingPoints[i].x - SIZE / 2,
            y: drawingPoints[i].y - SIZE / 2
        });
    }

    fourierX = dft(sampled);
    fourierX.sort((a, b) => b.amp - a.amp);

    time = 0;
    path = [];
    isAnimating = true;
    hint.textContent = 'Recreating your drawing with circles!';
    draw();
}

// Drawing events
function getPos(e) {
    const rect = drawCanvas.getBoundingClientRect();
    const scaleX = drawCanvas.width / rect.width;
    const scaleY = drawCanvas.height / rect.height;

    if (e.touches) {
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    }
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    isAnimating = false;
    drawingPoints = [];
    drawCtx.clearRect(0, 0, SIZE, SIZE);
    fourierCtx.clearRect(0, 0, SIZE, SIZE);
    hint.textContent = 'Keep drawing...';

    const pos = getPos(e);
    drawingPoints.push(pos);
    drawCtx.beginPath();
    drawCtx.moveTo(pos.x, pos.y);
}

function drawMove(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const pos = getPos(e);
    drawingPoints.push(pos);

    drawCtx.strokeStyle = '#8b5cf6';
    drawCtx.lineWidth = 3;
    drawCtx.lineCap = 'round';
    drawCtx.lineTo(pos.x, pos.y);
    drawCtx.stroke();
    drawCtx.beginPath();
    drawCtx.moveTo(pos.x, pos.y);
}

function endDraw() {
    if (!isDrawing) return;
    isDrawing = false;
    startFourier();
}

drawCanvas.addEventListener('mousedown', startDraw);
drawCanvas.addEventListener('mousemove', drawMove);
drawCanvas.addEventListener('mouseup', endDraw);
drawCanvas.addEventListener('mouseleave', endDraw);

drawCanvas.addEventListener('touchstart', startDraw, { passive: false });
drawCanvas.addEventListener('touchmove', drawMove, { passive: false });
drawCanvas.addEventListener('touchend', endDraw);

clearBtn.addEventListener('click', () => {
    isAnimating = false;
    drawingPoints = [];
    path = [];
    drawCtx.clearRect(0, 0, SIZE, SIZE);
    fourierCtx.clearRect(0, 0, SIZE, SIZE);
    hint.textContent = 'Draw something on the left canvas!';
});

circleCountInput.addEventListener('input', () => {
    circleValueSpan.textContent = circleCountInput.value;
});

// Initialize
hint.textContent = 'Draw something on the left canvas!';
