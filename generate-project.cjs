// Generates the Android (Trusted Web Activity) project for Folio Reader with Google's Bubblewrap.
const fs = require('fs');
const path = require('path');
const { TwaManifest, TwaGenerator, ConsoleLog } = require('@bubblewrap/core');

(async () => {
  const log = new ConsoleLog('folio-reader');
  const manifest = await TwaManifest.fromFile(path.join(__dirname, 'twa-manifest.json'));
  const problem = typeof manifest.validate === 'function' ? manifest.validate() : null;
  if (problem) throw new Error(`twa-manifest.json is not valid: ${problem}`);
  const projectDir = path.join(__dirname, 'project');
  fs.mkdirSync(projectDir, { recursive: true });
  await new TwaGenerator().createTwaProject(projectDir, manifest, log);
  console.log('Android project generated in', projectDir);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
