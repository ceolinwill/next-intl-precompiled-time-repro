import { readFileSync } from "node:fs";

const messages = JSON.parse(readFileSync("messages/en.json", "utf8"));
const html = readFileSync(".next/server/app/index.html", "utf8");

// What the same messages render without `precompile`, via intl-messageformat's default formats.
const expected = {
  time: "2:30:00 PM",
  timeShort: "2:30 PM",
  timeMedium: "2:30:00 PM",
  date: "9/27/2026",
  dateShort: "9/27/26",
  dateMedium: "Sep 27, 2026",
};

let failed = 0;

for (const [, key, inner] of html.matchAll(/<li data-case="([^"]+)">(.*?)<\/li>/g)) {
  const rendered = inner.replace(/ /g, " ");
  const ok = rendered === expected[key];

  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${messages[key].padEnd(22)} -> ${JSON.stringify(rendered).padEnd(14)} expected ${JSON.stringify(expected[key])}`);
}

if (failed) {
  console.log(`\n${failed} of ${Object.keys(expected).length} messages rendered differently.`);
  process.exit(1);
}
