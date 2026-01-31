const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const gridSizeSelect = document.getElementById('gridSize');
const pencilTool = document.getElementById('pencilTool');
const eraserTool = document.getElementById('eraserTool');
const fillTool = document.getElementById('fillTool');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const paletteColors = document.querySelectorAll('.palette-color');

let gridSize = 16;
let pixelSize = 20;
let currentColor = '#000000';
let currentTool = 'pencil';
let isDrawing = false;
let pixels = [];

function initCanvas() {
    gridSize = parseInt(gridSizeSelect.value);

    // Adjust pixel size based on grid to keep canvas reasonable
    const maxCanvasSize = Math.min(window.innerWidth - 60, 480);
    pixelSize = Math.floor(maxCanvasSize / gridSize);

    canvas.width = gridSize * pixelSize;
    canvas.height = gridSize * pixelSize;

    // Initialize pixel array
    pixels = [];
    for (let y = 0; y < gridSize; y++) {
        pixels[y] = [];
        for (let x = 0; x < gridSize; x++) {
            pixels[y][x] = null;
        }
    }

    drawCanvas();
}

function drawCanvas() {
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (pixels[y][x]) {
                ctx.fillStyle = pixels[y][x];
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * pixelSize, 0);
        ctx.lineTo(i * pixelSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * pixelSize);
        ctx.lineTo(canvas.width, i * pixelSize);
        ctx.stroke();
    }
}

function getPixelCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = Math.floor((clientX - rect.left) * scaleX / pixelSize);
    const y = Math.floor((clientY - rect.top) * scaleY / pixelSize);

    return { x: Math.max(0, Math.min(gridSize - 1, x)), y: Math.max(0, Math.min(gridSize - 1, y)) };
}

function setPixel(x, y, color) {
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        pixels[y][x] = color;
        drawCanvas();
    }
}

function floodFill(startX, startY, fillColor) {
    const targetColor = pixels[startY][startX];

    if (targetColor === fillColor) return;

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = `${x},${y}`;

        if (visited.has(key)) continue;
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue;
        if (pixels[y][x] !== targetColor) continue;

        visited.add(key);
        pixels[y][x] = fillColor;

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
    }

    drawCanvas();
}

function handleDraw(e) {
    const { x, y } = getPixelCoords(e);

    if (currentTool === 'pencil') {
        setPixel(x, y, currentColor);
    } else if (currentTool === 'eraser') {
        setPixel(x, y, null);
    } else if (currentTool === 'fill') {
        floodFill(x, y, currentColor);
    }
}

function setTool(tool) {
    currentTool = tool;
    pencilTool.classList.remove('active');
    eraserTool.classList.remove('active');
    fillTool.classList.remove('active');

    if (tool === 'pencil') pencilTool.classList.add('active');
    else if (tool === 'eraser') eraserTool.classList.add('active');
    else if (tool === 'fill') fillTool.classList.add('active');
}

function updatePaletteSelection() {
    paletteColors.forEach(el => {
        if (el.dataset.color.toLowerCase() === currentColor.toLowerCase()) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

function downloadImage() {
    // Create a clean canvas without grid lines
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    const exportPixelSize = 16; // Fixed export size

    exportCanvas.width = gridSize * exportPixelSize;
    exportCanvas.height = gridSize * exportPixelSize;

    // Fill with white background
    exportCtx.fillStyle = '#ffffff';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw pixels
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (pixels[y][x]) {
                exportCtx.fillStyle = pixels[y][x];
                exportCtx.fillRect(x * exportPixelSize, y * exportPixelSize, exportPixelSize, exportPixelSize);
            }
        }
    }

    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDrawing = true;

    // Right click = erase
    if (e.button === 2) {
        const { x, y } = getPixelCoords(e);
        setPixel(x, y, null);
    } else {
        handleDraw(e);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing && currentTool !== 'fill') {
        if (e.buttons === 2) {
            const { x, y } = getPixelCoords(e);
            setPixel(x, y, null);
        } else {
            handleDraw(e);
        }
    }
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Touch events
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    handleDraw(e);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDrawing && currentTool !== 'fill') {
        handleDraw(e);
    }
}, { passive: false });

canvas.addEventListener('touchend', () => isDrawing = false);

colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    updatePaletteSelection();
    setTool('pencil');
});

gridSizeSelect.addEventListener('change', initCanvas);

pencilTool.addEventListener('click', () => setTool('pencil'));
eraserTool.addEventListener('click', () => setTool('eraser'));
fillTool.addEventListener('click', () => setTool('fill'));

clearBtn.addEventListener('click', () => {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            pixels[y][x] = null;
        }
    }
    drawCanvas();
});

downloadBtn.addEventListener('click', downloadImage);

paletteColors.forEach(el => {
    el.addEventListener('click', () => {
        currentColor = el.dataset.color;
        colorPicker.value = currentColor;
        updatePaletteSelection();
        setTool('pencil');
    });
});

// Initialize
initCanvas();
updatePaletteSelection();
