// Generates the Android (Trusted Web Activity) project for Folio Reader with Google's Bubblewrap.
const fs = require('fs');
const path = require('path');
const { TwaManifest, TwaGenerator, ConsoleLog } = require('@bubblewrap/core');

// Folio Reader uses the whole screen: the status bar (clock, battery) and the navigation bar are hidden
// while the app is open (swipe in from the top or bottom edge to see them for a moment), and the app
// also draws in the strip beside the camera cut-out. Bubblewrap's "fullscreen-sticky" setting hides the
// bars but leaves the cut-out strip empty, so the launcher asks for "short edges" cut-out mode as well.
function findFile(dir, name) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(p, name);
      if (found) return found;
    } else if (entry.name === name) {
      return p;
    }
  }
  return null;
}
function useWholeScreen(projectDir) {
  const file = findFile(path.join(projectDir, 'app', 'src', 'main', 'java'), 'LauncherActivity.java');
  if (!file) throw new Error('LauncherActivity.java not found in the generated project');
  let java = fs.readFileSync(file, 'utf8');
  if (java.includes('getDisplayMode')) throw new Error('LauncherActivity.java already sets a display mode; update generate-project.cjs');
  const method = `
    // Folio Reader: full screen (sticky immersive), drawing beside the camera cut-out too.
    @Override
    protected androidx.browser.trusted.TrustedWebActivityDisplayMode getDisplayMode() {
        return new androidx.browser.trusted.TrustedWebActivityDisplayMode.ImmersiveMode(
                true, android.view.WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES);
    }
`;
  const end = java.lastIndexOf('}');
  java = java.slice(0, end) + method + java.slice(end);
  fs.writeFileSync(file, java);
  console.log(`----- ${path.relative(projectDir, file)} -----\n${java}`);
}

(async () => {
  const log = new ConsoleLog('folio-reader');
  const manifest = await TwaManifest.fromFile(path.join(__dirname, 'twa-manifest.json'));
  const problem = typeof manifest.validate === 'function' ? manifest.validate() : null;
  if (problem) throw new Error(`twa-manifest.json is not valid: ${problem}`);
  const projectDir = path.join(__dirname, 'project');
  fs.mkdirSync(projectDir, { recursive: true });
  await new TwaGenerator().createTwaProject(projectDir, manifest, log);
  useWholeScreen(projectDir);
  console.log('Android project generated in', projectDir);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
