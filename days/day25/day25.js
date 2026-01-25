const urlInput = document.getElementById('urlInput');
const generateBtn = document.getElementById('generateBtn');
const qrContainer = document.getElementById('qrContainer');
const qrCanvas = document.getElementById('qrCanvas');
const sizeSelect = document.getElementById('sizeSelect');
const colorInput = document.getElementById('colorInput');
const downloadBtn = document.getElementById('downloadBtn');

const ctx = qrCanvas.getContext('2d');

let currentUrl = '';

// QR Code generation using a simple implementation
// Based on QR Code specification for alphanumeric mode

class QRCode {
    constructor(data, errorLevel = 'M') {
        this.data = data;
        this.errorLevel = errorLevel;
        this.modules = [];
        this.moduleCount = 0;
        this.generate();
    }

    generate() {
        // Determine version based on data length
        const version = this.getVersion(this.data.length);
        this.moduleCount = version * 4 + 17;

        // Initialize modules
        this.modules = Array(this.moduleCount).fill(null).map(() =>
            Array(this.moduleCount).fill(null)
        );

        // Add finder patterns
        this.addFinderPattern(0, 0);
        this.addFinderPattern(this.moduleCount - 7, 0);
        this.addFinderPattern(0, this.moduleCount - 7);

        // Add timing patterns
        this.addTimingPatterns();

        // Add alignment patterns for version > 1
        if (version > 1) {
            this.addAlignmentPatterns(version);
        }

        // Add format info
        this.addFormatInfo();

        // Add version info for version >= 7
        if (version >= 7) {
            this.addVersionInfo(version);
        }

        // Encode data
        const encodedData = this.encodeData(this.data, version);

        // Place data
        this.placeData(encodedData);

        // Apply mask
        this.applyMask();
    }

    getVersion(length) {
        // Simplified version selection for byte mode
        if (length <= 17) return 1;
        if (length <= 32) return 2;
        if (length <= 53) return 3;
        if (length <= 78) return 4;
        if (length <= 106) return 5;
        if (length <= 134) return 6;
        if (length <= 154) return 7;
        if (length <= 192) return 8;
        if (length <= 230) return 9;
        return 10;
    }

    addFinderPattern(row, col) {
        for (let r = -1; r <= 7; r++) {
            for (let c = -1; c <= 7; c++) {
                const tr = row + r;
                const tc = col + c;
                if (tr < 0 || tr >= this.moduleCount || tc < 0 || tc >= this.moduleCount) continue;

                if (
                    (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                    (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                    (r >= 2 && r <= 4 && c >= 2 && c <= 4)
                ) {
                    this.modules[tr][tc] = true;
                } else {
                    this.modules[tr][tc] = false;
                }
            }
        }
    }

    addTimingPatterns() {
        for (let i = 8; i < this.moduleCount - 8; i++) {
            const mod = i % 2 === 0;
            if (this.modules[6][i] === null) this.modules[6][i] = mod;
            if (this.modules[i][6] === null) this.modules[i][6] = mod;
        }
    }

    addAlignmentPatterns(version) {
        const positions = this.getAlignmentPositions(version);
        for (const row of positions) {
            for (const col of positions) {
                if (this.modules[row][col] !== null) continue;
                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        const tr = row + r;
                        const tc = col + c;
                        if (tr < 0 || tr >= this.moduleCount || tc < 0 || tc >= this.moduleCount) continue;
                        if (this.modules[tr][tc] !== null) continue;

                        if (
                            r === -2 || r === 2 || c === -2 || c === 2 ||
                            (r === 0 && c === 0)
                        ) {
                            this.modules[tr][tc] = true;
                        } else {
                            this.modules[tr][tc] = false;
                        }
                    }
                }
            }
        }
    }

    getAlignmentPositions(version) {
        if (version === 1) return [];
        const positions = [6];
        const step = Math.floor((version * 4 + 10) / (Math.floor(version / 7) + 1));
        let pos = version * 4 + 10;
        while (pos > 10) {
            positions.unshift(pos);
            pos -= step;
        }
        return positions;
    }

    addFormatInfo() {
        // Simplified format info placement
        const formatBits = 0b101010000010010; // Mask 0, error level M

        for (let i = 0; i < 15; i++) {
            const bit = ((formatBits >> i) & 1) === 1;

            if (i < 6) {
                this.modules[i][8] = bit;
            } else if (i < 8) {
                this.modules[i + 1][8] = bit;
            } else {
                this.modules[this.moduleCount - 15 + i][8] = bit;
            }

            if (i < 8) {
                this.modules[8][this.moduleCount - i - 1] = bit;
            } else if (i < 9) {
                this.modules[8][15 - i] = bit;
            } else {
                this.modules[8][15 - i - 1] = bit;
            }
        }

        this.modules[this.moduleCount - 8][8] = true;
    }

