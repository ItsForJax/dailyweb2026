const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const segmentsInput = document.getElementById('segments');
const segmentsValue = document.getElementById('segmentsValue');
const speedInput = document.getElementById('speed');
const modeSelect = document.getElementById('mode');
const clearBtn = document.getElementById('clearBtn');
const infoText = document.getElementById('infoText');

let width, height, centerX, centerY, radius;
let segments = 8;
let isDrawing = false;
let lastX, lastY;
let hue = 0;
let mode = 'draw';
let autoAngle = 0;
let autoRadius = 0;
let autoRadiusDir = 1;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    centerX = width / 2;
    centerY = height / 2;
    radius = Math.min(width, height) * 0.4;

    clearCanvas();
}

function clearCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    drawBoundary();
}

function drawBoundary() {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function drawKaleidoscope(x, y, prevX, prevY) {
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Only draw inside the circle
    if (dist > radius) return;

    const angle = Math.atan2(dy, dx);
    const segmentAngle = (Math.PI * 2) / segments;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;

    // Draw in each segment with mirror effect
    for (let i = 0; i < segments; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(segmentAngle * i);

        // Original
        const localX = dx;
        const localY = dy;
        const prevLocalX = prevX - centerX;
        const prevLocalY = prevY - centerY;

        ctx.beginPath();
        ctx.moveTo(prevLocalX, prevLocalY);
        ctx.lineTo(localX, localY);
        ctx.stroke();

        // Mirror
        ctx.scale(1, -1);
        ctx.beginPath();
        ctx.moveTo(prevLocalX, prevLocalY);
        ctx.lineTo(localX, localY);
        ctx.stroke();

        ctx.restore();
    }

    hue = (hue + 1) % 360;
}

function handleStart(e) {
    if (mode !== 'draw') return;
    e.preventDefault();
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;
}

function handleMove(e) {
    if (!isDrawing || mode !== 'draw') return;
    e.preventDefault();
    const pos = getMousePos(e);
    drawKaleidoscope(pos.x, pos.y, lastX, lastY);
    lastX = pos.x;
    lastY = pos.y;
}

function handleEnd() {
    isDrawing = false;
}

function autoMode() {
    if (mode !== 'auto') return;

    const speed = parseInt(speedInput.value) / 50;

    // Create spiraling pattern
    autoAngle += 0.02 * speed;
    autoRadius += autoRadiusDir * 0.5 * speed;

    if (autoRadius > radius * 0.9) autoRadiusDir = -1;
    if (autoRadius < 20) autoRadiusDir = 1;

    const x = centerX + Math.cos(autoAngle) * autoRadius;
    const y = centerY + Math.sin(autoAngle) * autoRadius;

    const prevX = centerX + Math.cos(autoAngle - 0.02 * speed) * (autoRadius - autoRadiusDir * 0.5 * speed);
    const prevY = centerY + Math.sin(autoAngle - 0.02 * speed) * (autoRadius - autoRadiusDir * 0.5 * speed);

    drawKaleidoscope(x, y, prevX, prevY);
}

function animate() {
    autoMode();
    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('mouseleave', handleEnd);

canvas.addEventListener('touchstart', handleStart, { passive: false });
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchend', handleEnd);

segmentsInput.addEventListener('input', () => {
    segments = parseInt(segmentsInput.value);
    segmentsValue.textContent = segments;
});

modeSelect.addEventListener('change', () => {
    mode = modeSelect.value;
    if (mode === 'auto') {
        infoText.textContent = 'Watch the automatic kaleidoscope pattern';
        autoRadius = 50;
        autoAngle = 0;
    } else {
        infoText.textContent = 'Draw inside the circle to create patterns';
    }
});

clearBtn.addEventListener('click', clearCanvas);

window.addEventListener('resize', resizeCanvas);

// Initialize
resizeCanvas();
animate();
