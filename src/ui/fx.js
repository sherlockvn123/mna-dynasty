// Audio-visual feedback: confetti, sparkles, synthesized chimes (WebAudio, no assets).
import { S } from '../engine/store.js';
let ctx = null;
function ac() { try { ctx ||= new (window.AudioContext || window.webkitAudioContext)(); return ctx; } catch { return null; } }
export function chime(kind = 'ok') {
  if (!S.account?.settings?.sound) return;
  const a = ac(); if (!a) return;
  const seq = { ok: [660, 880], bad: [330, 262], reward: [523, 659, 784, 1046], tap: [880], level: [523, 659, 784, 988, 1175] }[kind] || [660];
  seq.forEach((f, i) => {
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine'; o.frequency.value = f; g.gain.value = 0;
    o.connect(g); g.connect(a.destination);
    const t = a.currentTime + i * 0.09;
    g.gain.linearRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.start(t); o.stop(t + 0.4);
  });
}
export function confetti(n = 60) {
  const layer = document.getElementById('fx');
  const colors = ['#f6a9bf', '#c9b8ec', '#fff0a8', '#a8cf9c', '#e6c36a', '#9fc3e6'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.className = 'confetti';
    p.style.left = 50 + (Math.random() - 0.5) * 30 + '%';
    p.style.background = colors[i % colors.length];
    p.style.setProperty('--dx', (Math.random() - 0.5) * 520 + 'px');
    p.style.setProperty('--dy', -(200 + Math.random() * 320) + 'px');
    p.style.setProperty('--r', Math.random() * 720 + 'deg');
    p.style.animationDelay = Math.random() * 0.15 + 's';
    layer.appendChild(p);
    setTimeout(() => p.remove(), 1800);
  }
}
export function toast(text, kind = '') {
  const layer = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast ' + kind; t.textContent = text;
  layer.appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3100);
}
