const canvas = document.getElementById('dotCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Configuration
const DOT_SPACING = 30;
const BASE_DOT_SIZE = 2;
const MAX_DOT_SIZE = 15;
const INFLUENCE_RADIUS = 150;

// Create dot grid
const dots = [];
for (let x = DOT_SPACING; x < canvas.width; x += DOT_SPACING) {
    for (let y = DOT_SPACING; y < canvas.height; y += DOT_SPACING) {
        dots.push({
            x: x,
            y: y,
            baseSize: BASE_DOT_SIZE,
            currentSize: BASE_DOT_SIZE
        });
    }
}

// Mouse/Touch position
let mouseX = -1000;
let mouseY = -1000;
let isTouchDevice = false;

// Track mouse movement
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isTouchDevice = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    isTouchDevice = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    mouseX = -1000;
    mouseY = -1000;
});

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    mouseX = -1000;
    mouseY = -1000;
});

// Calculate dot size based on distance from mouse
function calculateDotSize(dot) {
    const dx = mouseX - dot.x;
    const dy = mouseY - dot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < INFLUENCE_RADIUS) {
        // Calculate size based on distance (closer = bigger)
        const influence = 1 - (distance / INFLUENCE_RADIUS);
        const size = BASE_DOT_SIZE + (MAX_DOT_SIZE - BASE_DOT_SIZE) * influence;
        return size;
    }

    return BASE_DOT_SIZE;
}

// Draw function
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all dots
    dots.forEach(dot => {
        const targetSize = calculateDotSize(dot);

        // Smooth transition
        dot.currentSize += (targetSize - dot.currentSize) * 0.2;

        // Draw dot
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.currentSize, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw floating circle indicator for touch devices
    if (isTouchDevice && mouseX > 0 && mouseY > 0) {
        // Draw outer circle (influence radius)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, INFLUENCE_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        // Draw inner circle (touch point)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw center dot
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(draw);
}

// Start animation
draw();
