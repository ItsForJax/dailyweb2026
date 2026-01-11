const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

let width, height, columns, drops;
let fontSize = 16;
let speed = 50;
let density = 50;
let color = '#00ff00';

const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';
const chars = katakana + latin + nums;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    columns = Math.floor(width / fontSize);
    drops = new Array(columns).fill(0);
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = color;
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
        if (Math.random() * 100 > density) continue;

        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

let intervalId;

function startAnimation() {
    if (intervalId) clearInterval(intervalId);
    const fps = Math.floor(speed);
    intervalId = setInterval(draw, 1000 / fps);
}

const speedInput = document.getElementById('speed');
const speedValue = document.getElementById('speedValue');
const colorInput = document.getElementById('color');
const fontSizeInput = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const densityInput = document.getElementById('density');
const densityValue = document.getElementById('densityValue');
const resetButton = document.getElementById('reset');

speedInput.addEventListener('input', (e) => {
    speed = e.target.value;
    speedValue.textContent = speed;
    startAnimation();
});

colorInput.addEventListener('input', (e) => {
    color = e.target.value;
});

fontSizeInput.addEventListener('input', (e) => {
    fontSize = parseInt(e.target.value);
    fontSizeValue.textContent = fontSize;
    resizeCanvas();
});

densityInput.addEventListener('input', (e) => {
    density = e.target.value;
    densityValue.textContent = density;
});

resetButton.addEventListener('click', () => {
    speedInput.value = 50;
    speed = 50;
    speedValue.textContent = 50;

    colorInput.value = '#00ff00';
    color = '#00ff00';

    fontSizeInput.value = 16;
    fontSize = 16;
    fontSizeValue.textContent = 16;

    densityInput.value = 50;
    density = 50;
    densityValue.textContent = 50;

    resizeCanvas();
    startAnimation();
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
startAnimation();
