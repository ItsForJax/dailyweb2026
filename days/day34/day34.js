const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');

const size = Math.min(400, window.innerWidth - 80);
canvas.width = size;
canvas.height = size;

let isDrawing = false;
let lastX = 0;
let lastY = 0;

ctx.fillStyle = '#d4d4d4';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = '#333';
ctx.lineWidth = 2;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

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

function draw(e) {
    if (!isDrawing) return;

    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX = pos.x;
    lastY = pos.y;
}

function startDrawing(e) {
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
}

function stopDrawing() {
    isDrawing = false;
}

function clearCanvas() {
    clearBtn.classList.add('shaking');
    setTimeout(() => {
        ctx.fillStyle = '#d4d4d4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        clearBtn.classList.remove('shaking');
    }, 300);
}

// Mouse events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e);
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
});
canvas.addEventListener('touchend', stopDrawing);

// Clear button
clearBtn.addEventListener('click', clearCanvas);

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        clearCanvas();
    }
});

// Device shake detection (mobile)
let lastShake = 0;
if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', (e) => {
        const acc = e.accelerationIncludingGravity;
        if (acc) {
            const total = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
            if (total > 45 && Date.now() - lastShake > 1000) {
                lastShake = Date.now();
                clearCanvas();
            }
        }
    });
}
