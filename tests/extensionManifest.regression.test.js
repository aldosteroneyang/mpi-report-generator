const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'extension-manifest.json'), 'utf8'));

const mpiReport = manifest.reports.find(report => report.mciid === '9310308');
assert.ok(mpiReport, 'MPI report manifest entry should exist');

const areaMap = Object.fromEntries(mpiReport.areas.map(area => [area.key, {
  webnmId: area.webnmId,
  read: area.read,
  write: area.write
}]));

assert.deepEqual(areaMap, {
  IO: { webnmId: 'keyword', read: true, write: false },
  ClinicalHistory: { webnmId: 'area_118', read: true, write: false },
  Procedure: { webnmId: 'area_119', read: true, write: true },
  Findings: { webnmId: 'area_120', read: true, write: true },
  Impression: { webnmId: 'area_121', read: true, write: true },
  Addendum: { webnmId: 'area_440', read: true, write: true }
});

console.log('extension manifest regression tests passed');
