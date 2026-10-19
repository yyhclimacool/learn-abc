import "./style.css";
import {
  alphabet,
  themes,
  words,
  lessonLetters,
  pickWords,
  optionsFor,
  positionDescription,
} from "./data.js";
import { loadState, saveState, nextLesson } from "./state.js";
import { art, icon, scene } from "./art.js";
import {
  configureAudio,
  speak,
  letterSound,
  tone,
  stopSpeaking,
} from "./audio.js";
import glyphs from "./glyphs.json";
const app = document.querySelector("#app");
let state = loadState(window.localStorage);
configureAudio(() => state);
let route = ["home", "letters", "game", "parents"].includes(
  location.hash.slice(1),
)
  ? location.hash.slice(1)
  : "home";
let selected = "a",
  modal = null,
  assessmentIndex = 0,
  assessmentAnswered = false,
  assessmentAnswer = "",
  feedback = "",
  feedbackType = "",
  help = false,
  locked = false,
  pendingTimer = null,
  idleTimer = null,
  storageFailed = false,
  printSelection = new Set(lessonLetters(nextLesson(state))),
  practice = false,
  savedSession = null;
const assessmentLetters = [
  "a",
  "b",
  "d",
  "e",
  "g",
  "h",
  "m",
  "n",
  "p",
  "q",
  "r",
  "t",
];
const persist = () => {
  storageFailed = !saveState(
    window.localStorage,
    practice ? { ...state, session: savedSession } : state,
  );
};
const btn = (label, action, cls = "secondary", attrs = "") =>
  `<button class="button ${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const title = (eyebrow, heading, sub = "") =>
  `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${heading}</h1>${sub ? `<p class="subtitle">${sub}</p>` : ""}</div></div>`;
function gridLetter(c, { trace = false, width = 360 } = {}) {
  const g = glyphs[c];
  // Glyph outlines are scaled by their font's actual x-height, so baseline and middle line align.
  const scale = 60 / glyphs._xHeight,
    x = (width - g.advance * scale) / 2;
  return `<svg class="ruled-letter ${trace ? "trace" : ""}" viewBox="0 0 ${width} 225" role="img" aria-label="小写 ${c}，${positionDescription(c)}"><rect x="0" y="85" width="${width}" height="60" fill="currentColor" opacity=".035"/>${[25, 85, 145, 205].map((y, i) => `<line x1="8" x2="${width - 8}" y1="${y}" y2="${y}" class="rule rule-${i}"/>`).join("")}<path d="${g.path}" transform="translate(${x} 145) scale(${scale} ${-scale})" fill="${trace ? "#c4c9c8" : "currentColor"}"/></svg>`;
}
function header() {
  return `<header class="site-header"><a href="#home" class="brand" aria-label="字母探险队首页">${art("fox")}<span>字母探险队<small>小小字母，大大世界</small></span></a><nav aria-label="主要导航">${[
    ["home", "home", "探险首页"],
    ["letters", "book", "认识字母"],
    ["game", "play", "闯关练习"],
  ]
    .map(
      ([r, i, t]) =>
        `<a href="#${r}" ${route === r ? 'aria-current="page"' : ""}>${icon(i)}${t}</a>`,
    )
    .join(
      "",
    )}</nav><a class="parent-link" href="#parents" ${route === "parents" ? 'aria-current="page"' : ""}>${icon("settings")}<span>家长中心</span></a></header>`;
}
function home() {
  const t = themes[state.theme],
    n = nextLesson(state),
    letters = lessonLetters(n),
    complete = state.lessons.length === 9;
  return `<main class="home-main"><section class="hero"><div class="hero-copy"><span class="welcome-tag"><span class="status-dot"></span>今天，也来发现一点点</span><h1>小小字母，<br>大大的探险。</h1><p>${t.message}<br>认一认，敲一敲，让每个字母都成为好朋友。</p>${btn(`${state.session && state.session.stage !== "done" ? "继续我的探险" : complete ? "再来一次探险" : "开始今天的探险"} ${icon("arrow")}`, "start", "primary hero-button")}<div class="hero-note">${icon("sound")} 中文陪伴 · 每次 5–10 分钟 · 不用比快</div></div><div class="hero-art">${scene(state.theme)}<div class="buddy-bubble">你好呀，小探险家！</div><span class="art-caption">每一小步，都值得开心。</span></div></section><section class="world-section"><div class="section-heading"><h2>今天，想去哪里？</h2><span>选一个喜欢的世界出发</span></div><div class="worlds">${Object.entries(
    themes,
  )
    .map(
      ([key, t]) =>
        `<button class="world ${state.theme === key ? "selected" : ""}" data-action="theme" data-value="${key}" aria-pressed="${state.theme === key}"><span class="world-art" style="background:${t.pale}">${art(t.icon)}</span><span><strong>${t.name}</strong><small>${key === "forest" ? "和小动物交朋友" : key === "dino" ? "寻找远古小伙伴" : key === "space" ? "向星星出发" : "快乐一路向前"}</small></span><span class="world-check">${state.theme === key ? icon("check") : ""}</span></button>`,
    )
    .join(
      "",
    )}</div></section><section class="home-bottom"><div class="mission"><span class="small-icon">${icon("book")}</span><div><h2>${complete ? "所有字母都见过啦" : "今天的小目标"}</h2><p>${complete ? "再探险一次，让字母朋友更熟悉。" : "认识三个字母朋友，再试着找到它们的按键。"}</p></div><div class="letter-chips">${letters.map((c) => `<span>${c.toUpperCase()}<b>${c}</b></span>`).join("")}</div></div><button class="collection-preview" data-action="stickers"><span class="small-icon gold">${icon("star")}</span><span><strong>我的探险贴纸</strong><small>已经收集 ${state.stickers.length} 枚 ${icon("arrow")}</small></span></button></section><footer class="home-footer">${art("leaf")} 慢慢来，你已经在进步啦。<span>已认识 ${state.learned.length} / 26 个小写字母</span></footer></main>`;
}
function lettersPage() {
  return `<main>${title("字母小图鉴", "认识每一位字母朋友", "点一个字母，听听它的名字，看看它住在哪一格。")}<section class="alphabet-layout"><div class="alphabet-board">${alphabet.map((c) => `<button data-action="select-letter" data-value="${c}" class="alphabet-tile ${c === selected ? "active" : ""}" aria-label="字母 ${c.toUpperCase()} ${c}" aria-pressed="${c === selected}"><span>${c.toUpperCase()}</span><b>${c}</b>${state.learned.includes(c) ? `<i>${icon("check")}</i>` : ""}</button>`).join("")}</div><div class="letter-detail"><div class="detail-heading"><span class="eyebrow">字母朋友</span>${btn(icon("sound") + " 听发音", "hear-selected", "round")}</div><div class="letter-pair"><span class="capital">${selected.toUpperCase()}</span><span class="pair-connector">的好朋友</span></div>${gridLetter(selected)}<p class="position">${positionDescription(selected)}</p><p class="keyboard-reminder">键盘上找 <kbd>${selected.toUpperCase()}</kbd>，屏幕上是 <b class="latin">${selected}</b></p>${btn("练练这个按键 " + icon("arrow"), "practice-letter", "primary")}</div></section></main>`;
}
function sessionLetters() {
  const s = state.session;
  if (practice) return [selected];
  const ls = s?.letters || lessonLetters(s?.lesson || 0);
  if (s?.stage === "pair") {
    const unfamiliar = ls.filter((c) => state.assessment[c] !== "known");
    return unfamiliar.length ? unfamiliar : [ls[0]];
  }
  return ls;
}
function sessionWords() {
  return pickWords(
    lessonLetters(state.session?.lesson || 0),
    state.session?.lesson || 0,
  );
}
function currentLetter() {
  const s = state.session;
  return s?.stage === "words"
    ? sessionWords()[s.wordIndex]?.word[s.charIndex]
    : sessionLetters()[s?.index || 0];
}
function keyboard(target) {
  return `<div class="keyboard" aria-label="Mac 字母键盘提示">${["qwertyuiop", "asdfghjkl", "zxcvbnm"].map((row) => `<div class="key-row">${[...row].map((c) => `<span class="key ${c === target && (help || !state.learned.includes(c)) ? "lit" : ""}" aria-label="${c.toUpperCase()} 键">${c.toUpperCase()}</span>`).join("")}</div>`).join("")}<div class="keyboard-caption">${icon("play")} 在电脑键盘上，找到并按一下字母键</div></div>`;
}
function gamePage() {
  if (!state.session)
    return `<main>${title("准备好了吗", "每一个按键，都是一步探险", "先认识字母，再找到按键，最后拼出一个小单词。")}<section class="empty-game">${art(themes[state.theme].icon)}<h2>和${themes[state.theme].buddy}一起出发</h2>${btn("开始探险 " + icon("arrow"), "start", "primary")}</section></main>`;
  const s = state.session,
    ls = sessionLetters(),
    c = currentLetter(),
    steps = ["learn", "pair", "keys", "words"],
    labels = ["认一认", "配一配", "找一找", "拼一拼"];
  if (s.stage === "done")
    return `<main class="completion"><div class="completion-stars">✦ &nbsp; ✧ &nbsp; ✦</div><div class="reward-art">${art(themes[state.theme].icon)}</div><p class="eyebrow">这一轮完成啦</p><h1>小小探险家，做得真棒！</h1><p>你又和 ${lessonLetters(
      s.lesson,
    )
      .map((c) => `<b class="latin">${c}</b>`)
      .join(
        "、",
      )} 见面啦。<br>收好你的「${themes[state.theme].reward}」贴纸，休息一下吧。</p><div class="completion-actions">${btn("回到营地", "finish", "primary")}${btn(icon("print") + " 纸上也练一练", "print-lesson")}</div><button class="text-button" data-action="next-lesson">我还想再玩一轮</button></main>`;
  const word = s.stage === "words" ? sessionWords()[s.wordIndex] : null;
  return `<main class="game-main"><div class="game-heading"><button class="text-button" data-action="leave-game">${icon("back")} 回营地</button><div class="stepper">${steps.map((step, i) => `<span class="${s.stage === step ? "current" : steps.indexOf(s.stage) > i ? "finished" : ""}"><i>${steps.indexOf(s.stage) > i ? icon("check") : i + 1}</i>${labels[i]}</span>`).join("")}</div><span class="lesson-badge">第 ${s.lesson + 1} 次探险</span></div><section class="game-card"><div class="game-card-top"><span>${s.stage === "words" ? `单词 ${s.wordIndex + 1} / 2` : `字母 ${s.index + 1} / ${ls.length}`}</span><div>${btn(icon("sound") + " 再听一次", "repeat", "quiet")}${btn(icon("help") + " 帮帮我", "help", "quiet")}</div></div><h1>${s.stage === "learn" ? "认识一位新朋友" : s.stage === "pair" ? "谁是它的大写朋友？" : s.stage === "keys" ? "找到它的键盘小屋" : "把图片的名字敲出来"}</h1><p class="game-instruction">${s.stage === "learn" ? "看一看它住在哪一格，听一听它的名字。" : s.stage === "pair" ? "点一下对应的大写字母。" : s.stage === "keys" ? "看小写，找大写。在电脑键盘上按一下。" : "从亮着的字母开始，一个一个慢慢来。"}</p>
${
  s.stage === "learn"
    ? `<div class="learn-display"><span class="big-capital">${c.toUpperCase()}</span><div>${gridLetter(c)}<p>${positionDescription(c)}</p></div></div>${btn("我认识啦 " + icon("arrow"), "learn-next", "primary")}`
    : s.stage === "pair"
      ? `<div class="pair-target latin">${c}</div><div class="choices">${optionsFor(
          c,
        )
          .map(
            (v) =>
              `<button data-action="pair" data-value="${v}" class="choice ${help && v === c ? "hint" : ""}" ${locked ? "disabled" : ""}>${v.toUpperCase()}</button>`,
          )
          .join("")}</div>`
      : s.stage === "keys"
        ? `<div class="key-target"><span class="latin">${c}</span><span class="target-bridge">找到</span><kbd>${help || !state.learned.includes(c) ? c.toUpperCase() : "?"}</kbd></div>${keyboard(c)}`
        : `<div class="word-stage"><button class="word-picture" data-action="hear-word" aria-label="听单词 ${word.word}">${art(word.art, "", word.zh)}<span>${word.zh} ${icon("sound")}</span></button><div><div class="word-letters" aria-label="单词 ${word.word}">${[...word.word].map((letter, i) => `<span class="latin ${i < s.charIndex ? "typed" : i === s.charIndex ? "target" : ""}" ${i === s.charIndex ? 'aria-current="true"' : ""}>${letter}</span>`).join("")}</div><p class="word-hint">${help ? `小写 <b class="latin">${c}</b> 对应键帽 <kbd>${c.toUpperCase()}</kbd>` : "按对一个，就向前一步。"}</p></div></div>${keyboard(c)}`
}
<div class="feedback ${feedbackType}" role="status" aria-live="polite">${feedback || "慢慢来，小狐狸会陪着你。"}</div></section><div class="game-footnote">${art("fox")} ${s.stage === "words" || s.stage === "keys" ? "如果按键没有反应，请家长帮忙切换到英文输入法（ABC）。" : "不着急，也不用比快。每一次尝试都很棒。"}</div></main>`;
}
function parentsPage() {
  const weak = alphabet.filter(
    (c) => (state.mistakes[c] || 0) > 0 || state.assessment[c] === "review",
  );
  return `<main>${title("给陪伴者", "看见每一点进步", "这里没有排名。陪孩子认识字母，也给每次尝试一点鼓励。")}<div class="parent-stats"><div><strong>${state.learned.length}<small> / 26</small></strong><span>已练习的小写字母</span></div><div><strong>${state.lessons.length}<small> / 9</small></strong><span>已完成的探险</span></div><div><strong>${state.stickers.length}</strong><span>收集到的贴纸</span></div></div><div class="parent-columns"><section class="panel"><h2>字母成长记录</h2><p>绿色为已练习，黄色为值得再见一面的朋友。</p><div class="progress-alphabet">${alphabet.map((c) => `<span title="${c}: ${weak.includes(c) ? "可以再练练" : state.learned.includes(c) ? "已练习" : "还未练习"}" class="${weak.includes(c) ? "needs-review" : state.learned.includes(c) ? "known" : ""}">${c}</span>`).join("")}</div><p>${weak.length ? `可以一起复习：<b class="latin">${weak.join(" · ")}</b>` : "还没有需要特别复习的字母，慢慢积累就好。"}</p><p class="muted">颜色表示练习记录，不代表掌握程度的正式评估。</p>${btn("重新做小写摸底", "assessment", "secondary")}<h3>声音与陪伴</h3><label class="switch-row"><span>中文引导与英文发音</span><input type="checkbox" id="sound-toggle" ${state.sound ? "checked" : ""} aria-label="开启声音"></label><label class="volume-label">声音大小 <input type="range" id="volume" min="0" max="1" step="0.1" value="${state.volume}"></label>${btn(icon("sound") + " 试听中文和英文", "test-audio", "quiet")}<p class="muted">语音使用浏览器和系统提供的声音。首次使用请试听，确认 Mac 已有中文与英文语音。</p><p class="audio-warning" ${window.speechSynthesis ? "hidden" : ""}>此浏览器不支持语音播放，请使用 Safari 或 Chrome。</p></section><section class="panel print-panel"><div class="section-heading"><h2>把字母带到纸上</h2>${icon("print")}</div><p>A4 四线三格练习纸，包含范例、描红和空白格。</p><div class="print-toolbar">${btn("本轮字母", "select-lesson", "quiet")}${btn("全部字母", "select-all", "quiet")}${btn("清空选择", "select-none", "quiet")}</div><div class="print-letters">${alphabet.map((c) => `<button class="${printSelection.has(c) ? "selected" : ""}" data-action="toggle-print" data-value="${c}" aria-pressed="${printSelection.has(c)}">${c}</button>`).join("")}</div><div class="paper-preview"><span>A a</span>${gridLetter("a", { trace: true })}<small>描一描，再自己写一写</small></div>${btn(icon("print") + ` 预览练习纸（${printSelection.size} 个字母）`, "preview-print", "primary", printSelection.size ? "" : "disabled")}<p class="muted">打印窗口中也可选择“存储为 PDF”。建议使用实际大小、关闭页眉和页脚。</p></section></div><div class="parent-note">${icon("help")} 进度只保存在当前浏览器。更换设备、浏览器或清除网站数据后不会自动同步。${storageFailed ? " 当前无法保存进度，请检查浏览器的存储设置。" : ""}</div></main>`;
}
function assessmentDialog() {
  const c = assessmentLetters[assessmentIndex],
    done = assessmentIndex >= assessmentLetters.length;
  return `<div class="modal-backdrop"><section class="modal assessment" role="dialog" aria-modal="true" aria-labelledby="modal-title">${
    done
      ? `<div class="modal-art">${art("star")}</div><h2 id="modal-title">已经认识一些朋友啦！</h2><p>我们会从 a 开始，按顺序一起学。<br>不熟悉的字母，多见几次就好。</p>${btn("开始第一小关 " + icon("arrow"), "assessment-finish", "primary")}`
      : `<div class="modal-top"><span>找朋友 · ${assessmentIndex + 1} / ${assessmentLetters.length}</span>${btn("跳过摸底", "skip-assessment", "quiet")}</div><h2 id="modal-title">谁是它的大写朋友？</h2><p>点一个大写字母。还不认识，也没关系。</p><div class="assessment-letter latin">${c}</div><div class="choices">${optionsFor(
          c,
        )
          .map(
            (v) =>
              `<button class="choice ${assessmentAnswered && v === c ? "hint" : ""}" data-action="assessment-answer" data-value="${v}" ${assessmentAnswered ? "disabled" : ""}>${v.toUpperCase()}</button>`,
          )
          .join(
            "",
          )}</div><p class="assessment-feedback" role="status">${assessmentAnswer || "试着自己找一找吧。"}</p>${assessmentAnswered ? btn("下一个 " + icon("arrow"), "assessment-next", "primary") : btn("我还不认识", "assessment-unknown", "quiet")}`
  }</section></div>`;
}
function stickerDialog() {
  return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="close-modal" aria-label="关闭贴纸册" data-action="close-modal">${icon("close")}</button><p class="eyebrow">每次探险的小纪念</p><h2 id="modal-title">我的探险贴纸</h2><div class="sticker-grid">${state.stickers.length ? state.stickers.map((t) => `<div>${art(themes[t].icon)}<span>${themes[t].reward}</span></div>`).join("") : `<div class="empty-stickers">${art("star")}<p>第一枚贴纸正在等你。<br>完成一轮探险，就能带它回家。</p></div>`}</div>${btn("收好贴纸册", "close-modal", "primary")}</section></div>`;
}
function printDialog() {
  return `<div class="modal-backdrop print-backdrop"><section class="modal print-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="print-controls"><div><h2 id="modal-title">我的字母练习纸</h2><p>每页 3 个字母 · A4 纵向</p></div><div>${btn("返回选择", "close-modal", "secondary")}${btn(icon("print") + " 打印 / 存为 PDF", "print", "primary")}</div></div><div class="print-pages">${[
    ...printSelection,
  ]
    .sort()
    .reduce((arr, c, i) => {
      if (i % 3 === 0) arr.push([]);
      arr.at(-1).push(c);
      return arr;
    }, [])
    .map(
      (cs, i) =>
        `<article class="worksheet"><header><div><h2>我的字母练习纸</h2><p>看一看，描一描，再自己写一写。</p></div><span>姓名：________　日期：________</span></header>${cs.map((c) => `<section class="worksheet-letter"><h3><span class="latin">${c.toUpperCase()} ${c}</span><small>${positionDescription(c)}</small></h3><div class="trace-row">${Array.from({ length: 7 }, (_, i) => gridLetter(c, { trace: i > 0, width: 145 })).join("")}</div><div class="blank-rules">${[0, 1, 2, 3].map(() => "<span></span>").join("")}</div></section>`).join("")}<footer>字母探险队 · 慢慢写，每一笔都算数。<span>${i + 1} / ${Math.ceil(printSelection.size / 3)}</span></footer></article>`,
    )
    .join("")}</div></section></div>`;
}
function render() {
  document.documentElement.style.setProperty(
    "--theme",
    themes[state.theme].color,
  );
  document.documentElement.style.setProperty(
    "--theme-pale",
    themes[state.theme].pale,
  );
  app.innerHTML =
    header() +
    (route === "letters"
      ? lettersPage()
      : route === "game"
        ? gamePage()
        : route === "parents"
          ? parentsPage()
          : home()) +
    (modal === "assessment"
      ? assessmentDialog()
      : modal === "stickers"
        ? stickerDialog()
        : modal === "print"
          ? printDialog()
          : "");
  document.body.classList.toggle("modal-open", !!modal);
  document.body.classList.toggle("printing", modal === "print");
  if (modal) {
    app.querySelector(".site-header").inert = true;
    app.querySelector("main").inert = true;
    const dialog = app.querySelector('[role="dialog"]');
    dialog
      ?.querySelector("button:not([disabled])")
      ?.focus({ preventScroll: true });
  }
  armIdle();
}
function go(page) {
  settleWord();
  if (practice && page !== "game") {
    state.session = savedSession;
    savedSession = null;
    practice = false;
  }
  stopSpeaking();
  clearTimeout(pendingTimer);
  locked = false;
  feedback = "";
  feedbackType = "";
  help = false;
  modal = null;
  route = page;
  if (location.hash !== `#${page}`) history.pushState(null, "", `#${page}`);
  render();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", () => {
  const r = location.hash.slice(1);
  go(["home", "letters", "game", "parents"].includes(r) ? r : "home");
});
function startSession() {
  practice = false;
  const lesson = nextLesson(state),
    base = lessonLetters(lesson),
    review = alphabet
      .filter(
        (c) =>
          !base.includes(c) &&
          state.learned.includes(c) &&
          (state.mistakes[c] || state.assessment[c] === "review"),
      )
      .sort((a, b) => (state.mistakes[b] || 0) - (state.mistakes[a] || 0))
      .slice(0, 1);
  state.session = {
    lesson,
    letters: [...base, ...review],
    stage: "learn",
    index: 0,
    wordIndex: 0,
    charIndex: 0,
  };
  persist();
  go("game");
  narrate();
}
function start() {
  if (!state.assessed && !state.session) {
    modal = "assessment";
    assessmentIndex = 0;
    assessmentAnswered = false;
    assessmentAnswer = "";
    render();
    speak([["先玩一个找朋友的小游戏。看小写，点出它的大写朋友。也可以跳过。"]]);
  } else if (state.session && state.session.stage !== "done") {
    go("game");
    narrate();
  } else startSession();
}
function narrate() {
  if (modal === "assessment") return;
  const s = state.session;
  if (route !== "game" || !s) return;
  const c = currentLetter();
  if (s.stage === "learn") letterSound(c, "认识一位字母朋友。它的名字是");
  else if (s.stage === "pair") speak([["点一下，它的大写朋友。"]]);
  else if (s.stage === "keys") letterSound(c, "在电脑键盘上，找到字母");
  else if (s.stage === "words")
    speak([
      ["我们来拼这个单词。"],
      [sessionWords()[s.wordIndex].word, "en-US"],
      ["先找到字母"],
      [c.toUpperCase(), "en-US"],
    ]);
  else speak([["这一轮完成啦！收好你的贴纸，休息一下吧。"]]);
}
function armIdle() {
  clearTimeout(idleTimer);
  if (
    route === "game" &&
    state.session &&
    !["done", "learn"].includes(state.session.stage) &&
    !modal &&
    !locked
  )
    idleTimer = setTimeout(() => {
      help = true;
      feedback = "需要帮忙吗？看看亮起来的提示。";
      feedbackType = "";
      render();
      letterSound(currentLetter(), "慢慢找，我们要找的是");
      clearTimeout(idleTimer);
    }, 18000);
}
function markWrong(c) {
  state.mistakes[c] = (state.mistakes[c] || 0) + 1;
  persist();
  tone(false);
  feedback = "再找一找，你可以的。";
  feedbackType = "try-again";
  help = true;
  render();
  letterSound(c, "我们要找的是字母");
}
function advanceLetter() {
  const s = state.session;
  const c = currentLetter();
  if (s.stage === "keys" && !state.learned.includes(c)) state.learned.push(c);
  s.index++;
  if (s.index >= sessionLetters().length) {
    s.index = 0;
    s.stage = { learn: "pair", pair: "keys", keys: "words" }[s.stage];
  }
  feedback = "";
  feedbackType = "";
  help = false;
  persist();
  render();
  narrate();
}
function correctLetter() {
  if (locked) return;
  locked = true;
  tone();
  feedback = "找对啦！";
  feedbackType = "success";
  render();
  pendingTimer = setTimeout(() => {
    locked = false;
    if (practice) {
      if (!state.learned.includes(selected)) state.learned.push(selected);
      persist();
      feedback = "找对啦！再按一次也可以，或去认识别的字母。";
      feedbackType = "success";
      render();
    } else advanceLetter();
  }, 450);
}
function awardSession() {
  const s = state.session;
  s.stage = "done";
  s.index = 0;
  if (!state.lessons.includes(s.lesson)) state.lessons.push(s.lesson);
  state.stickers.push(state.theme);
  for (const c of lessonLetters(s.lesson))
    if (!state.learned.includes(c)) state.learned.push(c);
  persist();
}
function completeSession() {
  awardSession();
  render();
  narrate();
}
function settleWord() {
  const s = state.session;
  if (
    s?.stage === "words" &&
    s.charIndex >= sessionWords()[s.wordIndex]?.word.length
  ) {
    s.wordIndex++;
    s.charIndex = 0;
    if (s.wordIndex === 2) awardSession();
    else persist();
  }
}
function inputLetter(key) {
  if (modal || route !== "game" || !state.session || locked) return;
  const s = state.session;
  if (!["keys", "words"].includes(s.stage)) return;
  const c = currentLetter();
  if (key.toLowerCase() !== c) {
    markWrong(c);
    return;
  }
  if (s.stage === "keys") {
    correctLetter();
    return;
  }
  tone();
  s.charIndex++;
  help = false;
  feedback = "对啦，继续找下一个！";
  feedbackType = "success";
  const w = sessionWords()[s.wordIndex];
  if (s.charIndex === w.word.length) {
    locked = true;
    feedback = "整个单词完成啦！";
    speak([[w.word, "en-US"], ["真棒！"]]);
    render();
    pendingTimer = setTimeout(() => {
      locked = false;
      settleWord();
      render();
      narrate();
    }, 1100);
  } else {
    persist();
    render();
  }
}
app.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (!b || b.disabled) return;
  const a = b.dataset.action,
    v = b.dataset.value;
  if (locked && ["pair", "repeat", "help"].includes(a)) return;
  if (a === "start") start();
  else if (a === "theme") {
    state.theme = v;
    persist();
    render();
    speak([[`我们去${themes[v].name}。`]]);
  } else if (a === "select-letter") {
    selected = v;
    render();
    letterSound(v);
  } else if (a === "hear-selected") letterSound(selected);
  else if (a === "practice-letter") {
    savedSession = state.session;
    practice = true;
    state.session = {
      lesson: Math.floor(alphabet.indexOf(selected) / 3),
      stage: "keys",
      index: 0,
      wordIndex: 0,
      charIndex: 0,
    };
    go("game");
    narrate();
  } else if (a === "learn-next") {
    tone();
    advanceLetter();
  } else if (a === "pair") {
    if (locked) return;
    if (v === currentLetter()) correctLetter();
    else markWrong(currentLetter());
  } else if (a === "repeat") narrate();
  else if (a === "help") {
    help = true;
    feedback = "看一看提示，再试试吧。";
    render();
    letterSound(currentLetter(), "我们要找的是");
  } else if (a === "hear-word")
    speak([[sessionWords()[state.session.wordIndex].word, "en-US"]]);
  else if (a === "leave-game") {
    go("home");
  } else if (a === "finish") {
    state.session = null;
    persist();
    go("home");
  } else if (a === "next-lesson") startSession();
  else if (a === "stickers") {
    modal = "stickers";
    render();
  } else if (a === "close-modal") {
    modal = null;
    stopSpeaking();
    render();
  } else if (a === "assessment") {
    modal = "assessment";
    assessmentIndex = 0;
    assessmentAnswered = false;
    assessmentAnswer = "";
    render();
    speak([["看小写，找到它的大写朋友。"]]);
  } else if (a === "skip-assessment") {
    state.assessed = true;
    persist();
    modal = null;
    startSession();
  } else if (a === "assessment-answer" || a === "assessment-unknown") {
    if (assessmentAnswered) return;
    const c = assessmentLetters[assessmentIndex],
      right = a === "assessment-answer" && v === c;
    state.assessment[c] = right ? "known" : "review";
    assessmentAnswered = true;
    assessmentAnswer = right
      ? "找对了，原来你们已经认识啦！"
      : `这是 ${c.toUpperCase()} 的小写朋友，我们会一起练习。`;
    persist();
    tone(right);
    render();
    letterSound(c, right ? "找对啦！它是" : "我们一起认识，它是");
  } else if (a === "assessment-next") {
    assessmentIndex++;
    assessmentAnswered = false;
    assessmentAnswer = "";
    render();
  } else if (a === "assessment-finish") {
    state.assessed = true;
    persist();
    modal = null;
    startSession();
  } else if (a === "test-audio")
    speak([["你好呀，小探险家。"], ["a", "en-US"], ["apple", "en-US"]]);
  else if (a === "toggle-print") {
    printSelection.has(v) ? printSelection.delete(v) : printSelection.add(v);
    render();
  } else if (a === "select-all") {
    printSelection = new Set(alphabet);
    render();
  } else if (a === "select-none") {
    printSelection.clear();
    render();
  } else if (a === "select-lesson") {
    printSelection = new Set(
      lessonLetters(state.session?.lesson ?? nextLesson(state)),
    );
    render();
  } else if (a === "preview-print") {
    if (printSelection.size) {
      modal = "print";
      render();
    }
  } else if (a === "print-lesson") {
    printSelection = new Set(lessonLetters(state.session.lesson));
    go("parents");
    modal = "print";
    render();
  } else if (a === "print") window.print();
});
app.addEventListener("change", (e) => {
  if (e.target.id === "sound-toggle") {
    state.sound = e.target.checked;
    persist();
    if (!state.sound) stopSpeaking();
  }
  if (e.target.id === "volume") {
    state.volume = Number(e.target.value);
    persist();
  }
});
window.addEventListener("keydown", (e) => {
  if (modal) {
    if (e.key === "Escape" && modal !== "assessment") {
      modal = null;
      render();
      return;
    }
    if (e.key === "Tab") {
      const bs = [
        ...app.querySelectorAll(
          '[role="dialog"] button:not([disabled]),[role="dialog"] input',
        ),
      ];
      if (!bs.length) return;
      const first = bs[0],
        last = bs.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    return;
  }
  if (
    e.repeat ||
    e.metaKey ||
    e.ctrlKey ||
    e.altKey ||
    e.target.matches("input,textarea,select")
  )
    return;
  if (e.isComposing || e.key === "Process") {
    if (route === "game") {
      feedback = "请切换到英文输入法（ABC），再试一试。";
      render();
    }
    return;
  }
  if (
    /^[a-z]$/i.test(e.key) &&
    route === "game" &&
    ["keys", "words"].includes(state.session?.stage)
  ) {
    e.preventDefault();
    inputLetter(e.key);
  }
});
window.addEventListener("pagehide", () => {
  settleWord();
  persist();
  stopSpeaking();
});
render();
