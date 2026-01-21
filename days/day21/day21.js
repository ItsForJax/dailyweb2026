const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const countInput = document.getElementById('count');
const countValue = document.getElementById('countValue');
const speedInput = document.getElementById('speed');
const trailCheckbox = document.getElementById('trail');
const resetBtn = document.getElementById('resetBtn');

let width, height;
let pendulums = [];
let time = 0;

// Pendulum wave parameters
const baseFrequency = 0.5; // Base oscillations per second
const frequencyIncrement = 0.02; // Frequency difference between adjacent pendulums
const amplitude = 0.35; // Swing amplitude as fraction of available height

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    createPendulums();
}

function createPendulums() {
    const count = parseInt(countInput.value);
    pendulums = [];

    const spacing = width / (count + 1);
    const pivotY = height * 0.15;
    const maxLength = height * 0.65;
    const minLength = height * 0.25;

    for (let i = 0; i < count; i++) {
        // Each pendulum has a slightly different length, creating different periods
        // Longer pendulums swing slower (T = 2π√(L/g))
        const lengthRatio = 1 - (i / (count - 1)) * 0.6;
        const length = minLength + (maxLength - minLength) * lengthRatio;

        // Frequency is inversely proportional to sqrt of length
        const frequency = baseFrequency + frequencyIncrement * i;

        const hue = (i / count) * 300; // Rainbow colors

        pendulums.push({
            x: spacing * (i + 1),
            pivotY: pivotY,
            length: length,
            frequency: frequency,
            angle: 0,
            hue: hue,
            trail: []
        });
    }
}

function update() {
    const speedMultiplier = parseInt(speedInput.value) / 50;
    time += 0.016 * speedMultiplier;

    pendulums.forEach((p, i) => {
        // Simple harmonic motion
        p.angle = Math.sin(time * p.frequency * Math.PI * 2) * amplitude * Math.PI;

        // Calculate bob position
        const bobX = p.x + Math.sin(p.angle) * p.length;
        const bobY = p.pivotY + Math.cos(p.angle) * p.length;

        // Store trail
        if (trailCheckbox.checked) {
            p.trail.push({ x: bobX, y: bobY, age: 0 });
            if (p.trail.length > 50) {
                p.trail.shift();
            }
            p.trail.forEach(point => point.age++);
        } else {
            p.trail = [];
        }
    });
}

function draw() {
    // Clear or fade
    if (trailCheckbox.checked) {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
    } else {
        ctx.fillStyle = '#0a0a0a';
    }
    ctx.fillRect(0, 0, width, height);

    // Draw top bar
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, pendulums[0]?.pivotY || height * 0.15);
    ctx.lineTo(width, pendulums[0]?.pivotY || height * 0.15);
    ctx.stroke();

    pendulums.forEach((p, i) => {
        const bobX = p.x + Math.sin(p.angle) * p.length;
        const bobY = p.pivotY + Math.cos(p.angle) * p.length;

        // Draw trail
        if (trailCheckbox.checked && p.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let j = 1; j < p.trail.length; j++) {
                ctx.lineTo(p.trail[j].x, p.trail[j].y);
            }
            ctx.strokeStyle = `hsla(${p.hue}, 80%, 60%, 0.3)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw string
        ctx.beginPath();
        ctx.moveTo(p.x, p.pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw pivot point
        ctx.beginPath();
        ctx.arc(p.x, p.pivotY, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        // Draw bob with glow
        const bobRadius = 12;

        // Glow
        ctx.beginPath();
        ctx.arc(bobX, bobY, bobRadius + 8, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, bobRadius + 8);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 60%, 0.5)`);
        gradient.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Bob
        ctx.beginPath();
        ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue}, 80%, 60%)`;
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.arc(bobX - 3, bobY - 3, bobRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
    });
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

function reset() {
    time = 0;
    pendulums.forEach(p => {
        p.angle = 0;
        p.trail = [];
    });
}

// Event listeners
countInput.addEventListener('input', () => {
    countValue.textContent = countInput.value;
    createPendulums();
});

resetBtn.addEventListener('click', reset);

window.addEventListener('resize', resizeCanvas);

// Initialize
resizeCanvas();
animate();
