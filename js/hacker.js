// Binary Rain Background
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.zIndex = '-1';
canvas.style.opacity = '0.08'; // Very subtle
canvas.style.pointerEvents = 'none';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
let width, height;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const columns = Math.floor(width / 20) + 1;
const yPositions = Array.from({ length: columns }).fill(0);

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // Use the CSS text-color variable if possible, fallback to green
    const color = getComputedStyle(document.body).getPropertyValue('--text-color').trim() || '#0f0';
    ctx.fillStyle = color;
    ctx.font = '15pt monospace';
    
    yPositions.forEach((y, index) => {
        const text = Math.random() > 0.5 ? '1' : '0';
        const x = index * 20;
        ctx.fillText(text, x, y);
        
        if (y > 100 + Math.random() * 10000) {
            yPositions[index] = 0;
        } else {
            yPositions[index] = y + 20;
        }
    });
}
setInterval(draw, 50);

// Audio System (Web Audio API)
let audioCtx;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Background terminal hum/processing sound
    function playBackgroundSound() {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(40, audioCtx.currentTime); // Low hum
        
        // Random frequency modulations for terminal/data processing feel
        setInterval(() => {
            if(Math.random() > 0.6) {
                osc.frequency.setTargetAtTime(40 + Math.random() * 100, audioCtx.currentTime, 0.05);
                setTimeout(() => osc.frequency.setTargetAtTime(40, audioCtx.currentTime, 0.05), 50 + Math.random() * 100);
            }
        }, 300);

        gainNode.gain.value = 0.01; // Very quiet
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
    }
    
    playBackgroundSound();
}

// Click sound
function playClickSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// Hover/Typing-like tick sound
function playHoverSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

// Ensure audio context starts on first user interaction
document.addEventListener('click', () => {
    initAudio();
    playClickSound();
});

// Bind hover sound to links
document.querySelectorAll('a').forEach(a => {
    a.addEventListener('mouseenter', playHoverSound);
});