    addVersionInfo(version) {
        // Simplified version info for versions 7+
        const versionBits = version << 12;
        for (let i = 0; i < 18; i++) {
            const bit = ((versionBits >> i) & 1) === 1;
            const row = Math.floor(i / 3);
            const col = i % 3 + this.moduleCount - 11;
            this.modules[row][col] = bit;
            this.modules[col][row] = bit;
        }
    }

    encodeData(data, version) {
        const bits = [];

        // Mode indicator (byte mode = 0100)
        bits.push(0, 1, 0, 0);

        // Character count indicator
        const countLength = version < 10 ? 8 : 16;
        for (let i = countLength - 1; i >= 0; i--) {
            bits.push((data.length >> i) & 1);
        }

        // Data
        for (let i = 0; i < data.length; i++) {
            const byte = data.charCodeAt(i);
            for (let j = 7; j >= 0; j--) {
                bits.push((byte >> j) & 1);
            }
        }

        // Terminator
        const maxBits = this.getMaxDataBits(version);
        while (bits.length < maxBits && bits.length < maxBits) {
            bits.push(0);
            if (bits.length >= maxBits) break;
        }

        // Pad to byte boundary
        while (bits.length % 8 !== 0) {
            bits.push(0);
        }

        // Add padding bytes
        const padBytes = [0b11101100, 0b00010001];
        let padIndex = 0;
        while (bits.length < maxBits) {
            const pad = padBytes[padIndex % 2];
            for (let j = 7; j >= 0; j--) {
                bits.push((pad >> j) & 1);
            }
            padIndex++;
        }

        return bits;
    }

    getMaxDataBits(version) {
        // Data capacity for error level M (byte mode)
        const capacities = [0, 128, 224, 352, 512, 688, 864, 992, 1232, 1456, 1728];
        return capacities[version] || capacities[10];
    }

    placeData(bits) {
        let bitIndex = 0;
        let up = true;

        for (let col = this.moduleCount - 1; col > 0; col -= 2) {
            if (col === 6) col = 5;

            for (let i = 0; i < this.moduleCount; i++) {
                const row = up ? this.moduleCount - 1 - i : i;

                for (let c = 0; c < 2; c++) {
                    const currentCol = col - c;
                    if (this.modules[row][currentCol] === null) {
                        this.modules[row][currentCol] = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
                        bitIndex++;
                    }
                }
            }
            up = !up;
        }
    }

    applyMask() {
        // Mask pattern 0: (row + col) % 2 === 0
        for (let row = 0; row < this.moduleCount; row++) {
            for (let col = 0; col < this.moduleCount; col++) {
                if (this.isDataModule(row, col)) {
                    if ((row + col) % 2 === 0) {
                        this.modules[row][col] = !this.modules[row][col];
                    }
                }
            }
        }
    }

    isDataModule(row, col) {
        // Check if module is in finder pattern area
        if (row < 9 && col < 9) return false;
        if (row < 9 && col >= this.moduleCount - 8) return false;
        if (row >= this.moduleCount - 8 && col < 9) return false;

        // Check timing patterns
        if (row === 6 || col === 6) return false;

        return true;
    }

    getModules() {
        return this.modules;
    }
}

function generateQR() {
    let url = urlInput.value.trim();

    if (!url) {
        qrContainer.classList.add('empty');
        qrCanvas.classList.add('hidden');
        downloadBtn.disabled = true;
        return;
    }

    // Add https:// if no protocol specified
    if (!url.match(/^https?:\/\//i)) {
        url = 'https://' + url;
    }

    currentUrl = url;

    try {
        const qr = new QRCode(url);
        const modules = qr.getModules();
        const size = parseInt(sizeSelect.value);
        const color = colorInput.value;

        qrContainer.classList.remove('empty');
        qrCanvas.classList.remove('hidden');

        const moduleCount = modules.length;
        const moduleSize = Math.floor(size / moduleCount);
        const actualSize = moduleSize * moduleCount;

        qrCanvas.width = actualSize;
        qrCanvas.height = actualSize;

        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, actualSize, actualSize);

        // Draw modules
        ctx.fillStyle = color;
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (modules[row][col]) {
                    ctx.fillRect(
                        col * moduleSize,
                        row * moduleSize,
                        moduleSize,
                        moduleSize
                    );
                }
            }
        }

        downloadBtn.disabled = false;
    } catch (e) {
        console.error('Error generating QR code:', e);
        qrContainer.classList.add('empty');
        qrCanvas.classList.add('hidden');
        downloadBtn.disabled = true;
    }
}

function downloadQR() {
    if (!currentUrl) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
}

// Event listeners
generateBtn.addEventListener('click', generateQR);

urlInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        generateQR();
    }
});

sizeSelect.addEventListener('change', () => {
    if (currentUrl) generateQR();
});

colorInput.addEventListener('input', () => {
    if (currentUrl) generateQR();
});

downloadBtn.addEventListener('click', downloadQR);

// Initialize
qrContainer.classList.add('empty');
qrCanvas.classList.add('hidden');
