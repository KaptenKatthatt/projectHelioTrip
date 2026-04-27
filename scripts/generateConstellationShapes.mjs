/**
 * IAU/Stellarium western constellationship → TS för constellationShapes.
 * Hämtar RArad/DErad (deg) från VizieR I/311/hip2.
 * Kör: node scripts/generateConstellationShapes.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const idMap = {
  And: "andromeda",
  Aqr: "aquarius",
  CMa: "canisMajor",
  Cas: "cassiopeia",
  Lyr: "lyra",
  Cyg: "cygnus",
  Gem: "gemini",
  Leo: "leo",
  Ori: "orion",
  Peg: "pegasus",
  Sgr: "sagittarius",
  Sco: "scorpius",
  Tau: "taurus",
  UMa: "ursaMajor",
  UMi: "ursaMinor",
};

function parseFab(text) {
  const out = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const parts = t.split(/\s+/);
    const abbr = parts[0];
    const nSeg = +parts[1];
    const nums = parts.slice(2).map(Number);
    if (nums.length !== nSeg * 2) {
      throw new Error(`Bad line for ${abbr}: expected ${nSeg * 2} numbers, got ${nums.length}`);
    }
    const segments = [];
    for (let i = 0; i < nSeg; i++) {
      segments.push([nums[i * 2], nums[i * 2 + 1]]);
    }
    out.push({ abbr, segments });
  }
  return out;
}

function parseVotableRow(xml) {
  const m = xml.match(
    /<TR><TD>(\d+)<\/TD><TD>([+-]?[0-9.]+)<\/TD><TD>([+-]?[0-9.]+)<\/TD>/,
  );
  if (!m) {
    if (xml.includes("INFO") && xml.includes("Error")) {
      const em = xml.match(/value="([^"]*)"/);
      throw new Error(`VizieR error: ${em?.[1] ?? xml.slice(0, 200)}`);
    }
    throw new Error(`Unparseable VOTable: ${xml.slice(0, 500)}`);
  }
  return { hip: +m[1], raDeg: +m[2], deDeg: +m[3] };
}

async function fetchHip(hip) {
  const url = new URL("https://vizier.cds.unistra.fr/viz-bin/votable");
  url.searchParams.set("-source", "I/311/hip2");
  url.searchParams.set("-out", "HIP,RArad,DErad");
  url.searchParams.set("HIP", String(hip));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`VizieR HTTP ${res.status} for ${hip}`);
  return parseVotableRow(await res.text());
}

function raHours(raDeg) {
  return raDeg / 15;
}

function hipToStarId(hip) {
  return `hip${hip}`;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    for (;;) {
      const j = i++;
      if (j >= items.length) return;
      out[j] = await fn(items[j], j);
    }
  }
  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);
  return out;
}

const fab = readFileSync(join(__dirname, "constellationship-iau-western.fab"), "utf8");
const blocks = parseFab(fab);
const allHips = new Set();
for (const b of blocks) {
  for (const [a, c] of b.segments) {
    allHips.add(a);
    allHips.add(c);
  }
}

const hipList = [...allHips].sort((a, b) => a - b);
console.error(`Fetching ${hipList.length} stars from VizieR I/311/hip2 (parallel)…`);
const results = await mapLimit(hipList, 24, (hip) => fetchHip(hip));
const coordMap = new Map();
for (const r of results) {
  coordMap.set(r.hip, { raHours: raHours(r.raDeg), deDeg: r.deDeg });
}

let ts = "";
for (const b of blocks) {
  const key = idMap[b.abbr];
  if (!key) throw new Error(`No id for ${b.abbr}`);
  const starHips = new Set();
  for (const [a, c] of b.segments) {
    starHips.add(a);
    starHips.add(c);
  }
  const starLines = [...starHips]
    .sort((x, y) => x - y)
    .map((hip) => {
      const c = coordMap.get(hip);
      if (!c) throw new Error(`No coord for ${hip}`);
      const id = hipToStarId(hip);
      return `      { id: '${id}', rightAscensionHours: ${c.raHours.toFixed(5)}, declinationDeg: ${c.deDeg.toFixed(2)} }`;
    });
  const segLines = b.segments.map(([a, c]) => {
    return `      ['${hipToStarId(a)}', '${hipToStarId(c)}']`;
  });
  ts += `  ${key}: {\n`;
  ts += `    stars: [\n${starLines.join(",\n")},\n    ],\n`;
  ts += `    segments: [\n${segLines.join(",\n")},\n    ],\n`;
  ts += `  },\n`;
}

process.stdout.write(ts);
console.error("Done. Paste into src/lib/constellationShapes.ts");
