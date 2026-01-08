const canvas = document.getElementById('blobCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let blobs = [];
let mouseBlob = null;
let isMouseDown = false;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

class Blob {
    constructor(x, y, radius, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x - this.radius < 0 || this.x + this.radius > width) {
            this.vx *= -1;
            this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
        }
        if (this.y - this.radius < 0 || this.y + this.radius > height) {
            this.vy *= -1;
            this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
        }
    }
}

function initBlobs() {
    blobs = [];
    const colors = [
        { r: 138, g: 43, b: 226 },   // Purple
        { r: 255, g: 20, b: 147 },   // Pink
        { r: 0, g: 191, b: 255 },    // Blue
        { r: 50, g: 205, b: 50 },    // Green
        { r: 255, g: 165, b: 0 },    // Orange
    ];

    const numBlobs = Math.min(15, Math.floor(width / 100));

    for (let i = 0; i < numBlobs; i++) {
        const radius = 40 + Math.random() * 60;
        const x = radius + Math.random() * (width - radius * 2);
        const y = radius + Math.random() * (height - radius * 2);
        const speed = 0.5 + Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const color = colors[Math.floor(Math.random() * colors.length)];

        blobs.push(new Blob(x, y, radius, vx, vy, color));
    }
}

function metaballField(x, y) {
    let sum = 0;
    let colorR = 0, colorG = 0, colorB = 0;
    let totalInfluence = 0;

    const allBlobs = mouseBlob ? [...blobs, mouseBlob] : blobs;

    for (let blob of allBlobs) {
        const dx = x - blob.x;
        const dy = y - blob.y;
        const distSq = dx * dx + dy * dy;

        if (distSq > 0) {
            const influence = (blob.radius * blob.radius) / distSq;
            sum += influence;

            colorR += blob.color.r * influence;
            colorG += blob.color.g * influence;
            colorB += blob.color.b * influence;
            totalInfluence += influence;
        }
    }

    if (totalInfluence > 0) {
        colorR /= totalInfluence;
        colorG /= totalInfluence;
        colorB /= totalInfluence;
    }

    return { value: sum, r: colorR, g: colorG, b: colorB };
}

function renderMetaballs() {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const threshold = 1.0;
    const step = 4; // Pixel sampling step for performance

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const field = metaballField(x, y);

            if (field.value > threshold) {
                const alpha = Math.min(255, (field.value - threshold) * 100);

                // Fill the step x step block
                for (let dy = 0; dy < step && y + dy < height; dy++) {
                    for (let dx = 0; dx < step && x + dx < width; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4;
                        data[idx] = field.r;
                        data[idx + 1] = field.g;
                        data[idx + 2] = field.b;
                        data[idx + 3] = alpha;
                    }
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function addGlow() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 30;
    ctx.shadowColor = 'rgba(138, 43, 226, 0.5)';
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update blob positions
    blobs.forEach(blob => blob.update());

    // Render metaballs
    addGlow();
    renderMetaballs();
    ctx.shadowBlur = 0;

    requestAnimationFrame(animate);
}

// Mouse/Touch interaction
function handleStart(e) {
    isMouseDown = true;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    mouseBlob = new Blob(
        x, y,
        60,
        0, 0,
        { r: 255, g: 255, b: 255 }
    );
}

function handleMove(e) {
    if (isMouseDown && mouseBlob) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        mouseBlob.x = x;
        mouseBlob.y = y;
    }
}

function handleEnd() {
    isMouseDown = false;
    mouseBlob = null;
}

// Event listeners
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('mouseleave', handleEnd);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleStart(e);
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handleMove(e);
});
canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleEnd();
});

window.addEventListener('resize', () => {
    resizeCanvas();
    initBlobs();
});

// Initialize
resizeCanvas();
initBlobs();
animate();
