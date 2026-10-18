export const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
export const themes = {
  forest: {
    name: "森林营地",
    short: "森林",
    icon: "leaf",
    color: "#447c59",
    pale: "#e8f2df",
    buddy: "小狐狸",
    reward: "森林小伙伴",
    message: "跟小狐狸一起，发现字母的秘密。",
  },
  dino: {
    name: "恐龙岛",
    short: "恐龙",
    icon: "dino",
    color: "#537f52",
    pale: "#ebf1d5",
    buddy: "小恐龙",
    reward: "恐龙探险家",
    message: "穿过大大的叶子，寻找小小的字母。",
  },
  space: {
    name: "太空站",
    short: "太空",
    icon: "rocket",
    color: "#6267a1",
    pale: "#eeecfa",
    buddy: "宇航狐狸",
    reward: "星际旅行家",
    message: "飞向星星，把字母带回太空站。",
  },
  car: {
    name: "汽车小镇",
    short: "汽车",
    icon: "car",
    color: "#b56443",
    pale: "#fff0df",
    buddy: "小司机",
    reward: "快乐小司机",
    message: "坐好啦！下一站，字母小镇。",
  },
};
export const words = [
  ["cat", "猫", "cat"],
  ["dog", "狗", "dog"],
  ["sun", "太阳", "sun"],
  ["egg", "鸡蛋", "egg"],
  ["bus", "公交车", "bus"],
  ["hat", "帽子", "hat"],
  ["pig", "小猪", "pig"],
  ["box", "盒子", "box"],
  ["car", "汽车", "car"],
  ["fish", "鱼", "fish"],
  ["moon", "月亮", "moon"],
  ["star", "星星", "star"],
  ["apple", "苹果", "apple"],
  ["key", "钥匙", "key"],
  ["tree", "树", "tree"],
  ["fox", "狐狸", "fox"],
  ["bee", "蜜蜂", "bee"],
  ["cup", "杯子", "cup"],
  ["van", "小货车", "bus"],
  ["yak", "牦牛", "yak"],
  ["zoo", "动物园", "zoo"],
  ["jet", "喷气飞机", "jet"],
  ["queen", "女王", "queen"],
  ["web", "蜘蛛网", "web"],
  ["nut", "坚果", "nut"],
  ["ink", "墨水", "ink"],
].map(([word, zh, art]) => ({ word, zh, art }));
export function lessonLetters(index) {
  return alphabet.slice(index * 3, index * 3 + 3);
}
export function pickWords(letters, lesson = 0) {
  const ranked = words.map((w, i) => ({
    ...w,
    score:
      [...w.word].filter((c) => letters.includes(c)).length * 3 -
      w.word.length * 0.25,
    i,
  }));
  ranked.sort(
    (a, b) =>
      b.score - a.score ||
      ((a.i + lesson) % words.length) - ((b.i + lesson) % words.length),
  );
  return ranked.slice(0, 2);
}
export function optionsFor(letter) {
  const i = alphabet.indexOf(letter);
  return [letter, alphabet[(i + 7) % 26], alphabet[(i + 15) % 26]].sort(
    (a, b) =>
      ((alphabet.indexOf(a) * 11 + i * 7) % 29) -
      ((alphabet.indexOf(b) * 11 + i * 7) % 29),
  );
}
export function positionDescription(c) {
  if (c === "j") return "小圆点在上格，小尾巴伸进下格";
  if ("gpqy".includes(c)) return "小尾巴伸进下格";
  if ("bdfhklt".includes(c)) return "长高高，住在上格和中格";
  if ("ij".includes(c)) return "小圆点在上格";
  return "住在中间一格";
}
