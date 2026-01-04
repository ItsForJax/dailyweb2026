// DVD Bouncing Animation
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('day4');
    const initialLogo = document.getElementById('dvd-logo');

    if (!initialLogo || !container) return;

    const colors = [
        'brightness(0) saturate(100%) invert(27%) sepia(98%) saturate(7435%) hue-rotate(359deg) brightness(99%) contrast(118%)',  // Red
        'brightness(0) saturate(100%) invert(60%) sepia(92%) saturate(1682%) hue-rotate(360deg) brightness(103%) contrast(104%)', // Orange
        'brightness(0) saturate(100%) invert(88%) sepia(69%) saturate(959%) hue-rotate(359deg) brightness(104%) contrast(107%)',  // Yellow
        'brightness(0) saturate(100%) invert(75%) sepia(53%) saturate(461%) hue-rotate(72deg) brightness(95%) contrast(92%)',     // Green
        'brightness(0) saturate(100%) invert(67%) sepia(85%) saturate(2412%) hue-rotate(165deg) brightness(101%) contrast(101%)', // Cyan
        'brightness(0) saturate(100%) invert(26%) sepia(89%) saturate(1583%) hue-rotate(229deg) brightness(97%) contrast(105%)',  // Blue
        'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(281deg) brightness(104%) contrast(97%)',  // Purple
        'brightness(0) saturate(100%) invert(47%) sepia(96%) saturate(4924%) hue-rotate(310deg) brightness(102%) contrast(101%)'  // Pink
    ];

    const logos = [];
    const MAX_LOGOS = 10;

    class DVDLogo {
        constructor(element, spawnX = null, spawnY = null) {
            this.element = element;
            if (spawnX !== null && spawnY !== null) {
                this.x = spawnX - 100; // Center the logo on click (200px width / 2)
                this.y = spawnY - 60;  // Center the logo on click (approx 120px height / 2)
            } else {
                this.x = Math.random() * (container.clientWidth - 200);
                this.y = Math.random() * (container.clientHeight - 120);
            }
            this.dx = (Math.random() > 0.5 ? 1 : -1) * 0.8;
            this.dy = (Math.random() > 0.5 ? 1 : -1) * 0.8;
            this.colorIndex = Math.floor(Math.random() * colors.length);
            this.changeColor();
        }

        changeColor() {
            this.colorIndex = (this.colorIndex + 1) % colors.length;
            this.element.style.filter = colors[this.colorIndex];
        }

        checkCornerHit(hitLeft, hitRight, hitTop, hitBottom) {
            if ((hitLeft || hitRight) && (hitTop || hitBottom)) {
                this.element.classList.add('corner-hit');
                setTimeout(() => {
                    this.element.classList.remove('corner-hit');
                }, 500);
            }
        }

        update() {
            const logoWidth = this.element.offsetWidth;
            const logoHeight = this.element.offsetHeight;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            this.x += this.dx;
            this.y += this.dy;

            let hitLeft = false, hitRight = false, hitTop = false, hitBottom = false;

            if (this.x <= 0) {
                this.x = 0;
                this.dx = Math.abs(this.dx);
                hitLeft = true;
                this.changeColor();
            } else if (this.x + logoWidth >= containerWidth) {
                this.x = containerWidth - logoWidth;
                this.dx = -Math.abs(this.dx);
                hitRight = true;
                this.changeColor();
            }

            if (this.y <= 0) {
                this.y = 0;
                this.dy = Math.abs(this.dy);
                hitTop = true;
                this.changeColor();
            } else if (this.y + logoHeight >= containerHeight) {
                this.y = containerHeight - logoHeight;
                this.dy = -Math.abs(this.dy);
                hitBottom = true;
                this.changeColor();
            }

            this.checkCornerHit(hitLeft, hitRight, hitTop, hitBottom);

            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
        }
    }

    // Initialize first logo
    const firstLogo = new DVDLogo(initialLogo);
    logos.push(firstLogo);

    // Add click handler to create new logos
    container.addEventListener('click', function(e) {
        if (logos.length >= MAX_LOGOS) return;

        const rect = container.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const newLogoElement = document.createElement('img');
        newLogoElement.src = 'assets/dvd.png';
        newLogoElement.alt = 'DVD Logo';
        newLogoElement.className = 'dvd-logo';
        container.appendChild(newLogoElement);

        const newLogo = new DVDLogo(newLogoElement, clickX, clickY);
        logos.push(newLogo);
    });

    function animate() {
        logos.forEach(logo => logo.update());
        requestAnimationFrame(animate);
    }

    animate();
});
