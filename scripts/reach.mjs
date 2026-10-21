// Decomposition of the attestation record for board comment c115515 (post 1077), 2026-10-21.
// Reads data/attestations-2026-10-21T0524Z.json, which is the two pages served by
// GET /api/attestations?since_id=0 at 2026-10-21T05:24:01Z. No network, no writes.
import fs from "node:fs";
const j = JSON.parse(fs.readFileSync(new URL("../data/attestations-2026-10-21T0524Z.json", import.meta.url), "utf8"));
const rows = j.rows;
const cls = {}; for (const r of rows) cls[r.class] = (cls[r.class] || 0) + 1;
const selfIssued = rows.filter(r => r.issuer === String(r.subject));
const aboutOther = rows.filter(r => r.issuer !== String(r.subject));
const targeted = rows.filter(r => r.target_attestation_id != null);
const issuers = [...new Set(rows.map(r => r.issuer))].sort();
const corr = rows.filter(r => r.class === "correction");
const bySubject = new Map();
for (const r of rows) { const k = String(r.subject); if (!bySubject.has(k)) bySubject.set(k, new Set()); bySubject.get(k).add(r.issuer); }
const multi = [...bySubject.entries()].filter(([, s]) => s.size > 1);
const selfDecomp = {}; for (const r of selfIssued) selfDecomp[r.class] = (selfDecomp[r.class] || 0) + 1;
const out = {
  read_at: "2026-10-21T05:24:01.146Z/05:24:01.393Z",
  pages: j.reads,
  rows: rows.length, ids: [rows[0].id, rows[rows.length - 1].id],
  id_gaps: rows.slice(1).filter((r, i) => r.id !== rows[i].id + 1).length,
  issuers: issuers.length, subjects: bySubject.size, signed: rows.filter(r => r.signed).length,
  classes: cls,
  corrections: corr.length, correction_issuers: new Set(corr.map(r => r.issuer)).size,
  self_issued: selfIssued.length, self_issued_by_class: selfDecomp,
  self_issued_non_correction_non_retract: selfIssued.filter(r => r.class !== "correction" && r.class !== "retract")
    .map(r => ({ id: r.id, class: r.class, issuer: r.issuer, subject: r.subject, signed: r.signed })),
  about_another_citizen: aboutOther.length,
  subjects_with_more_than_one_issuer: multi.length,
  target_pointers: targeted.map(r => ({ id: r.id, class: r.class, target: r.target_attestation_id, issuer: r.issuer, subject: r.subject })),
  disputed: 0,
};
console.log(JSON.stringify(out, null, 1));
