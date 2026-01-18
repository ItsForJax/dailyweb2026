const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const algorithmSelect = document.getElementById('algorithm');
const arraySizeInput = document.getElementById('arraySize');
const arraySizeValue = document.getElementById('arraySizeValue');
const speedInput = document.getElementById('speed');
const speedValue = document.getElementById('speedValue');
const generateBtn = document.getElementById('generateBtn');
const sortBtn = document.getElementById('sortBtn');
const stopBtn = document.getElementById('stopBtn');
const comparisonsEl = document.getElementById('comparisons');
const swapsEl = document.getElementById('swaps');

let array = [];
let arraySize = 50;
let sorting = false;
let stopRequested = false;
let comparisons = 0;
let swapCount = 0;

const colors = {
    default: '#4ecdc4',
    comparing: '#ff6b6b',
    swapping: '#ffc107',
    sorted: '#45b7d1',
    pivot: '#9b59b6'
};

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth - 40;
    canvas.height = container.clientHeight - 20;
    draw();
}

function generateArray() {
    array = [];
    for (let i = 0; i < arraySize; i++) {
        array.push({
            value: Math.random() * 0.9 + 0.1,
            color: colors.default
        });
    }
    comparisons = 0;
    swapCount = 0;
    updateStats();
    draw();
}

function draw() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / array.length;
    const maxHeight = canvas.height - 20;

    array.forEach((item, i) => {
        const x = i * barWidth;
        const height = item.value * maxHeight;
        const y = canvas.height - height;

        // Bar gradient
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
        gradient.addColorStop(0, item.color);
        gradient.addColorStop(1, shadeColor(item.color, -30));

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, height);

        // Glow effect for active bars
        if (item.color !== colors.default && item.color !== colors.sorted) {
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 15;
            ctx.fillRect(x + 1, y, barWidth - 2, height);
            ctx.shadowBlur = 0;
        }
    });
}

function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function updateStats() {
    comparisonsEl.textContent = comparisons.toLocaleString();
    swapsEl.textContent = swapCount.toLocaleString();
}

function getDelay() {
    const speed = parseInt(speedInput.value);
    return Math.max(1, 200 - speed * 2);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function swap(i, j) {
    if (stopRequested) return;

    array[i].color = colors.swapping;
    array[j].color = colors.swapping;
    draw();

    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;

    swapCount++;
    updateStats();

    await sleep(getDelay());

    array[i].color = colors.default;
    array[j].color = colors.default;
}

async function compare(i, j) {
    if (stopRequested) return false;

    array[i].color = colors.comparing;
    array[j].color = colors.comparing;
    draw();

    comparisons++;
    updateStats();

    await sleep(getDelay());

    const result = array[i].value > array[j].value;

    array[i].color = colors.default;
    array[j].color = colors.default;

    return result;
}

// Bubble Sort
async function bubbleSort() {
    for (let i = 0; i < array.length - 1; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            if (stopRequested) return;
            if (await compare(j, j + 1)) {
                await swap(j, j + 1);
            }
        }
        array[array.length - i - 1].color = colors.sorted;
        draw();
    }
    array[0].color = colors.sorted;
    draw();
}

// Selection Sort
async function selectionSort() {
    for (let i = 0; i < array.length - 1; i++) {
        if (stopRequested) return;

        let minIdx = i;
        array[i].color = colors.pivot;
        draw();

        for (let j = i + 1; j < array.length; j++) {
            if (stopRequested) return;

            array[j].color = colors.comparing;
            draw();

            comparisons++;
            updateStats();
            await sleep(getDelay());

            if (array[j].value < array[minIdx].value) {
                if (minIdx !== i) array[minIdx].color = colors.default;
                minIdx = j;
                array[minIdx].color = colors.swapping;
            } else {
                array[j].color = colors.default;
            }
            draw();
        }

        if (minIdx !== i) {
            await swap(i, minIdx);
        }

        array[i].color = colors.sorted;
        draw();
    }
    array[array.length - 1].color = colors.sorted;
    draw();
}

// Insertion Sort
async function insertionSort() {
    for (let i = 1; i < array.length; i++) {
        if (stopRequested) return;

        let j = i;
        array[j].color = colors.pivot;
        draw();

        while (j > 0) {
            if (stopRequested) return;
            if (await compare(j, j - 1)) {
                array[j].color = colors.default;
                break;
            }
            await swap(j, j - 1);
            j--;
        }

        array[j].color = colors.default;

        for (let k = 0; k <= i; k++) {
            array[k].color = colors.sorted;
        }
        draw();
    }
}

// Quick Sort
async function quickSort(low = 0, high = array.length - 1) {
    if (low < high && !stopRequested) {
        const pivotIdx = await partition(low, high);
        if (stopRequested) return;
        await quickSort(low, pivotIdx - 1);
        await quickSort(pivotIdx + 1, high);
    }

    if (low === 0 && high === array.length - 1) {
        for (let i = 0; i < array.length; i++) {
            array[i].color = colors.sorted;
        }
        draw();
    }
}

