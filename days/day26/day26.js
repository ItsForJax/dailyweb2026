const baseColorInput = document.getElementById('baseColor');
const harmonySelect = document.getElementById('harmonyType');
const randomBtn = document.getElementById('randomBtn');
const paletteContainer = document.getElementById('palette');
const exportCssBtn = document.getElementById('exportCssBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const toast = document.getElementById('toast');

let currentPalette = [];

// Color utility functions
function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (n) => {
        const hex = Math.round((n + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

// Color harmony generators
function generateComplementary(hsl) {
    return [
        hslToHex(hsl.h, hsl.s, hsl.l),
        hslToHex(hsl.h, hsl.s * 0.7, hsl.l + 15),
        hslToHex(hsl.h, hsl.s * 0.5, hsl.l + 30),
        hslToHex(hsl.h + 180, hsl.s, hsl.l),
        hslToHex(hsl.h + 180, hsl.s * 0.7, hsl.l - 15),
    ];
}

function generateAnalogous(hsl) {
    return [
        hslToHex(hsl.h - 30, hsl.s, hsl.l),
        hslToHex(hsl.h - 15, hsl.s, hsl.l),
        hslToHex(hsl.h, hsl.s, hsl.l),
        hslToHex(hsl.h + 15, hsl.s, hsl.l),
        hslToHex(hsl.h + 30, hsl.s, hsl.l),
    ];
}

function generateTriadic(hsl) {
    return [
        hslToHex(hsl.h, hsl.s, hsl.l),
        hslToHex(hsl.h, hsl.s * 0.6, hsl.l + 20),
        hslToHex(hsl.h + 120, hsl.s, hsl.l),
        hslToHex(hsl.h + 240, hsl.s, hsl.l),
        hslToHex(hsl.h + 240, hsl.s * 0.6, hsl.l - 15),
    ];
}

function generateSplitComplementary(hsl) {
    return [
        hslToHex(hsl.h, hsl.s, hsl.l),
        hslToHex(hsl.h, hsl.s * 0.7, hsl.l + 20),
        hslToHex(hsl.h + 150, hsl.s, hsl.l),
        hslToHex(hsl.h + 210, hsl.s, hsl.l),
        hslToHex(hsl.h + 180, hsl.s * 0.5, hsl.l + 25),
    ];
}

function generateTetradic(hsl) {
    return [
        hslToHex(hsl.h, hsl.s, hsl.l),
        hslToHex(hsl.h + 90, hsl.s, hsl.l),
        hslToHex(hsl.h + 180, hsl.s, hsl.l),
        hslToHex(hsl.h + 270, hsl.s, hsl.l),
        hslToHex(hsl.h + 45, hsl.s * 0.6, hsl.l + 15),
    ];
}

function generateMonochromatic(hsl) {
    return [
        hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 30)),
        hslToHex(hsl.h, hsl.s, Math.max(20, hsl.l - 15)),
        hslToHex(hsl.h, hsl.s, hsl.l),
        hslToHex(hsl.h, hsl.s * 0.8, Math.min(80, hsl.l + 15)),
        hslToHex(hsl.h, hsl.s * 0.6, Math.min(90, hsl.l + 30)),
    ];
}

// Color name approximation
function getColorName(hex) {
    const hsl = hexToHsl(hex);
    const h = hsl.h;
    const s = hsl.s;
    const l = hsl.l;

    if (l < 15) return 'Black';
    if (l > 85 && s < 10) return 'White';
    if (s < 10) return l < 50 ? 'Gray' : 'Silver';

    if (h < 15 || h >= 345) return l < 40 ? 'Maroon' : 'Red';
    if (h < 45) return l < 40 ? 'Brown' : 'Orange';
    if (h < 70) return l < 40 ? 'Olive' : 'Yellow';
    if (h < 150) return l < 40 ? 'Green' : 'Lime';
    if (h < 195) return l < 40 ? 'Teal' : 'Cyan';
    if (h < 255) return l < 40 ? 'Navy' : 'Blue';
    if (h < 285) return l < 40 ? 'Indigo' : 'Purple';
    if (h < 345) return l < 40 ? 'Magenta' : 'Pink';

    return 'Color';
}

function generatePalette() {
    const baseColor = baseColorInput.value;
    const harmonyType = harmonySelect.value;
    const hsl = hexToHsl(baseColor);

    let colors;
    switch (harmonyType) {
        case 'complementary': colors = generateComplementary(hsl); break;
        case 'analogous': colors = generateAnalogous(hsl); break;
        case 'triadic': colors = generateTriadic(hsl); break;
        case 'split-complementary': colors = generateSplitComplementary(hsl); break;
        case 'tetradic': colors = generateTetradic(hsl); break;
        case 'monochromatic': colors = generateMonochromatic(hsl); break;
        default: colors = generateComplementary(hsl);
    }

    currentPalette = colors;
    renderPalette(colors);
}

function renderPalette(colors) {
    paletteContainer.innerHTML = '';

    colors.forEach((color, index) => {
        const rgb = hexToRgb(color);
        const name = getColorName(color);

        const card = document.createElement('div');
        card.className = 'color-card';
        card.innerHTML = `
            <div class="color-swatch" style="background-color: ${color}"></div>
            <div class="color-info">
                <span class="color-hex">${color.toUpperCase()}</span>
                <span class="color-rgb">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</span>
                <span class="color-name">${name}</span>
            </div>
        `;

        card.addEventListener('click', () => copyToClipboard(color.toUpperCase()));
        paletteContainer.appendChild(card);
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied ${text}`);
    }).catch(() => {
        showToast('Failed to copy');
    });
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function randomColor() {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 40) + 50;
    const l = Math.floor(Math.random() * 30) + 40;
    return hslToHex(h, s, l);
}

function exportCss() {
    const css = `:root {\n${currentPalette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
    copyToClipboard(css);
    showToast('CSS copied!');
}

function exportJson() {
    const json = JSON.stringify({
        harmony: harmonySelect.value,
        colors: currentPalette.map(c => ({
            hex: c,
            rgb: hexToRgb(c),
            hsl: hexToHsl(c),
            name: getColorName(c)
        }))
    }, null, 2);
    copyToClipboard(json);
    showToast('JSON copied!');
}

// Event listeners
baseColorInput.addEventListener('input', generatePalette);
harmonySelect.addEventListener('change', generatePalette);
randomBtn.addEventListener('click', () => {
    baseColorInput.value = randomColor();
    generatePalette();
});
exportCssBtn.addEventListener('click', exportCss);
exportJsonBtn.addEventListener('click', exportJson);

// Initialize
generatePalette();
