import test from "node:test";
import assert from "node:assert/strict";
import {
  freshState,
  normalizeState,
  loadState,
  saveState,
  nextLesson,
} from "../src/state.js";
import { alphabet, lessonLetters, pickWords, optionsFor } from "../src/data.js";
test("nine sequential lessons cover all 26 letters exactly once", () =>
  assert.deepEqual(
    Array.from({ length: 9 }, (_, i) => lessonLetters(i)).flat(),
    alphabet,
  ));
test("each choice set includes its answer exactly once", () => {
  for (const c of alphabet) {
    const o = optionsFor(c);
    assert.equal(o.length, 3);
    assert.equal(new Set(o).size, 3);
    assert(o.includes(c));
  }
});
test("word selection is deterministic and contains illustrated vocabulary", () => {
  for (let i = 0; i < 9; i++) {
    const w = pickWords(lessonLetters(i), i);
    assert.deepEqual(w, pickWords(lessonLetters(i), i));
    assert.equal(w.length, 2);
    assert(w.every((v) => v.art && v.zh && /^[a-z]+$/.test(v.word)));
  }
});
test("corrupt storage recovers without breaking the app", () => {
  assert.deepEqual(loadState({ getItem: () => "{bad" }), freshState());
  assert.deepEqual(
    loadState({
      getItem: () => {
        throw Error("blocked");
      },
    }),
    freshState(),
  );
  assert.equal(
    saveState(
      {
        setItem: () => {
          throw Error("full");
        },
      },
      freshState(),
    ),
    false,
  );
});
test("untrusted persisted values are bounded and filtered", () => {
  const r = normalizeState({
    version: 1,
    theme: "<script>",
    volume: 90,
    learned: ["a", "a", "BAD"],
    lessons: [0, 12, -1],
    assessment: { a: "known", b: "no" },
    mistakes: { a: 4, b: -3 },
    stickers: ["forest", "bad"],
  });
  assert.equal(r.theme, "forest");
  assert.equal(r.volume, 1);
  assert.deepEqual(r.learned, ["a"]);
  assert.deepEqual(r.lessons, [0]);
  assert.deepEqual(r.assessment, { a: "known" });
  assert.deepEqual(r.mistakes, { a: 4 });
  assert.deepEqual(r.stickers, ["forest"]);
  assert.equal(nextLesson(r), 1);
});
test("invalid session positions do not cause undefined letters or words", () => {
  const s = normalizeState({
    ...freshState(),
    session: { lesson: 8, stage: "keys", index: 7, wordIndex: 0, charIndex: 0 },
  });
  assert.equal(s.session.index, 0);
  const w = normalizeState({
    ...freshState(),
    session: {
      lesson: 0,
      stage: "words",
      index: 0,
      wordIndex: 2,
      charIndex: 5,
    },
  });
  assert.equal(w.session.wordIndex, 0);
});
