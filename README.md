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