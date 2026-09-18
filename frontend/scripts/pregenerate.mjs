// Pre-generate every scene image + emaki panel that is not yet cached.
// Usage: node scripts/pregenerate.mjs            (queue + poll until done)
//        node scripts/pregenerate.mjs --status   (just print status)
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const API = env.match(/REACT_APP_BACKEND_URL=(\S+)/)[1] + "/api";

const tmp = mkdtempSync(join(tmpdir(), "inga-"));
const src = readFileSync(new URL("../src/game/storyData.js", import.meta.url), "utf8");
writeFileSync(join(tmp, "storyData.mjs"), src);
const { allImageJobs } = await import(join(tmp, "storyData.mjs"));

async function status() {
  const r = await fetch(`${API}/scene/pregenerate/status`);
  return r.json();
}

const jobs = allImageJobs();
let s = await status();
const missing = jobs.filter((j) => !s.cached_ids.includes(j.scene_id));
console.log(`${jobs.length} images total, ${s.cached_ids.length} cached, ${missing.length} missing`);
if (process.argv.includes("--status") || missing.length === 0) {
  console.log(s);
  process.exit(0);
}

const q = await fetch(`${API}/scene/pregenerate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ items: missing }),
});
console.log("queue:", q.status, await q.text());

for (;;) {
  await new Promise((r) => setTimeout(r, 8000));
  s = await status();
  console.log(`done ${s.done} · skipped ${s.skipped} · failed ${s.failed.length} / ${s.total}${s.running ? "" : " · finished"}`);
  if (!s.running) {
    if (s.failed.length) console.log("failed:", s.failed, "\nlast error:", s.last_error);
    break;
  }
}
