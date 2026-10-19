// Spoken letter names, not the characters themselves: some macOS voices
// verbalize isolated uppercase characters as "capital J". Both cases share a name.
const names = [
  'the letter a', 'bee', 'see', 'dee', 'ee', 'eff', 'gee', 'aitch', 'eye',
  'jay', 'kay', 'ell', 'em', 'en', 'oh', 'pee', 'cue', 'ar',
  'ess', 'tee', 'you', 'vee', 'double you', 'ex', 'why', 'zee',
];
export function speechText(text, lang) {
  if (/^en(?:-|_|$)/i.test(lang) && /^[a-z]$/i.test(text)) {
    return names[text.toLowerCase().charCodeAt(0) - 97];
  }
  return text;
}
