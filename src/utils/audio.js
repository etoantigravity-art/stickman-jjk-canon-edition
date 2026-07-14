// js/audio.js

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playTone(freq, type, duration, vol, glideTo = null) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    
    osc.type = type;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if(glideTo !== null) {
        osc.frequency.exponentialRampToValueAtTime(glideTo, audioCtx.currentTime + duration);
    }
    
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// Low rumble for hits
function playHitSound() {
    playTone(100, 'square', 0.2, 0.5, 20);
    playTone(300, 'sawtooth', 0.1, 0.3, 50);
}

// Sharp swoop for UI hover
function playMenuHover() {
    playTone(600, 'sine', 0.1, 0.1, 800);
}

// Aggressive snap for UI select
function playMenuSelect() {
    playTone(200, 'square', 0.1, 0.4, 100);
    playTone(800, 'sawtooth', 0.1, 0.2, 200);
}

// Epic bass drop for Start Game
function playGameStart() {
    playTone(400, 'triangle', 2.0, 0.8, 50);
}

// Deep bass build up for Domain Expansion
function playDomainSound() {
    playTone(50, 'square', 3.0, 1.0, 30);
    playTone(150, 'sawtooth', 3.0, 0.5, 400);
}

// High pitched beam
function playBeamSound() {
    playTone(800, 'square', 0.8, 0.5, 400);
    playTone(1200, 'sawtooth', 0.6, 0.3, 100);
}

// Sharp slash sound for swords
function playSwordSound() {
    playTone(600, 'sawtooth', 0.15, 0.4, 1200);
    playTone(800, 'sine', 0.1, 0.2, 400);
}

// Splash sound for water attacks
function playWaterSound() {
    playTone(150, 'sine', 0.25, 0.6, 80);
    playTone(250, 'triangle', 0.2, 0.3, 120);
}

window.playSwordSound = playSwordSound;
window.playWaterSound = playWaterSound;

