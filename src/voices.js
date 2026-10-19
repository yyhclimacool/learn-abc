// macOS also exposes novelty/character voices. Never select by list order.
const characterVoice = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|organ|trinoids|whisper|wobble|zarvox|grandma|grandpa|jester|superstar|rocko)\b/i;
const preferred = {
  en: ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Alex', 'Karen', 'Daniel', 'Moira', 'Tessa', 'Serena'],
  zh: ['Tingting', '婷婷', 'Google 普通话', 'Microsoft Xiaoxiao', 'Meijia', 'Sinji'],
};
const normalize = (lang) => lang.toLowerCase().replaceAll('_', '-');
export function selectVoice(voices, lang) {
  const target = normalize(lang), language = target.split('-')[0];
  const candidates = voices.filter(v => normalize(v.lang).split('-')[0] === language && !characterVoice.test(v.name));
  const score = (voice) => {
    const name = voice.name.toLowerCase();
    const rank = (preferred[language] || []).findIndex(n => name.includes(n.toLowerCase()));
    return (normalize(voice.lang) === target ? 1000 : 0)
      + (rank >= 0 ? 500 - rank * 20 : 0)
      + (/premium|enhanced|natural|neural/i.test(voice.name) ? 50 : 0)
      + (voice.default ? 10 : 0);
  };
  return candidates.sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name))[0] || null;
}
