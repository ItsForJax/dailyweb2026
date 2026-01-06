const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Constants
const ANCHOR_Y = 100;
const ROPE_LENGTH = 250;
const BALL_RADIUS = 25;
const BALL_SPACING = BALL_RADIUS * 2;

// Calculate starting position for 6 balls
const NUM_BALLS = 6;
const totalWidth = (NUM_BALLS - 1) * BALL_SPACING;
const startX = (canvas.width - totalWidth) / 2;

// Physics
const GRAVITY = 0.5;
const DAMPING = 0.995;

// Ball objects
const balls = [];
for (let i = 0; i < NUM_BALLS; i++) {
    balls.push({
        anchorX: startX + (i * BALL_SPACING),
        anchorY: ANCHOR_Y,
        x: startX + (i * BALL_SPACING),
        y: ANCHOR_Y + ROPE_LENGTH,
        angle: 0, // straight down (0 = down, negative = left, positive = right)
        angleVelocity: 0,
        isDragging: false
    });
}

// Check collisions between balls
function handleCollisions() {
    for (let i = 0; i < NUM_BALLS - 1; i++) {
        const ball1 = balls[i];
        const ball2 = balls[i + 1];

        // Calculate distance between balls
        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = BALL_RADIUS * 2;

        // If balls are colliding or overlapping
        if (distance < minDistance) {
            // If ball1 is being dragged, prevent it from going past ball2
            if (ball1.isDragging) {
                // Push ball1 back and push ball2 away
                const angle = Math.atan2(dy, dx);

                // Keep ball1 at safe distance from ball2
                ball1.x = ball2.x - Math.cos(angle) * minDistance;
                ball1.y = ball2.y - Math.sin(angle) * minDistance;

                // Constrain ball1 to rope length
                const dx1 = ball1.x - ball1.anchorX;
                const dy1 = ball1.y - ball1.anchorY;
                const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
                if (dist1 > 0) {
                    ball1.x = ball1.anchorX + (dx1 / dist1) * ROPE_LENGTH;
                    ball1.y = ball1.anchorY + (dy1 / dist1) * ROPE_LENGTH;
                }
                ball1.angle = Math.atan2(dx1, dy1);

                // Push ball2 in the direction of ball1's movement
                ball2.angle = ball1.angle;
                ball2.angleVelocity = 0;
                ball2.x = ball2.anchorX + ROPE_LENGTH * Math.sin(ball2.angle);
                ball2.y = ball2.anchorY + ROPE_LENGTH * Math.cos(ball2.angle);
            }
            // If ball2 is being dragged, prevent it from going past ball1
            else if (ball2.isDragging) {
                const angle = Math.atan2(dy, dx);

                // Keep ball2 at safe distance from ball1
                ball2.x = ball1.x + Math.cos(angle) * minDistance;
                ball2.y = ball1.y + Math.sin(angle) * minDistance;

                // Constrain ball2 to rope length
                const dx2 = ball2.x - ball2.anchorX;
                const dy2 = ball2.y - ball2.anchorY;
                const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                if (dist2 > 0) {
                    ball2.x = ball2.anchorX + (dx2 / dist2) * ROPE_LENGTH;
                    ball2.y = ball2.anchorY + (dy2 / dist2) * ROPE_LENGTH;
                }
                ball2.angle = Math.atan2(dx2, dy2);

                // Push ball1 in the direction of ball2's movement
                ball1.angle = ball2.angle;
                ball1.angleVelocity = 0;
                ball1.x = ball1.anchorX + ROPE_LENGTH * Math.sin(ball1.angle);
                ball1.y = ball1.anchorY + ROPE_LENGTH * Math.cos(ball1.angle);
            }
            // Transfer velocity when swinging (not being dragged)
            else {
                const temp = ball1.angleVelocity;
                ball1.angleVelocity = ball2.angleVelocity;
                ball2.angleVelocity = temp;

                // Separate them to prevent overlap while maintaining rope length
                const overlap = minDistance - distance;
                const angle = Math.atan2(dy, dx);
                ball1.x -= Math.cos(angle) * (overlap / 2);
                ball1.y -= Math.sin(angle) * (overlap / 2);
                ball2.x += Math.cos(angle) * (overlap / 2);
                ball2.y += Math.sin(angle) * (overlap / 2);

                // Constrain both balls to rope length
                const dx1 = ball1.x - ball1.anchorX;
                const dy1 = ball1.y - ball1.anchorY;
                const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
                if (dist1 > 0) {
                    ball1.x = ball1.anchorX + (dx1 / dist1) * ROPE_LENGTH;
                    ball1.y = ball1.anchorY + (dy1 / dist1) * ROPE_LENGTH;
                }

                const dx2 = ball2.x - ball2.anchorX;
                const dy2 = ball2.y - ball2.anchorY;
                const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                if (dist2 > 0) {
                    ball2.x = ball2.anchorX + (dx2 / dist2) * ROPE_LENGTH;
                    ball2.y = ball2.anchorY + (dy2 / dist2) * ROPE_LENGTH;
                }

                // Update angles based on new positions
                ball1.angle = Math.atan2(ball1.x - ball1.anchorX, ball1.y - ball1.anchorY);
                ball2.angle = Math.atan2(ball2.x - ball2.anchorX, ball2.y - ball2.anchorY);
            }
        }
    }
}

