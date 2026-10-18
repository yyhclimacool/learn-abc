const fox = `<path d="M45 101 36 44 83 66Q112 51 143 66L187 44 177 108Q187 158 153 181Q108 212 66 179Q36 158 45 101" fill="#e7974e"/><path d="m44 56 10 43 25-23m99-20-11 43-25-23" fill="#744e3a"/><path d="M44 121Q72 110 111 159Q145 110 179 121Q177 172 111 190Q48 173 44 121" fill="#fff6e7"/><path d="M73 114q10-10 18 0m43 0q10-10 18 0" fill="none" stroke="#493e35" stroke-width="6" stroke-linecap="round"/><path d="m102 147 20 0-10 13Z" fill="#493e35"/><path d="m112 160 0 7m-9 0q9 10 18 0" fill="none" stroke="#493e35" stroke-width="4" stroke-linecap="round"/><ellipse cx="65" cy="137" rx="12" ry="7" fill="#edac84"/><ellipse cx="157" cy="137" rx="12" ry="7" fill="#edac84"/>`;
const shapes = {
  fox,
  leaf: `<path d="M50 177Q20 53 177 37Q193 176 50 177" fill="#74a66a"/><path d="m48 182 104-104m-71 71-5-48m36 17 44-2" fill="none" stroke="#3b704b" stroke-width="8" stroke-linecap="round"/>`,
  cat: `<path d="m46 103-5-61 53 36q18-8 36 0l50-36-5 61q28 90-65 91T46 103" fill="#e9b35d"/><path d="m55 63 4 40 25-18m83-22-3 40-25-18" fill="#e99387"/><path d="m72 126 1 8m73-8 1 8" stroke="#443f36" stroke-width="8" stroke-linecap="round"/><path d="m101 146 18 0-9 10Z" fill="#ab635d"/><path d="M110 156q-12 18-22 4m22-4q12 18 22 4m-62-13-37-8m37 22-37 6m118-20 37-8m-37 22 37 6" fill="none" stroke="#66513e" stroke-width="4"/>`,
  dog: `<path d="M72 65Q20 48 30 151Q61 173 79 102m70-37q51-17 42 86-31 22-49-49" fill="#92684b"/><ellipse cx="111" cy="123" rx="61" ry="73" fill="#e9c397"/><ellipse cx="86" cy="118" rx="6" ry="8" fill="#443f36"/><ellipse cx="139" cy="118" rx="6" ry="8" fill="#443f36"/><ellipse cx="112" cy="148" rx="15" ry="11" fill="#443f36"/><path d="M101 166h22v16q-11 18-22 0" fill="#e58a85"/>`,
  sun: `<g stroke="#e8aa40" stroke-width="9" stroke-linecap="round"><path d="M110 25v20m0 130v20M25 110h20m130 0h20M50 50l15 15m90 90 15 15M50 170l15-15m90-90 15-15"/></g><circle cx="110" cy="110" r="52" fill="#f6ca5a"/><path d="M88 104v3m44-3v3m-35 24q13 14 26 0" fill="none" stroke="#79563b" stroke-width="6" stroke-linecap="round"/>`,
  apple: `<path d="M110 67Q63 33 40 85Q14 157 81 187q22 7 29-3 12 10 34 3 67-30 40-102-24-52-74-18" fill="#df775e"/><path d="M109 67q-4-27 12-41" stroke="#76513e" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M121 47q8-38 51-25-12 32-51 25" fill="#6d9e66"/><path d="M64 85q-14 14-13 34" fill="none" stroke="#f7b4a0" stroke-width="9" stroke-linecap="round"/>`,
  car: `<path d="m45 110 25-52h75l31 52 22 9v54H22v-51Z" fill="#e99654"/><path d="m78 70-17 38h94l-22-38Z" fill="#c6e6ea"/><path d="M108 70v38" stroke="#e99654" stroke-width="8"/><circle cx="63" cy="169" r="22" fill="#43536a"/><circle cx="159" cy="169" r="22" fill="#43536a"/><circle cx="63" cy="169" r="9" fill="#e8eef2"/><circle cx="159" cy="169" r="9" fill="#e8eef2"/><path d="M24 133h25m126 0h21" stroke="#fff3c6" stroke-width="10"/>`,
  bus: `<rect x="25" y="50" width="171" height="119" rx="20" fill="#edbd50"/><path d="M42 70h32v44H42zm48 0h32v44H90zm48 0h39v44h-39Z" fill="#d7edf0"/><circle cx="63" cy="169" r="22" fill="#43536a"/><circle cx="158" cy="169" r="22" fill="#43536a"/>`,
  dino: `<path d="m57 141-16-25 30-4-10-29 31 7 0-34 26 17 14-27 16 32" fill="#e6bd5e"/><path d="M163 172Q95 210 58 164L25 141q34 7 41-29 14-75 69-62 61-7 55 50-3 23-53 24l3 33 37-4Z" fill="#80ad72"/><circle cx="158" cy="79" r="6" fill="#3d5844"/><path d="m157 103 25 0m-83 60-7 26m35-23 2 23" stroke="#3d5844" stroke-width="7" stroke-linecap="round"/>`,
  rocket: `<path d="m82 144 28 61 28-61" fill="#f4c75e"/><path d="m80 107-33 36-7 34 47-20m53-50 33 36 7 34-47-20" fill="#9b9bc9"/><path d="M75 146Q59 68 110 20q51 48 35 126Z" fill="#f9f8ed" stroke="#8286ae" stroke-width="5"/><circle cx="110" cy="88" r="22" fill="#a7d8df" stroke="#8286ae" stroke-width="7"/><path d="m85 48 25-28 25 28Z" fill="#dc8d76"/>`,
  egg: `<path d="M110 30Q45 65 49 141q5 55 61 55t61-55Q175 65 110 30" fill="#fff9e8" stroke="#d4c7a9" stroke-width="4"/><ellipse cx="114" cy="143" rx="35" ry="31" fill="#f2c257"/>`,
  hat: `<path d="m61 140 15-88h69l17 88" fill="#88a47a"/><path d="M65 117h94v24H65Z" fill="#f1cd77"/><ellipse cx="111" cy="151" rx="87" ry="22" fill="#6a8c61"/>`,
  pig: `<path d="m56 91-9-51 51 29m66 22 9-51-51 29" fill="#db8f9b"/><ellipse cx="110" cy="125" rx="77" ry="66" fill="#efb1b7"/><circle cx="80" cy="113" r="6" fill="#72545b"/><circle cx="141" cy="113" r="6" fill="#72545b"/><ellipse cx="110" cy="150" rx="31" ry="23" fill="#dd8e9b"/><path d="m98 147 0 7m24-7v7" stroke="#9b5d6a" stroke-width="6" stroke-linecap="round"/>`,
  box: `<path d="m35 75 75-37 75 37v97l-75 34-75-34Z" fill="#c99c66"/><path d="m35 75 75 35 75-35-75-37Z" fill="#e7c593"/><path d="M110 110v96m-37-148 74 35v41" fill="none" stroke="#f6dfb5" stroke-width="16"/>`,
  fish: `<path d="m157 111 48-44v86Z" fill="#e2a45a"/><ellipse cx="97" cy="111" rx="73" ry="49" fill="#edbd69"/><path d="m83 62 30-29 20 38m-50 88 30 26 20-35" fill="#d9954e"/><circle cx="62" cy="103" r="6" fill="#564d3e"/><path d="M95 83q-16 27 0 56" fill="none" stroke="#d9954e" stroke-width="7"/>`,
  moon: `<path d="M153 30Q62 33 57 120q5 85 98 75Q96 169 95 109q0-51 58-79" fill="#edc56b"/>`,
  star: `<path d="m110 26 26 54 59 8-43 43 10 60-52-29-52 29 10-60-43-43 59-8Z" fill="#f0c458"/><path d="m92 108 0 4m36-4v4m-27 20q9 8 18 0" fill="none" stroke="#8e6c3f" stroke-width="5" stroke-linecap="round"/>`,
  key: `<circle cx="77" cy="78" r="39" fill="none" stroke="#dfb657" stroke-width="17"/><path d="m104 105 77 77m-25-25 18-18m-38-2 18-18" stroke="#dfb657" stroke-width="17" stroke-linecap="round"/>`,
  tree: `<path d="M101 117h22v83h-22Z" fill="#9e7952"/><path d="m111 23-62 80h28l-40 54h148l-40-54h28Z" fill="#73a17a"/>`,
  bee: `<ellipse cx="84" cy="74" rx="30" ry="38" fill="#c7e3ea"/><ellipse cx="136" cy="74" rx="30" ry="38" fill="#d8eef1"/><ellipse cx="110" cy="130" rx="69" ry="44" fill="#eac45c"/><path d="M91 90v81m35-80v80" stroke="#6b604c" stroke-width="17"/><circle cx="61" cy="121" r="5" fill="#5b503b"/>`,
  cup: `<path d="M158 72h17q45 42-14 68" fill="none" stroke="#6d9da5" stroke-width="16"/><path d="M45 65h116v83q-2 39-58 39t-58-39Z" fill="#98c5c8"/><path d="m82 35 4-16m37 16 4-16" stroke="#becdd2" stroke-width="7" stroke-linecap="round"/>`,
  jet: `<path d="m110 20 15 79 74 46v17l-77-23 2 41 25 16v11l-39-10-39 10v-11l25-16 2-41-77 23v-17l74-46Z" fill="#8ab8cc"/>`,
  queen: `<path d="m60 77-15-44 43 19 22-34 24 34 41-19-15 44Z" fill="#ebc260"/><circle cx="110" cy="117" r="48" fill="#ecc4a0"/><path d="M51 201q4-55 59-55t59 55" fill="#a29ec4"/><path d="m92 112 0 4m36-4v4m-27 18q9 8 18 0" stroke="#63504b" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  web: `<g stroke="#94adb5" stroke-width="4" fill="none"><path d="M110 24v172M24 110h172M49 49l122 122M49 171 171 49M110 45l46 19 19 46-19 46-46 19-46-19-19-46 19-46Z M110 76l24 10 10 24-10 24-24 10-24-10-10-24 10-24Z"/></g>`,
  nut: `<path d="M57 100q-4 73 53 100 57-27 53-100" fill="#bd895b"/><path d="M42 103q3-62 68-62t68 62Z" fill="#846c4c"/><path d="m108 42 8-22" stroke="#846c4c" stroke-width="10" stroke-linecap="round"/>`,
  ink: `<rect x="78" y="36" width="64" height="31" rx="6" fill="#4e6277"/><path d="m78 67-26 40v71q0 15 15 15h86q15 0 15-15v-71l-26-40Z" fill="#7ca5bd"/><rect x="70" y="112" width="80" height="50" rx="6" fill="#f4f4e8"/><path d="M110 119q-27 34 0 34t0-34" fill="#4e6277"/>`,
  yak: `<path d="M57 90Q20 87 24 50q8 17 35 19m104 21q37-3 33-40-8 17-35 19" fill="#d3bd96"/><path d="M50 74q60-40 120 0v89l-21 27-17-10-22 20-22-20-17 10-21-27Z" fill="#967859"/><path d="m79 111 0 7m62-7v7" stroke="#332e29" stroke-width="7" stroke-linecap="round"/><ellipse cx="110" cy="154" rx="30" ry="19" fill="#c0a184"/>`,
  zoo: `<path d="M31 191V62h158v129M21 68h178" stroke="#9d825d" stroke-width="13" fill="none"/><path d="M57 191v-62m106 62v-62" stroke="#9d825d" stroke-width="9"/><circle cx="110" cy="129" r="42" fill="#c99459"/><circle cx="110" cy="129" r="29" fill="#edc385"/><path d="m98 125 0 3m24-3v3m-19 16 14 0-7 7Z" stroke="#624b38" stroke-width="5"/>`,
};
export function art(name, cls = "", label = "") {
  return `<svg class="art ${cls}" viewBox="0 0 220 220" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} xmlns="http://www.w3.org/2000/svg">${shapes[name] || fox}</svg>`;
}
export function icon(name) {
  const paths = {
    home: "M3 10 12 3l9 7v11h-6v-7H9v7H3Z",
    book: "M3 4h7q2 0 2 2v15q-2-3-9-2Zm18 0h-7q-2 0-2 2v15q2-3 9-2Z",
    play: "m8 4 12 8-12 8Z",
    settings: "M5 6h14M5 12h14M5 18h14M9 3v6m6 0v6m-5 0v6",
    sound: "M3 9h4l5-5v16l-5-5H3Zm13-2q6 5 0 10",
    star: "m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    print: "M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6Z",
    check: "m5 12 4 4L19 6",
    help: "M9 8q0-4 4-3t0 7l-1 2m0 4h.01",
    back: "m14 5-7 7 7 7",
    close: "m6 6 12 12M6 18 18 6",
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name] || paths.star}"/></svg>`;
}
export function scene(theme) {
  const obj =
    theme === "dino"
      ? "dino"
      : theme === "space"
        ? "rocket"
        : theme === "car"
          ? "car"
          : "fox";
  return `<svg class="scene" viewBox="0 0 600 430" aria-label="小狐狸的探险世界" role="img"><circle cx="335" cy="198" r="153" fill="var(--theme-pale)"/><path d="M47 345q105-83 201-31t262-15v95H47Z" fill="#c7dcb1"/><path d="M105 366q141-59 344 0" stroke="#f7f5df" stroke-width="30" fill="none"/><path d="M102 310V180m-2 82-35-29m36-19 33-26" stroke="#799970" stroke-width="10" stroke-linecap="round"/><circle cx="99" cy="174" r="52" fill="#91b58b"/><circle cx="63" cy="214" r="35" fill="#91b58b"/><circle cx="132" cy="210" r="35" fill="#91b58b"/><g transform="translate(180 110) scale(1.14)">${shapes[obj]}</g><g transform="translate(418 261) scale(.4)">${shapes.tree}</g><g transform="translate(410 48) scale(.3)">${shapes.star}</g><g transform="translate(132 38) rotate(-12)"><rect width="66" height="75" rx="15" fill="#fffef5" stroke="#d6dfd7" stroke-width="2"/><text x="33" y="54" text-anchor="middle" font-size="46" fill="#52765c" font-family="Andika">a</text></g><g transform="translate(456 165) rotate(12)"><rect width="66" height="75" rx="15" fill="#fffef5" stroke="#d6dfd7" stroke-width="2"/><text x="33" y="54" text-anchor="middle" font-size="46" fill="#b48445" font-family="Andika">b</text></g><path d="m183 100 6-14m-28 15-12-6m334 33 9 10" stroke="#dab568" stroke-width="5" stroke-linecap="round"/></svg>`;
}
