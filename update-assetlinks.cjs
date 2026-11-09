// Adds the app's signing fingerprint to .well-known/assetlinks.json (keeps any existing entries).
const fs = require('fs');
const path = require('path');

const fingerprint = (process.argv[2] || '').trim().toUpperCase();
if (!/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(fingerprint)) {
  console.error(`Not a SHA-256 fingerprint: "${fingerprint}"`);
  process.exit(1);
}
const packageName = JSON.parse(fs.readFileSync(path.join(__dirname, 'twa-manifest.json'), 'utf8')).packageId;
const file = path.join(__dirname, '.well-known', 'assetlinks.json');
let links = [];
try { links = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { links = []; }
if (!Array.isArray(links)) links = [];
let entry = links.find((l) => l.target && l.target.namespace === 'android_app' && l.target.package_name === packageName);
if (!entry) {
  entry = {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: packageName, sha256_cert_fingerprints: [] },
  };
  links.push(entry);
}
const prints = entry.target.sha256_cert_fingerprints;
if (!prints.includes(fingerprint)) prints.push(fingerprint);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, `${JSON.stringify(links, null, 2)}\n`);
console.log(`assetlinks.json now lists ${prints.length} fingerprint(s) for ${packageName}`);