// Update physics
function updatePhysics() {
    for (let i = 0; i < NUM_BALLS; i++) {
        const ball = balls[i];

        if (!ball.isDragging) {
            // Pendulum physics
            const angleAcceleration = (-GRAVITY / ROPE_LENGTH) * Math.sin(ball.angle);
            ball.angleVelocity += angleAcceleration;
            ball.angleVelocity *= DAMPING;
            ball.angle += ball.angleVelocity;

            // Update position from angle (angle 0 = straight down)
            ball.x = ball.anchorX + ROPE_LENGTH * Math.sin(ball.angle);
            ball.y = ball.anchorY + ROPE_LENGTH * Math.cos(ball.angle);
        }
    }

    // Handle collisions after updating positions
    handleCollisions();
}

// Draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw 6 balls
    for (let i = 0; i < NUM_BALLS; i++) {
        const ball = balls[i];

        // Draw rope (line)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ball.anchorX, ball.anchorY);
        ctx.lineTo(ball.x, ball.y);
        ctx.stroke();

        // Draw anchor point
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(ball.anchorX, ball.anchorY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw ball (circle)
        ctx.fillStyle = '#4ECDC4';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Draw ball outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Animation loop
function animate() {
    updatePhysics();
    draw();
    requestAnimationFrame(animate);
}

// Mouse handling
let draggedBall = null;

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function isMouseInBall(mouseX, mouseY, ball) {
    const dx = mouseX - ball.x;
    const dy = mouseY - ball.y;
    return Math.sqrt(dx * dx + dy * dy) < BALL_RADIUS;
}

canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(e);

    // Check if clicking on any ball
    for (let i = balls.length - 1; i >= 0; i--) {
        if (isMouseInBall(pos.x, pos.y, balls[i])) {
            draggedBall = balls[i];
            draggedBall.isDragging = true;
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (draggedBall) {
        const pos = getMousePos(e);

        // Calculate direction from anchor to mouse
        const dx = pos.x - draggedBall.anchorX;
        const dy = pos.y - draggedBall.anchorY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Keep rope length constant
        if (distance > 0) {
            draggedBall.x = draggedBall.anchorX + (dx / distance) * ROPE_LENGTH;
            draggedBall.y = draggedBall.anchorY + (dy / distance) * ROPE_LENGTH;

            // Update angle based on position (angle 0 = straight down)
            draggedBall.angle = Math.atan2(dx, dy);
            draggedBall.angleVelocity = 0;
        }
    }
});

canvas.addEventListener('mouseup', () => {
    if (draggedBall) {
        draggedBall.isDragging = false;
        draggedBall = null;
    }
});

canvas.addEventListener('mouseleave', () => {
    if (draggedBall) {
        draggedBall.isDragging = false;
        draggedBall = null;
    }
});

// Start animation
animate();
