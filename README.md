# Daily Web 2026

A 365-day JavaScript and CSS learning journey - creating something new every day!

**Live Demo:** https://dailyweb.ericksondelasoledad.dev/

---

## Daily Projects

### Day 1: Interactive 2026 Typography
Starting off the year with a toggleable interactive text display. Click each number in "2026" to toggle glowing 3D effects with animated shadows and transforms.

**What I learned:**
- CSS 3D text shadows and layering
- Click event handling in vanilla JavaScript
- CSS transitions and transforms
- Hover states and user interactions

---

### Day 2: 7-Segment Digital Clock
Originally planned to build Minesweeper, but couldn't figure out how to properly create 7-segment displays with CSS. Pivoted to building a digital clock instead!

**What I learned:**
- 7-segment display structure (segments a-g)
- Real-time clock updates with `setInterval`
- CSS positioning for complex UI elements
- The struggle is real when CSS doesn't cooperate

---

### Day 3: Minesweeper Game
Back to the original plan! Couldn't figure out how to scale 7-segment displays properly, so I used sprite images. Then couldn't crop sprites properly either... so I just used individual PNG files for all the icons (numbers, bombs, faces).

**What I learned:**
- Sometimes the "hacky" solution is the practical solution
- Game logic: mine placement, cell revealing, flagging
- Recursive flood-fill algorithm for empty cells
- Using image assets when CSS fails you
- Classic Windows Minesweeper mechanics

---

### Day 4: DVD Screensaver Bouncing Logo
Inspired by that classic episode of The Office where everyone watches the DVD logo bounce around. Click anywhere to spawn more logos (max 10)!

**What I learned:**
- Animation loops with `requestAnimationFrame`
- Collision detection with boundaries
- CSS filters to colorize white/grayscale images
- Using `brightness(0)` + `invert()` + `sepia()` + `saturate()` + `hue-rotate()` to create vibrant colors from white images
- Object-oriented JavaScript for managing multiple animated elements
- Click position detection with `getBoundingClientRect()`
- Corner hit detection for special effects

---

### Day 5: Retro Snake Game
Classic Snake game with a retro terminal aesthetic! Control the snake with WASD keys, eat food to grow, and avoid crashing into walls or yourself.

**What I learned:**
- Canvas-based game rendering with pixel-perfect graphics
- Game loop mechanics with `setInterval`
- Grid-based movement and collision detection
- State management for game flow (start, playing, game over)
- LocalStorage for persistent high scores
- Keyboard event handling for game controls
- Retro CRT monitor effects with CSS (scanlines, glow, shadows)
- Responsive canvas sizing for mobile devices
- Progressive difficulty with speed increases

---

### Day 6: Newton's Cradle
Physics simulation of Newton's Cradle with interactive pendulums! Drag the balls to set them in motion and watch the momentum transfer.

**What I learned:**
- Pendulum physics with angle-based calculations
- Collision detection between multiple objects
- Momentum transfer between objects
- Touch and mouse event handling for dragging
- Smooth animation with `requestAnimationFrame`
- Canvas rendering for dynamic physics simulations

---

### Day 7: Interactive Dot Grid
A mesmerizing interactive dot grid where dots grow larger based on proximity to your cursor or touch point. Features a floating circle indicator for mobile devices.

**What I learned:**
- Distance-based influence calculations for visual effects
- Smooth interpolation for size transitions
- Touch event handling with visual feedback
- Creating responsive canvas interactions
- Drawing layered canvas elements (dots + indicators)
- Detecting touch vs mouse input for adaptive UI

---

### Day 8: Liquid Blobs (Metaballs)
Smooth, organic liquid blobs that merge and blend together seamlessly! Using the metaball rendering technique to create fluid-like animations with color blending. Click and drag to create your own blob.

**What I learned:**
- Metaball algorithm for smooth merging effects
- Pixel-level canvas manipulation with ImageData
- Field value calculations based on distance
- Weighted color blending between multiple sources
- Performance optimization with sampling step sizes
- Physics-based bouncing with wall collisions
- Interactive canvas drawing with mouse/touch
- Creating organic, fluid visual effects

---

### Day 9: Animated Toggle Switch
A smooth, elastic toggle switch with stretching animations! The handle squishes and stretches as it slides between states, with smooth color transitions.

**What I learned:**
- CSS custom properties (variables) for colors and timing
- Complex keyframe animations with multiple properties
- Creating stretching/elastic effects with width transitions
- Multi-layered inset box-shadows for depth
- Cubic bezier easing for natural motion
- Pristine state pattern to prevent initial animation
- CSS-only interactive UI elements (no JavaScript needed)

---

### Day 10: Chrome Dino Game
Recreation of the classic Chrome offline dinosaur game! Jump over cacti, rack up points, and try to beat your high score. Attempted to use sprite sheets but ended up using simple geometric shapes instead.

**What I learned:**
- Canvas game loop with requestAnimationFrame
- Basic 2D game physics (gravity, jumping)
- Collision detection with bounding boxes
- Progressive difficulty scaling
- LocalStorage for persistent high scores
- Game state management (start, playing, game over)
- Touch and keyboard controls for cross-platform play
- Sometimes simple shapes work just fine

---

### Day 11: Matrix Falling Text
The iconic Matrix digital rain effect with interactive controls! Customize the speed, color, font size, and character density in real-time.

