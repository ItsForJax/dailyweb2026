const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const curveTypeSelect = document.getElementById('curveType');
const lineWidthInput = document.getElementById('lineWidth');
const curveColorInput = document.getElementById('curveColor');
const resetBtn = document.getElementById('resetBtn');
const cssCodeEl = document.getElementById('cssCode');
const copyBtn = document.getElementById('copyBtn');

let width, height;
let draggingPoint = null;
let curveType = 'cubic';

// Control points
let points = {
    p0: { x: 0, y: 0 },      // Start point
    p1: { x: 0, y: 0 },      // Control point 1
    p2: { x: 0, y: 0 },      // Control point 2 (cubic only)
    p3: { x: 0, y: 0 }       // End point
};

const pointRadius = 12;
const hitRadius = 20;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    resetPoints();
    draw();
}

function resetPoints() {
    const padding = 100;
    const boxSize = Math.min(width, height) - padding * 2;
    const startX = (width - boxSize) / 2;
    const startY = (height - boxSize) / 2;

    points.p0 = { x: startX, y: startY + boxSize };
    points.p3 = { x: startX + boxSize, y: startY };

    if (curveType === 'cubic') {
        points.p1 = { x: startX + boxSize * 0.25, y: startY + boxSize * 0.1 };
        points.p2 = { x: startX + boxSize * 0.75, y: startY + boxSize * 0.9 };
    } else {
        points.p1 = { x: startX + boxSize * 0.5, y: startY };
        points.p2 = { x: startX + boxSize * 0.5, y: startY };
    }

    updateCode();
}

function draw() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    drawGrid();

    // Draw control lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(points.p0.x, points.p0.y);
    ctx.lineTo(points.p1.x, points.p1.y);
    if (curveType === 'cubic') {
        ctx.moveTo(points.p3.x, points.p3.y);
        ctx.lineTo(points.p2.x, points.p2.y);
    } else {
        ctx.lineTo(points.p3.x, points.p3.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw bezier curve
    ctx.strokeStyle = curveColorInput.value;
    ctx.lineWidth = parseInt(lineWidthInput.value);
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(points.p0.x, points.p0.y);

    if (curveType === 'cubic') {
        ctx.bezierCurveTo(
            points.p1.x, points.p1.y,
            points.p2.x, points.p2.y,
            points.p3.x, points.p3.y
        );
    } else {
        ctx.quadraticCurveTo(
            points.p1.x, points.p1.y,
            points.p3.x, points.p3.y
        );
    }

    ctx.stroke();

    // Draw glow effect
    ctx.shadowColor = curveColorInput.value;
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw control points
    drawPoint(points.p0, '#666', 'P0');
    drawPoint(points.p1, '#ff6b6b', 'P1');
    if (curveType === 'cubic') {
        drawPoint(points.p2, '#ffc107', 'P2');
    }
    drawPoint(points.p3, '#666', 'P3');
}

function drawGrid() {
    const padding = 100;
    const boxSize = Math.min(width, height) - padding * 2;
    const startX = (width - boxSize) / 2;
    const startY = (height - boxSize) / 2;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i <= 10; i++) {
        const x = startX + (boxSize / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + boxSize);
        ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
        const y = startY + (boxSize / 10) * i;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + boxSize, y);
        ctx.stroke();
    }

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(startX, startY, boxSize, boxSize);
}

function drawPoint(point, color, label) {
    // Outer ring
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Inner circle
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius - 4, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();

    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(label, point.x, point.y - pointRadius - 5);
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

function getPointAtPos(pos) {
    const checkPoints = curveType === 'cubic'
        ? ['p1', 'p2']
        : ['p1'];

    for (const key of checkPoints) {
        const point = points[key];
        const dx = pos.x - point.x;
        const dy = pos.y - point.y;
        if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
            return key;
        }
    }
    return null;
}

function updateCode() {
    const padding = 100;
    const boxSize = Math.min(width, height) - padding * 2;
    const startX = (width - boxSize) / 2;
    const startY = (height - boxSize) / 2;

    // Normalize to 0-1 range
    const x1 = ((points.p1.x - startX) / boxSize).toFixed(2);
    const y1 = (1 - (points.p1.y - startY) / boxSize).toFixed(2);

    if (curveType === 'cubic') {
        const x2 = ((points.p2.x - startX) / boxSize).toFixed(2);
        const y2 = (1 - (points.p2.y - startY) / boxSize).toFixed(2);
        cssCodeEl.textContent = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
    } else {
        cssCodeEl.textContent = `quadratic: P1(${x1}, ${y1})`;
    }
}

function handleStart(e) {
    e.preventDefault();
    const pos = getMousePos(e);
    draggingPoint = getPointAtPos(pos);
    if (draggingPoint) {
        canvas.style.cursor = 'grabbing';
    }
}

function handleMove(e) {
    e.preventDefault();
    const pos = getMousePos(e);

    if (draggingPoint) {
        points[draggingPoint].x = pos.x;
        points[draggingPoint].y = pos.y;
        updateCode();
        draw();
    } else {
        const hovered = getPointAtPos(pos);
        canvas.style.cursor = hovered ? 'grab' : 'default';
    }
}

function handleEnd(e) {
    draggingPoint = null;
    canvas.style.cursor = 'default';
}

// Event listeners
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('mouseleave', handleEnd);

canvas.addEventListener('touchstart', handleStart, { passive: false });
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchend', handleEnd);

curveTypeSelect.addEventListener('change', () => {
    curveType = curveTypeSelect.value;
    resetPoints();
    draw();
});

lineWidthInput.addEventListener('input', draw);
curveColorInput.addEventListener('input', draw);

resetBtn.addEventListener('click', () => {
    resetPoints();
    draw();
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(cssCodeEl.textContent).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 1500);
    });
});

window.addEventListener('resize', resizeCanvas);

// Initialize
resizeCanvas();