async function partition(low, high) {
    const pivot = array[high].value;
    array[high].color = colors.pivot;
    draw();

    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (stopRequested) return i + 1;

        array[j].color = colors.comparing;
        draw();

        comparisons++;
        updateStats();
        await sleep(getDelay());

        if (array[j].value < pivot) {
            i++;
            if (i !== j) {
                await swap(i, j);
            }
        }
        array[j].color = colors.default;
    }

    if (i + 1 !== high) {
        await swap(i + 1, high);
    }
    array[high].color = colors.default;
    array[i + 1].color = colors.sorted;
    draw();

    return i + 1;
}

// Merge Sort
async function mergeSort(start = 0, end = array.length - 1) {
    if (start < end && !stopRequested) {
        const mid = Math.floor((start + end) / 2);
        await mergeSort(start, mid);
        await mergeSort(mid + 1, end);
        await merge(start, mid, end);
    }

    if (start === 0 && end === array.length - 1) {
        for (let i = 0; i < array.length; i++) {
            array[i].color = colors.sorted;
        }
        draw();
    }
}

async function merge(start, mid, end) {
    if (stopRequested) return;

    const left = array.slice(start, mid + 1).map(item => ({ ...item }));
    const right = array.slice(mid + 1, end + 1).map(item => ({ ...item }));

    let i = 0, j = 0, k = start;

    while (i < left.length && j < right.length) {
        if (stopRequested) return;

        array[k].color = colors.comparing;
        draw();

        comparisons++;
        updateStats();
        await sleep(getDelay());

        if (left[i].value <= right[j].value) {
            array[k].value = left[i].value;
            array[k].color = colors.swapping;
            i++;
        } else {
            array[k].value = right[j].value;
            array[k].color = colors.swapping;
            j++;
        }

        swapCount++;
        updateStats();
        draw();
        await sleep(getDelay());

        array[k].color = colors.default;
        k++;
    }

    while (i < left.length) {
        if (stopRequested) return;
        array[k].value = left[i].value;
        array[k].color = colors.swapping;
        draw();
        await sleep(getDelay());
        array[k].color = colors.default;
        i++;
        k++;
        swapCount++;
        updateStats();
    }

    while (j < right.length) {
        if (stopRequested) return;
        array[k].value = right[j].value;
        array[k].color = colors.swapping;
        draw();
        await sleep(getDelay());
        array[k].color = colors.default;
        j++;
        k++;
        swapCount++;
        updateStats();
    }
}

// Heap Sort
async function heapSort() {
    const n = array.length;

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        if (stopRequested) return;
        await heapify(n, i);
    }

    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
        if (stopRequested) return;
        await swap(0, i);
        array[i].color = colors.sorted;
        draw();
        await heapify(i, 0);
    }

    array[0].color = colors.sorted;
    draw();
}

async function heapify(n, i) {
    if (stopRequested) return;

    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
        array[i].color = colors.comparing;
        array[left].color = colors.comparing;
        draw();

        comparisons++;
        updateStats();
        await sleep(getDelay());

        if (array[left].value > array[largest].value) {
            largest = left;
        }

        array[i].color = colors.default;
        array[left].color = colors.default;
    }

    if (right < n) {
        array[largest].color = colors.comparing;
        array[right].color = colors.comparing;
        draw();

        comparisons++;
        updateStats();
        await sleep(getDelay());

        if (array[right].value > array[largest].value) {
            largest = right;
        }

        array[largest].color = colors.default;
        array[right].color = colors.default;
    }

    if (largest !== i) {
        await swap(i, largest);
        await heapify(n, largest);
    }
}

async function startSort() {
    if (sorting) return;

    sorting = true;
    stopRequested = false;
    sortBtn.disabled = true;
    generateBtn.disabled = true;
    arraySizeInput.disabled = true;
    stopBtn.disabled = false;

    // Reset colors
    array.forEach(item => item.color = colors.default);
    comparisons = 0;
    swapCount = 0;
    updateStats();
    draw();

    const algorithm = algorithmSelect.value;

    switch (algorithm) {
        case 'bubble':
            await bubbleSort();
            break;
        case 'selection':
            await selectionSort();
            break;
        case 'insertion':
            await insertionSort();
            break;
        case 'quick':
            await quickSort();
            break;
        case 'merge':
            await mergeSort();
            break;
        case 'heap':
            await heapSort();
            break;
    }

    sorting = false;
    sortBtn.disabled = false;
    generateBtn.disabled = false;
    arraySizeInput.disabled = false;
    stopBtn.disabled = true;
}

function stopSort() {
    stopRequested = true;
}

// Event listeners
generateBtn.addEventListener('click', () => {
    if (!sorting) generateArray();
});

sortBtn.addEventListener('click', startSort);
stopBtn.addEventListener('click', stopSort);

arraySizeInput.addEventListener('input', () => {
    arraySize = parseInt(arraySizeInput.value);
    arraySizeValue.textContent = arraySize;
    if (!sorting) generateArray();
});

speedInput.addEventListener('input', () => {
    speedValue.textContent = speedInput.value;
});

window.addEventListener('resize', resizeCanvas);

// Initialize
resizeCanvas();
generateArray();
