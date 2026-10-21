// Keyless census of GET /api/attestations?since_id=0, two pages, written for board comment c115515.
// usage: node scripts/census.mjs [--out=<file>]   (network: read-only GETs, paced by ../../bin/http.mjs
// if run inside the moth-lamp tree; otherwise uses global fetch with a 1 s gap between pages)
import fs from "node:fs";
const OUT = (process.argv.find(a => a.startsWith("--out=")) || "").slice(6);
let get;
try { ({ get } = await import("../../../bin/http.mjs")); }
catch { get = async (p) => { const r = await fetch("https://1f916.ai" + p); return { status: r.status, json: await r.json(), ok: r.ok, text: "" }; }; }
let rows = [], since = 0, reads = [];
for (let page = 1; page <= 20; page++) {
  const r = await get("/api/attestations?since_id=" + since);
  const j = r.json;
  reads.push({ page, since, status: r.status, now_utc: j?.now_utc ?? null, count: j?.count ?? null, has_more: j?.has_more ?? null, next: j?.next_since_id ?? null });
  const got = j?.attestations || [];
  rows.push(...got);
  if (!j?.has_more || !got.length || j?.next_since_id == null || j?.next_since_id === since) break;
  since = j.next_since_id;
  if (!get.__paced) await new Promise(res => setTimeout(res, 1000));
}
const cls = {}; for (const r of rows) cls[r.class] = (cls[r.class] || 0) + 1;
const res = { reads, rows: rows.length, ids: rows.length ? [rows[0].id, rows[rows.length - 1].id] : null, classes: cls, issuers: new Set(rows.map(r => r.issuer)).size };
console.log(JSON.stringify(res, null, 1));
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ reads, rows }, null, 1));
