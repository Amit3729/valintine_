const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");
const qEl    = document.getElementById("question");
const subEl  = document.getElementById("sub");
const resEl  = document.getElementById("result");
const meterBar = document.getElementById("meterBar");
const shareLink = document.getElementById("shareLink");
const copyBtn = document.getElementById("copyBtn");
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

// ✅ Lyrics UI
const lyricBox = document.getElementById("lyricBox");
const lyricText = document.getElementById("lyricText");

// ✅ YouTube UI
const ytWrap = document.getElementById("ytWrap");
let player = null;
let ytReady = false;

// ✅ MAYA (Official Lyrics Video) video id
// Source: https://www.youtube.com/watch?v=kEbcHhNsRoU  (official lyrics video)
const MAYA_VIDEO_ID = "kEbcHhNsRoU";

// ⚠️ Put ONLY short lines here (don’t paste full lyrics in one go)
const lyrics = [
  "माया… 😔",
  "तिमी बिना मन अधुरो 💔",
  "यो दिल अझै पर्खिरहेको छ 🥀",
  "एकचोटि फर्केर हेर्नु न 💌"
];
let lyricIndex = 0;

// --- Your existing stages ---
let stage = 0;
const stages = [
  { q: "Are you sureee? 🥺", s: "My heart is very sensitive…", meter: 22 },
  { q: "Okay… what if I ask nicely? 🌸", s: "Pretty please with a rose on top 🌹", meter: 38 },
  { q: "What if I promise snacks? 🍫", s: "Chocolate + cozy vibes included.", meter: 55 },
  { q: "What if we just say yes for fun? 😄", s: "It’s a cute story, trust me.", meter: 72 },
  { q: "Last chance… will you be my Valentine? 💘", s: "Say yes and I’ll do a happy dance 🕺", meter: 90 }
];

function setStage(i){
  const s = stages[Math.min(i, stages.length-1)];
  qEl.textContent = s.q;
  subEl.textContent = s.s;
  meterBar.style.width = `${s.meter}%`;
}

function moveNoButton(){
  const wrap = document.querySelector(".buttons");
  const rect = wrap.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = rect.width - btnRect.width;
  const maxY = rect.height - btnRect.height;

  const x = Math.max(0, Math.min(maxX, Math.random() * maxX));
  const y = Math.max(0, Math.min(maxY, Math.random() * maxY));

  noBtn.style.position = "absolute";
  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
}

// ✅ YouTube IFrame API callback (must be global)
window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("ytPlayer", {
    videoId: MAYA_VIDEO_ID,
    playerVars: {
      autoplay: 0,     // we start on click
      controls: 1,
      rel: 0,
      modestbranding: 1
    },
    events: {
      onReady: () => { ytReady = true; }
    }
  });
};

// Confetti (your existing)
let particles = [];
function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function startConfetti(){
  particles = [];
  for(let i=0;i<160;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: -20 - Math.random()*canvas.height*0.5,
      r: 3 + Math.random()*4,
      vx: -2 + Math.random()*4,
      vy: 2 + Math.random()*4,
      rot: Math.random()*Math.PI,
      vr: -0.2 + Math.random()*0.4
    });
  }
  requestAnimationFrame(tick);
}
function tick(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const p of particles){
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.vy += 0.02;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = `hsl(${Math.floor(Math.random()*360)}, 90%, 60%)`;
    ctx.fillRect(-p.r, -p.r, p.r*2, p.r*2);
    ctx.restore();

    if(p.y > canvas.height + 30){
      p.y = -20;
      p.x = Math.random()*canvas.width;
      p.vy = 2 + Math.random()*4;
    }
  }
  requestAnimationFrame(tick);
}

// Hover/touch runaway
noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); moveNoButton(); }, {passive:false});

// ✅ On "No": show lyrics + play MAYA on YouTube
noBtn.addEventListener("click", () => {
  stage++;
  setStage(stage);
  moveNoButton();

  // show lyric board + next line
  lyricBox.classList.remove("hidden");
  lyricText.textContent = lyrics[lyricIndex % lyrics.length];
  lyricIndex++;

  // show youtube + play
  ytWrap.classList.remove("hidden");
  if (ytReady && player) {
    // Some browsers may require mute first; we try normal first:
    try {
      player.playVideo();
    } catch (e) {
      // fallback: mute then play
      player.mute();
      player.playVideo();
    }
  }

  // YES grows
  const scale = 1 + Math.min(0.35, stage * 0.08);
  yesBtn.style.transform = `scale(${scale})`;
});

// ✅ On "Yes": stop music + show result + confetti
yesBtn.addEventListener("click", () => {
  resEl.classList.remove("hidden");
  canvas.classList.remove("hidden");
  yesBtn.disabled = true;
  noBtn.disabled = true;

  // stop music
  if (ytReady && player) player.stopVideo();

  // share link
  shareLink.value = window.location.href;

  startConfetti();
});

copyBtn.addEventListener("click", async () => {
  try{
    await navigator.clipboard.writeText(shareLink.value);
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy", 1200);
  }catch{
    shareLink.select();
    document.execCommand("copy");
  }
});

// Init
setStage(0);
meterBar.style.width = "18%";
