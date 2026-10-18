let context;
let settings = () => ({ sound: true, volume: 0.8 });
export function configureAudio(getSettings) {
  settings = getSettings;
}
export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
export function speak(parts) {
  stopSpeaking();
  if (!settings().sound || !window.speechSynthesis) return;
  for (const [text, lang = "zh-CN"] of parts) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = lang.startsWith("en") ? 0.72 : 0.9;
    u.volume = settings().volume;
    const voices = window.speechSynthesis.getVoices();
    u.voice =
      voices.find(
        (v) => v.lang.toLowerCase() === lang.toLowerCase() && v.localService,
      ) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2))) ||
      null;
    window.speechSynthesis.speak(u);
  }
}
export function letterSound(c, intro = "") {
  speak([...(intro ? [[intro, "zh-CN"]] : []), [c.toUpperCase(), "en-US"]]);
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
