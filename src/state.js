import { alphabet, themes, lessonLetters, pickWords } from "./data.js";
export const STORAGE_KEY = "letter-explorers-v1";
export function freshState() {
  return {
    version: 1,
    theme: "forest",
    sound: true,
    volume: 0.8,
    assessed: false,
    assessment: {},
    learned: [],
    mistakes: {},
    lessons: [],
    stickers: [],
    session: null,
  };
}
export function normalizeState(raw) {
  const base = freshState();
  if (!raw || raw.version !== 1) return base;
  base.theme = Object.hasOwn(themes, raw.theme) ? raw.theme : "forest";
  base.sound = typeof raw.sound === "boolean" ? raw.sound : true;
  base.volume = Number.isFinite(raw.volume)
    ? Math.min(1, Math.max(0, raw.volume))
    : 0.8;
  base.assessed = raw.assessed === true;
  base.learned = [
    ...new Set(
      Array.isArray(raw.learned)
        ? raw.learned.filter((c) => alphabet.includes(c))
        : [],
    ),
  ];
  base.lessons = [
    ...new Set(
      Array.isArray(raw.lessons)
        ? raw.lessons.filter((n) => Number.isInteger(n) && n >= 0 && n < 9)
        : [],
    ),
  ];
  base.stickers = Array.isArray(raw.stickers)
    ? raw.stickers.filter((t) => Object.hasOwn(themes, t))
    : [];
  for (const c of alphabet) {
    if (["known", "review"].includes(raw.assessment?.[c]))
      base.assessment[c] = raw.assessment[c];
    if (Number.isInteger(raw.mistakes?.[c]) && raw.mistakes[c] > 0)
      base.mistakes[c] = raw.mistakes[c];
  }
  const s = raw.session;
  if (
    s &&
    ["learn", "pair", "keys", "words", "done"].includes(s.stage) &&
    Number.isInteger(s.lesson) &&
    s.lesson >= 0 &&
    s.lesson < 9 &&
    Number.isInteger(s.index) &&
    s.index >= 0 &&
    s.index < 8 &&
    Number.isInteger(s.wordIndex) &&
    s.wordIndex >= 0 &&
    s.wordIndex <= 2 &&
    Number.isInteger(s.charIndex) &&
    s.charIndex >= 0 &&
    s.charIndex <= 5
  )
    base.session = {
      lesson: s.lesson,
      stage: s.stage,
      index: s.index,
      wordIndex: s.wordIndex,
      charIndex: s.charIndex,
      letters:
        Array.isArray(s.letters) &&
        s.letters.length > 0 &&
        s.letters.length <= 4 &&
        s.letters.every((c) => alphabet.includes(c))
          ? [...new Set(s.letters)]
          : lessonLetters(s.lesson),
    };
  if (base.session) {
    const t = base.session;
    if (t.index >= t.letters.length) t.index = 0;
    if (
      t.stage === "words" &&
      (t.wordIndex >= 2 ||
        t.charIndex >=
          pickWords(lessonLetters(t.lesson), t.lesson)[t.wordIndex].word.length)
    ) {
      t.wordIndex = 0;
      t.charIndex = 0;
    }
  }
  return base;
}
export function loadState(storage) {
  try {
    return normalizeState(JSON.parse(storage.getItem(STORAGE_KEY)));
  } catch {
    return freshState();
  }
}
export function saveState(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
export function nextLesson(state) {
  return (
    Array.from({ length: 9 }, (_, i) => i).find(
      (i) => !state.lessons.includes(i),
    ) ?? 0
  );
}
