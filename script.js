const canvas = document.getElementById('firefly-canvas');
const ctx = canvas.getContext('2d');
const music = document.getElementById('background-music');
const soundPrompt = document.getElementById('sound-prompt');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fireflies = [];
const numFireflies = 80;
let mouse = { x: 0, y: 0 };
const trailParticles = []; // Array for the cursor trail

// Firefly colors for variety - only green and yellow tones
const colors = [
    { r: 255, g: 255, b: 100 },  // Bright yellow
    { r: 255, g: 255, b: 150 },  // Light yellow
    { r: 200, g: 255, b: 100 },  // Green-yellow
    { r: 150, g: 255, b: 150 },  // Light green
    { r: 180, g: 255, b: 120 }   // Soft green-yellow
];

// New class for the cursor trail particles
class TrailParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2; // Slightly larger particles
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.alpha = 1;
        this.color = `rgba(255, 255, 180, 0.7)`; // Soft yellow glow
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= 0.15;
        this.alpha -= 0.04;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

class Firefly {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.baseSpeed = Math.random() * 0.5 + 0.2;
        this.speedX = (Math.random() - 0.5) * this.baseSpeed;
        this.speedY = (Math.random() - 0.5) * this.baseSpeed;
        this.alpha = Math.random() * 0.5 + 0.3;
        this.alphaChange = Math.random() * 0.015 + 0.005;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.glowSize = Math.random() * 15 + 10;
        this.flickerSpeed = Math.random() * 0.02 + 0.01;
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = Math.random() * 0.02 - 0.01;
        this.originalX = this.x;
        this.originalY = this.y;
        this.wanderRadius = Math.random() * 100 + 50;
    }

    update() {
        // Gentle wandering motion
        this.angle += this.angleSpeed;
        this.x += Math.sin(this.angle) * 0.3 + this.speedX;
        this.y += Math.cos(this.angle) * 0.3 + this.speedY;

        // Mouse interaction - enhanced attraction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const attractionForce = 0.005; // Increased attraction force
        
        if (distance < 200) { // Increased attraction range
            const force = attractionForce * (200 - distance) / 200;
            this.x += dx * force;
            this.y += dy * force;
        } else if (distance < 50) {
            // Too close - move away more gently
            this.x -= dx * 0.001;
            this.y -= dy * 0.001;
        }

        // Make fireflies brighter when closer to mouse
        const brightnessFactor = 1 - Math.min(distance / 200, 1);
        this.alpha = Math.min(this.alpha + brightnessFactor * 0.05, 0.9);

        // Flickering alpha effect
        this.alpha += Math.sin(Date.now() * this.flickerSpeed) * 0.1;
        if (this.alpha < 0.1) this.alpha = 0.1;
        if (this.alpha > 0.9) this.alpha = 0.9;

        // Boundary wrapping with smooth transition
        if (this.x < -20) this.x = canvas.width + 20;
        if (this.x > canvas.width + 20) this.x = -20;
        if (this.y < -20) this.y = canvas.height + 20;
        if (this.y > canvas.height + 20) this.y = -20;

        // Occasional direction change
        if (Math.random() < 0.002) {
            this.speedX = (Math.random() - 0.5) * this.baseSpeed;
            this.speedY = (Math.random() - 0.5) * this.baseSpeed;
        }
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.glowSize
        );
        
        // Enhanced glowing effect with more layers
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`);
        gradient.addColorStop(0.3, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha * 0.7})`);
        gradient.addColorStop(0.6, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        // Draw glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw bright center
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${Math.min(this.alpha + 0.3, 1)})`;
        ctx.fill();

        // Add extra bright core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.8})`;
        ctx.fill();
    }
}

function init() {
    fireflies.length = 0; // Clear existing fireflies
    for (let i = 0; i < numFireflies; i++) {
        fireflies.push(new Firefly());
    }
}

function animate() {
    // Clear the canvas completely - no trails
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Handle and draw trail particles
    for (let i = 0; i < trailParticles.length; i++) {
        trailParticles[i].update();
        trailParticles[i].draw();
        if (trailParticles[i].alpha <= 0) {
            trailParticles.splice(i, 1);
            i--; // Adjust index after removal
        }
    }

    fireflies.forEach(firefly => {
        firefly.update();
        firefly.draw();
    });
    requestAnimationFrame(animate);
}

// Mouse tracking
canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // Add new particles to the trail
    for (let i = 0; i < 2; i++) {
        trailParticles.push(new TrailParticle(mouse.x, mouse.y));
    }
});

// Touch support for mobile
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouse.x = touch.clientX;
    mouse.y = touch.clientY;
    // Add new particles for touch
    for (let i = 0; i < 2; i++) {
        trailParticles.push(new TrailParticle(mouse.x, mouse.y));
    }
});

// Click to add more fireflies
canvas.addEventListener('click', (e) => {
    for (let i = 0; i < 5; i++) {
        const newFirefly = new Firefly();
        newFirefly.x = e.clientX + (Math.random() - 0.5) * 100;
        newFirefly.y = e.clientY + (Math.random() - 0.5) * 100;
        fireflies.push(newFirefly);
    }
    
    // Remove excess fireflies to maintain performance
    if (fireflies.length > 150) {
        fireflies.splice(0, fireflies.length - 150);
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init(); // Reinitialize fireflies for new canvas size
});

function startExperience() {
    // Hide the prompt
    soundPrompt.style.display = 'none';

    // Play the music
    music.play().catch(error => {
        console.error("Audio playback failed:", error);
    });

    // Start the animation
    init();
    animate();
}

// Add event listener to the prompt
soundPrompt.addEventListener('click', startExperience);
