# dancarter10.github.io

This repository builds the **Folio Reader** Android app and hosts the files Android needs to trust it.

- `twa-manifest.json`: the Android app's settings (name, icon, colours), and the setting that registers Folio Reader for PDF files.
- `generate-project.cjs`, `update-assetlinks.cjs`: small helper scripts the build uses.
- `.github/workflows/build-android.yml`: builds the app on GitHub's servers with Google's Bubblewrap tool. It runs by itself whenever the app's settings or the build files change. You can also run it from the **Actions** tab.
- `folio-reader.apk`: the finished app. The build adds it here, and it downloads from `https://dancarter10.github.io/folio-reader.apk`.
- `.well-known/assetlinks.json`: proves the app belongs to this website, so it opens full screen without a browser address bar. The build updates it.
- `index.html`: a small download page at `https://dancarter10.github.io/`.

The Android app shows the web app at `https://dancarter10.github.io/folio-reader/`. Updates to the web app reach the Android app straight away, with no rebuild needed.

**Rebuilding:** each build signs the app with a new key. If you ever rebuild it, uninstall the old app from your phone first, then install the new one.
