// Simple client-side password screen. This is a friendly gate, not strong security.
const passwordGate = document.getElementById("passwordGate");
const passwordForm = document.getElementById("passwordForm");
const passwordInput = document.getElementById("sitePassword");
const passwordError = document.getElementById("passwordError");
passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passwordInput.value.trim().toLowerCase() === "miichan") {
    passwordGate.style.display = "none";
    passwordError.textContent = "";
  } else {
    passwordError.textContent = "Not quite, bestie. Try again 💚";
    passwordInput.value = "";
    passwordInput.focus();
  }
});

const scenes = [...document.querySelectorAll(".scene")];
const particles = document.getElementById("particles");
let current = 0;
function showScene(id) {
  scenes.forEach(scene => scene.classList.toggle("active", scene.id === id));
  current = scenes.findIndex(scene => scene.id === id);
  window.scrollTo({top:0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
  if (id === "scene5") setTimeout(() => document.getElementById("photoWrap").classList.add("revealed"), 450);
  if (id === "scene2" || id === "scene4" || id === "scene5") burst(id === "scene5" ? 36 : 12);
}
document.querySelectorAll("[data-next]").forEach(btn => btn.addEventListener("click", () => showScene(btn.dataset.next)));

function burst(count=16) {
  const symbols = ["✦","✧","★","✧"];
  for (let i=0;i<count;i++) {
    const p = document.createElement("span");
    p.className = "particle";
    p.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    p.style.left = `${Math.random()*100}%`;
    p.style.fontSize = `${12+Math.random()*20}px`;
    p.style.animationDelay = `${Math.random()*.8}s`;
    p.style.animationDuration = `${3+Math.random()*2}s`;
    particles.appendChild(p);
    p.addEventListener("animationend", () => p.remove(), {once:true});
  }
}

// Candle interaction: all three flames must be tapped out to continue.
const candles = [...document.querySelectorAll(".candle")];
const candleHint = document.getElementById("candleHint");
const afterCandles = document.getElementById("afterCandles");
candles.forEach((candle, i) => candle.addEventListener("click", () => {
  if (candle.classList.contains("blown")) return;
  candle.classList.add("blown");
  burst(5);
  const remaining = candles.filter(c => !c.classList.contains("blown")).length;
  candleHint.textContent = remaining ? `Beautiful! ${remaining} candle${remaining===1?"":"s"} left. Make your wish ✨` : "All candles blown out! Make your wish come true. ♡";
  if (remaining === 0) {
    afterCandles.classList.remove("hidden");
    candleHint.textContent = "Close your eyes, make a wish, and tap continue. ♡";
    burst(24);
  }
}));

// Photo is revealed only after the candle scene and the wish scene.
document.getElementById("letterBtn").addEventListener("click", () => {
  const letter = document.getElementById("finalLetter");
  letter.classList.toggle("hidden");
  document.getElementById("letterBtn").textContent = letter.classList.contains("hidden") ? "One last message ♡" : "Hide message ↑";
});

// Starfield background.
const canvas = document.getElementById("stars"), ctx = canvas.getContext("2d");
let stars = [], w = 0, h = 0;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight;
  canvas.width = w*dpr; canvas.height = h*dpr; canvas.style.width = w+"px"; canvas.style.height = h+"px"; ctx.setTransform(dpr,0,0,dpr,0,0);
  stars = Array.from({length:Math.min(140,Math.floor(w/7))},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.4+.2,a:Math.random()*.65+.1,phase:Math.random()*6,tw:Math.random()*.02+.003}));
}
function draw() {
  ctx.clearRect(0,0,w,h);
  stars.forEach(s=>{if(!reduced)s.phase+=s.tw;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,225,240,${s.a*(.7+Math.sin(s.phase)*.3)})`;ctx.fill();});
  if(!reduced)requestAnimationFrame(draw);
}
resize();draw();addEventListener("resize",()=>{resize();if(reduced)draw();});

// Original soft birthday instrumental: warm piano-like notes, gentle chords and a light sparkle.
let audio = null, musicTimer = null, playing = false, beatIndex = 0;
let masterGain = null;
const melody = [
  { note: 659.25, dur: 0.62 }, { note: 587.33, dur: 0.42 },
  { note: 523.25, dur: 0.68 }, { note: 392.00, dur: 0.72 },
  { note: 440.00, dur: 0.50 }, { note: 523.25, dur: 0.50 },
  { note: 587.33, dur: 0.82 }, { note: 523.25, dur: 0.85 },
  { note: 493.88, dur: 0.62 }, { note: 440.00, dur: 0.45 },
  { note: 392.00, dur: 0.68 }, { note: 329.63, dur: 0.80 },
  { note: 392.00, dur: 0.52 }, { note: 440.00, dur: 0.52 },
  { note: 523.25, dur: 0.95 }, { note: 440.00, dur: 1.00 }
];
const chordSets = [
  [261.63, 329.63, 392.00], [220.00, 261.63, 329.63],
  [174.61, 220.00, 261.63], [196.00, 246.94, 293.66]
];
function tone(freq, when, duration, volume, type="sine", fade=1.8) {
  if (!audio || !masterGain) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(type === "triangle" ? 1800 : 2600, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(volume, when + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration * fade);
  osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
  osc.start(when); osc.stop(when + duration * fade + 0.04);
}
function playPhrase() {
  if (!playing || !audio) return;
  const item = melody[beatIndex % melody.length];
  const now = audio.currentTime + 0.04;
  // Rounded, piano-like lead note with a soft harmonic for warmth.
  tone(item.note, now, item.dur, 0.12, "triangle", 2.0);
  tone(item.note * 2, now + 0.015, item.dur * 0.55, 0.018, "sine", 1.5);
  // Gentle chord pad changes every four notes.
  if (beatIndex % 4 === 0) {
    const chord = chordSets[Math.floor(beatIndex / 4) % chordSets.length];
    chord.forEach((freq, i) => tone(freq, now, 2.0, i === 0 ? 0.025 : 0.016, "sine", 2.8));
    // A tiny high sparkle to make it feel magical, not romantic.
    tone(chord[2] * 2, now + 0.12, 0.75, 0.018, "sine", 1.8);
  }
  beatIndex++;
  musicTimer = setTimeout(playPhrase, Math.max(360, item.dur * 720));
}
const musicButton = document.getElementById("musicBtn");
if (musicButton) musicButton.addEventListener("click", async () => {
  const label = document.getElementById("musicText");
  if (playing) {
    playing = false;
    clearTimeout(musicTimer);
    if (masterGain && audio) {
      masterGain.gain.cancelScheduledValues(audio.currentTime);
      masterGain.gain.setTargetAtTime(0.0001, audio.currentTime, 0.12);
    }
    musicButton.setAttribute("aria-pressed", "false");
    if (label) label.textContent = "Sound off";
    return;
  }
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) { if (label) label.textContent = "Audio unavailable"; return; }
    audio = audio || new AudioContextClass();
    if (audio.state === "suspended") await audio.resume();
    masterGain = masterGain || audio.createGain();
    masterGain.gain.setValueAtTime(0.0001, audio.currentTime);
    masterGain.gain.setTargetAtTime(0.75, audio.currentTime, 0.35);
    masterGain.connect(audio.destination);
    playing = true;
    musicButton.setAttribute("aria-pressed", "true");
    if (label) label.textContent = "Music on";
    playPhrase();
  } catch (error) {
    if (label) label.textContent = "Audio unavailable";
  }
});
