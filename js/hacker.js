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
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { return; }
    
    // Smooth binary background sound
    function playBackgroundSound() {
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const biquadFilter = audioCtx.createBiquadFilter();
        biquadFilter.type = 'lowpass';
        biquadFilter.frequency.value = 300;

        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.003; // Very subtle smooth noise

        noiseSource.connect(biquadFilter);
        biquadFilter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        noiseSource.start();

        // Smooth data blips
        setInterval(() => {
            if(Math.random() > 0.6) {
                const osc = audioCtx.createOscillator();
                const oscGain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600 + Math.random() * 400, audioCtx.currentTime);
                oscGain.gain.setValueAtTime(0, audioCtx.currentTime);
                oscGain.gain.linearRampToValueAtTime(0.005, audioCtx.currentTime + 0.1);
                oscGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
                osc.connect(oscGain);
                oscGain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.4);
            }
        }, 1200);
    }
    
    playBackgroundSound();
}

// Sci-fi Click sound
function playClickSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

// Sci-fi Typewriter sound
function playTypewriterSound() {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1500 + Math.random() * 800, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
}

// Ensure audio context starts on first user interaction
document.addEventListener('click', () => {
    initAudio();
    playClickSound();
});

// Bind hover sound to links
document.querySelectorAll('a').forEach(a => {
    a.addEventListener('mouseenter', playTypewriterSound);
});
document.addEventListener("DOMContentLoaded", () => {
    // Check if it's the first time the user visits in this session
    if (!sessionStorage.getItem("loaderShown")) {
        const loader = document.createElement("div");
        loader.id = "hacker-loader";
        loader.innerHTML = `
            <div class="loader-content">
                <span id="loader-text"></span><span class="blink">_</span>
            </div>
        `;
        document.body.appendChild(loader);

        const texts = [
            "INITIALIZING SYSTEM ENVIRONMENTS...",
            "ESTABLISHING SECURE CONNECTION...",
            "BYPASSING MAINFRAME FIREWALLS...",
            "ACCESS GRANTED. WELCOME, USER."
        ];

        let textIndex = 0;
        let charIndex = 0;
        const loaderText = document.getElementById("loader-text");

        function typeText() {
            if (textIndex < texts.length) {
                if (charIndex < texts[textIndex].length) {
                    loaderText.innerHTML += texts[textIndex].charAt(charIndex);
                    charIndex++;
                    // play typing sound slightly
                    if (typeof playTypewriterSound === "function" && Math.random() > 0.5) playTypewriterSound();
                    setTimeout(typeText, 25 + Math.random() * 30);
                } else {
                    loaderText.innerHTML += "<br><br>";
                    textIndex++;
                    charIndex = 0;
                    setTimeout(typeText, 400 + Math.random() * 400);
                }
            } else {
                setTimeout(() => {
                    loader.style.opacity = "0";
                    setTimeout(() => {
                        loader.remove();
                        sessionStorage.setItem("loaderShown", "true");
                        // start audio
                        if (typeof initAudio === "function") initAudio();
                    }, 500);
                }, 800);
            }
        }

        setTimeout(typeText, 500);
    }
});
