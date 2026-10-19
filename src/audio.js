import { speechText } from "./letter-names.js";
import { selectVoice } from "./voices.js";
let context;
let settings = () => ({ sound: true, volume: 0.8 });
export function configureAudio(getSettings) {
  settings = getSettings;
}
let requestId = 0;
let playback;
export function stopSpeaking() {
  requestId++;
  playback?.abort();
  window.speechSynthesis?.cancel();
}
function waitForVoices(synth) {
  const voices = synth.getVoices();
  if (voices.length) return Promise.resolve(voices);
  return new Promise(resolve => {
    let timer;
    const finish = () => {
      clearTimeout(timer);
      synth.removeEventListener("voiceschanged", onChange);
      resolve(synth.getVoices());
    };
    const onChange = () => { if (synth.getVoices().length) finish(); };
    synth.addEventListener("voiceschanged", onChange);
    timer = setTimeout(finish, 800);
    onChange();
  });
}
function letterClip(text, lang) {
  return /^en(?:-|_|$)/i.test(lang) && /^[a-z]$/i.test(text)
    ? `/audio/letters/${text.toLowerCase()}.wav` : null;
}
function playClip(src, signal) {
  return new Promise(resolve => {
    const audio = new Audio(src);
    audio.volume = settings().volume;
    let finished = false;
    const finish = (ok) => {
      if (finished) return;
      finished = true;
      audio.pause();
      audio.removeEventListener("ended", ended);
      audio.removeEventListener("error", failed);
      signal.removeEventListener("abort", aborted);
      resolve(ok);
    };
    const ended = () => finish(true), failed = () => finish(false), aborted = () => finish(true);
    audio.addEventListener("ended", ended);
    audio.addEventListener("error", failed);
    signal.addEventListener("abort", aborted, {once: true});
    if (signal.aborted) return aborted();
    audio.play().catch(failed);
  });
}
function speakPart(synth, text, lang, voices, signal) {
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(speechText(text, lang));
    u.lang = lang; u.rate = 0.95; u.pitch = 1; u.volume = settings().volume;
    u.voice = selectVoice(voices, lang);
    if (voices.length && !u.voice) return resolve();
    const finish = () => { signal.removeEventListener("abort", finish); u.onend = null; u.onerror = null; resolve(); };
    u.onend = finish; u.onerror = finish;
    signal.addEventListener("abort", finish, {once: true});
    if (signal.aborted) return finish();
    synth.speak(u);
  });
}
export async function speak(parts) {
  stopSpeaking();
  if (!settings().sound) return;
  const synth = window.speechSynthesis;
  const id = requestId;
  playback = new AbortController();
  const signal = playback.signal;
  let voices;
  for (const [text, lang = "zh-CN"] of parts) {
    if (id !== requestId || !settings().sound) return;
    const clip = letterClip(text, lang);
    if (clip && await playClip(clip, signal)) continue;
    // Words and Chinese instructions use TTS. A failed asset gets the same fallback.
    if (!synth) continue;
    voices ??= await waitForVoices(synth);
    if (id !== requestId || !settings().sound) return;
    await speakPart(synth, text, lang, voices, signal);
  }
}
export function letterSound(c, intro = "") {
  return speak([...(intro ? [[intro, "zh-CN"]] : []), [c.toUpperCase(), "en-US"]]);
}
export function tone(correct = true) {
  if (!settings().sound) return;
  try {
    context ??= new (window.AudioContext || window.webkitAudioContext)();
    context.resume();
    const osc = context.createOscillator(),
      g = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(correct ? 660 : 280, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      correct ? 880 : 220,
      context.currentTime + 0.12,
    );
    g.gain.setValueAtTime(0.055 * settings().volume, context.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
    osc.connect(g);
    g.connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + 0.2);
  } catch {}
}
