# First Line

A Chrome extension that opens every new tab with the first sentence of a great book.

## Structure

```
src/
  manifest.json        Manifest V3
  newtab.html          new tab page
  newtab.css           styles + self-hosted @font-face
  newtab.js            vanilla JS, ~30 lines
  firstLines.json      the quote data (single source of truth)
  assets/              font, paper background, icons, font licence
```

`src/` is the extension root. Load that directory, or zip its contents for the Web Store.

## Rebuild notes (2026)

Rebuilt from the ground up for Manifest V3, ahead of Chrome removing MV2 in August 2026.
The original 2014 build has been retired.

What changed from the original:

- **Manifest V3.** `manifest_version: 3`, CSP as an object (`script-src 'self'`),
  no permissions.
- **Hybrid data.** A baseline `firstLines.json` ships inside the package (instant
  first paint, works offline). On load the extension also fetches the live list from
  this repo via jsDelivr and caches it in `localStorage`, refreshing at most once a
  day in the background. New lines can be added by committing to `master` — no store
  release needed. jsDelivr serves `access-control-allow-origin: *`, so this needs no
  `host_permissions` and adds no install warning. The old build fetched from an S3
  bucket over HTTP on every tab; this never blocks the render path.
- **No jQuery.** Replaced with vanilla JS.
- **No analytics.** The old Google Analytics (`ga.js`) was dead anyway — Universal
  Analytics shut down in 2023. Active-user and rating stats come from the Web Store
  dashboard. The extension now makes zero network requests.
- **Self-hosted font.** Special Elite ships as local woff2 (latin + latin-ext subsets)
  instead of a Google Fonts CDN link. Licensed under Apache 2.0 (see
  `src/assets/SpecialElite-LICENSE.txt`).
- **No repeat.** Consecutive new tabs no longer show the same line back-to-back.

The feedback form link ("Missing your favourite?") is preserved so suggestions keep
coming in.

## Features

- **Spoiler reveal.** The first line always shows clear. The title and author are
  blurred by default and clear as the cursor nears the signature — a quiet guess-the-book
  toy you can stumble on or ignore. No scores, no state.
- **OpenLibrary link.** The title links to an OpenLibrary search (non-commercial,
  Internet Archive), built on the fly from title + author. Styled as plain text; only
  the hover cursor hints it is clickable.
- **No repeat.** Consecutive new tabs never show the same line back-to-back.

## Develop

Load unpacked: `chrome://extensions` → enable Developer mode → Load unpacked → select `src/`.

## Package for the Web Store

Zip the *contents* of `src/` (not the folder itself) and upload to the developer
dashboard. Bump `version` in `manifest.json` first.

## Data

`src/firstLines.json` is an array of `{ author, book, year, firstline }`. `year` may be
`null`. New suggestions arrive via the Google Form and are curated in before a release.
