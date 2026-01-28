const preview = document.getElementById('preview');
const gradientType = document.getElementById('gradientType');
const angleInput = document.getElementById('angle');
const angleValue = document.getElementById('angleValue');
const angleGroup = document.getElementById('angleGroup');
const colorStopsContainer = document.getElementById('colorStops');
const addColorBtn = document.getElementById('addColor');
const cssOutput = document.getElementById('cssOutput');
const copyBtn = document.getElementById('copyBtn');
const presetButtons = document.getElementById('presetButtons');
const toast = document.getElementById('toast');

let colorStops = [
    { color: '#667eea', position: 0 },
    { color: '#764ba2', position: 100 }
];

const presets = [
    { colors: ['#667eea', '#764ba2'], type: 'linear', angle: 90 },
    { colors: ['#f093fb', '#f5576c'], type: 'linear', angle: 45 },
    { colors: ['#4facfe', '#00f2fe'], type: 'linear', angle: 90 },
    { colors: ['#43e97b', '#38f9d7'], type: 'linear', angle: 135 },
    { colors: ['#fa709a', '#fee140'], type: 'linear', angle: 90 },
    { colors: ['#a8edea', '#fed6e3'], type: 'linear', angle: 180 },
    { colors: ['#ff9a9e', '#fecfef', '#fecfef'], type: 'radial', angle: 0 },
    { colors: ['#667eea', '#764ba2', '#f093fb'], type: 'conic', angle: 0 },
];

function renderColorStops() {
    colorStopsContainer.innerHTML = '';

    colorStops.forEach((stop, index) => {
        const div = document.createElement('div');
        div.className = 'color-stop';
        div.innerHTML = `
            <input type="color" value="${stop.color}" data-index="${index}">
            <input type="range" min="0" max="100" value="${stop.position}" data-index="${index}">
            <span class="position">${stop.position}%</span>
            <button class="remove-btn" data-index="${index}">&times;</button>
        `;
        colorStopsContainer.appendChild(div);
    });

    // Add event listeners
    colorStopsContainer.querySelectorAll('input[type="color"]').forEach(input => {
        input.addEventListener('input', (e) => {
            colorStops[e.target.dataset.index].color = e.target.value;
            updateGradient();
        });
    });

    colorStopsContainer.querySelectorAll('input[type="range"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = e.target.dataset.index;
            colorStops[index].position = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = e.target.value + '%';
            updateGradient();
        });
    });

    colorStopsContainer.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (colorStops.length > 2) {
                colorStops.splice(e.target.dataset.index, 1);
                renderColorStops();
                updateGradient();
            }
        });
    });
}

function generateGradientCSS() {
    const type = gradientType.value;
    const angle = angleInput.value;

    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');

    if (type === 'linear') {
        return `linear-gradient(${angle}deg, ${stopsStr})`;
    } else if (type === 'radial') {
        return `radial-gradient(circle, ${stopsStr})`;
    } else {
        return `conic-gradient(from ${angle}deg, ${stopsStr})`;
    }
}

function updateGradient() {
    const css = generateGradientCSS();
    preview.style.background = css;
    cssOutput.textContent = `background: ${css};`;
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function renderPresets() {
    presetButtons.innerHTML = '';

    presets.forEach((preset, index) => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';

        let gradientCSS;
        const stopsStr = preset.colors.map((c, i) =>
            `${c} ${Math.round(i * 100 / (preset.colors.length - 1))}%`
        ).join(', ');

        if (preset.type === 'linear') {
            gradientCSS = `linear-gradient(${preset.angle}deg, ${stopsStr})`;
        } else if (preset.type === 'radial') {
            gradientCSS = `radial-gradient(circle, ${stopsStr})`;
        } else {
            gradientCSS = `conic-gradient(from ${preset.angle}deg, ${stopsStr})`;
        }

        btn.style.background = gradientCSS;
        btn.addEventListener('click', () => applyPreset(preset));
        presetButtons.appendChild(btn);
    });
}

function applyPreset(preset) {
    gradientType.value = preset.type;
    angleInput.value = preset.angle;
    angleValue.textContent = preset.angle + '°';

    colorStops = preset.colors.map((color, i) => ({
        color,
        position: Math.round(i * 100 / (preset.colors.length - 1))
    }));

    angleGroup.style.display = preset.type === 'radial' ? 'none' : 'flex';

    renderColorStops();
    updateGradient();
}

function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// Event listeners
gradientType.addEventListener('change', () => {
    angleGroup.style.display = gradientType.value === 'radial' ? 'none' : 'flex';
    updateGradient();
});

angleInput.addEventListener('input', () => {
    angleValue.textContent = angleInput.value + '°';
    updateGradient();
});

addColorBtn.addEventListener('click', () => {
    if (colorStops.length < 6) {
        const lastPos = colorStops[colorStops.length - 1].position;
        colorStops.push({
            color: randomColor(),
            position: Math.min(100, lastPos + 20)
        });
        renderColorStops();
        updateGradient();
    }
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(cssOutput.textContent).then(() => {
        showToast('Copied!');
    });
});

// Initialize
renderColorStops();
renderPresets();
updateGradient();