**What I learned:**
- Canvas text rendering with falling animation
- Using Japanese Katakana characters for authentic Matrix feel
- Interval-based animation with dynamic FPS control
- Real-time parameter adjustments with range inputs
- Color picker integration
- Trail effects with semi-transparent overlays
- Responsive canvas that adapts to window size
- Creating interactive visual effects with user controls

---

### Day 12: Interactive Fractal Generator
Click anywhere to spawn beautiful fractals! Each click cycles through 4 different fractal types: branching trees, circle patterns, Sierpinski triangles, and spirals.

**What I learned:**
- Recursive drawing algorithms for fractals
- Branching tree structures with angle mathematics
- Circle packing and recursive patterns
- Sierpinski triangle implementation
- Spiral generation with geometric progression
- HSL color system for dynamic hues
- Alpha transparency for depth effects
- Touch and mouse event handling for canvas interactions

---

### Day 13: Endless Pong
Classic Pong game with a twist - you play against a wall! The ball bounces endlessly, and you can never lose (unless you miss). Keep the rally going as long as possible.

**What I learned:**
- Classic arcade game mechanics
- Paddle physics and ball collision detection
- Keyboard input handling with simultaneous key presses
- Touch controls for mobile paddle movement
- Score tracking without game over state
- Ball angle changes based on paddle hit position
- Simple AI-free gameplay loop
- Retro game aesthetics with minimal graphics

---

### Day 14: Bouncing Balls in a Circle
A physics simulation where balls bounce inside a circular boundary! Click inside the circle to add up to 5 colorful balls that bounce around realistically.

**What I learned:**
- Circular boundary collision detection
- Vector reflection math for curved surfaces
- Distance calculations with Pythagorean theorem
- Normal vector calculations for circular collision
- Preventing ball overlap with boundary
- Random velocity generation
- HSL color system for random colors
- Click-to-add interactive mechanics

---

### Day 15: Particle Explosion
Click anywhere to create colorful particle bursts! Drag your mouse or finger to leave a trail of explosions. Particles have gravity and fade out naturally.

**What I learned:**
- Particle system fundamentals
- Gravity and friction physics simulation
- Alpha transparency for fade-out effects
- Trail effect with semi-transparent background
- Mouse drag detection for continuous explosions
- Touch move events for mobile trails
- Efficient particle cleanup with array filtering
- HSL color variations within explosions

---

### Day 16: Memory Card Game
Classic memory matching game! Flip cards to find matching pairs of emojis. Try to complete the game in as few moves as possible.

**What I learned:**
- CSS 3D card flip animations with perspective
- Game state management (flipped, matched, locked)
- Array shuffling with Fisher-Yates algorithm
- DOM manipulation for dynamic card creation
- Handling multiple card selections
- Win condition detection
- Preventing invalid moves during animations
- Move counter tracking

---

### Day 17: Generative Art
Random art generator that creates unique compositions every time! Click to generate new artwork with circles, lines, rectangles, triangles, spirographs, and flow fields.

**What I learned:**
- Procedural art generation techniques
- Canvas rotation and translation transforms
- Spirograph mathematical formulas
- Flow field visualization
- Layering shapes with alpha transparency
- Random color generation with HSL
- Combining multiple art styles
- Creating visually pleasing randomness

---

### Day 18: Sorting Algorithm Visualizer
Watch sorting algorithms in action! Visualize Bubble Sort, Selection Sort, Insertion Sort, Quick Sort, Merge Sort, and Heap Sort with adjustable speed and array size.

**What I learned:**
- Async/await for step-by-step algorithm visualization
- Implementing classic sorting algorithms from scratch
- Color-coded states (comparing, swapping, sorted, pivot)
- Real-time statistics tracking (comparisons, swaps)
- Generator-like control flow with sleep delays
- UI controls for algorithm selection and parameters
- Canvas bar chart rendering with gradients
- Responsive design for control panels

---

### Day 19: Bezier Curve Editor
Interactive bezier curve editor with draggable control points! Switch between quadratic and cubic curves, customize colors, and copy the CSS cubic-bezier output.

**What I learned:**
- Bezier curve mathematics (quadratic and cubic)
- Canvas bezierCurveTo and quadraticCurveTo methods
- Draggable point interaction with hit detection
- Converting canvas coordinates to normalized 0-1 values
- Generating CSS cubic-bezier() timing functions
- Clipboard API for copy functionality
- Visual feedback with control lines and point labels

---

### Day 20: Kaleidoscope
Mesmerizing kaleidoscope pattern generator! Draw inside the circle to create symmetrical patterns, or watch the auto mode create spiraling designs.

**What I learned:**
- Rotational symmetry with canvas transforms
- Mirror effect using scale(1, -1)
- Polar coordinate calculations
- Auto-drawing with spiraling algorithms
- HSL color cycling for rainbow effects
- Segment-based pattern replication
- Combining rotation and reflection transforms

---

## Tech Stack

- Vanilla JavaScript (no frameworks!)
- CSS3 (learning the hard way)
- TailwindCSS for utility classes
- HTML5

## Reflections

This journey is teaching me that:
- Not everything works the first time (or the second... or third)
- Sometimes you pivot from your original plan
- "Good enough" solutions that work are better than perfect solutions that don't
- CSS can be both beautiful and frustrating
- Every challenge is a learning opportunity

---

**Follow along as I build something new every day throughout 2026!**