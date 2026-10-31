# Dhruva’s Discovery Club

A family website with six playful learning games. Built with static HTML, CSS, original SVG illustrations and browser JavaScript. No package installation, accounts, advertisements, analytics, or paid backend.

| Game | What children do |
| --- | --- |
| MRT Adventure | Ride with Pip from Punggol Coast to HarbourFront; count at all 17 stations and collect souvenirs. |
| Transport Dispatcher | Read real Singapore station sequences and destination displays, recognise MRT line colours, and distinguish buses from rail. |
| Maths Workshop | Solve eight selected primary maths puzzles to light up a rocket. Choose Primary 1–2, 3–4, or 5–6 practice. |
| World Explorer | Find eight countries on an actual world map using highlighted outlines, locator dots, and A/B/C controls. |
| Treasure Trails | Navigate a coordinate-grid island, follow compass directions, avoid mountains, and dig up four treasures. |
| Flag Detective | Match countries to flags and flags to countries, drawing from 20 locally bundled flag images. |

## Play locally

Requires Node.js 22 or later. No packages to install.

```sh
npm run dev
```

Open http://127.0.0.1:5173 and choose a game. The homepage filters games by Transport, Maths, Maps and Flags. Every game has an **All games** link.

The original game is now at `mrt-adventure.html`. Its 17-stop route, train colours, speech, tap-to-count objects, difficulty settings and automatic station progression remain available.

## Controls and pace

- Touch or click the large choices. New quiz games use **Next discovery** after a correct answer so the child controls the pace. Wrong answers invite another try.
- For quiz answers, **← / →** changes selection and **Space** confirms. Tab and Enter also work. World-map markers support Enter and Space.
- In Treasure Trails, tap adjacent map squares or use the compass buttons. Keyboard arrows also move the explorer; then use **Dig here**. On phones the clue, map, arrows and dig action share one play area.
- **Hear again** repeats a spoken prompt and enables sound if muted. **A little clue** provides an untimed hint. Browser speech availability and voice quality vary; all prompts are also visible.
- Club games share a locally saved sound preference and “Explored” badges. MRT Adventure keeps its existing sound, train-colour and difficulty preferences. Refresh starts a fresh session; completed badges remain when browser storage is available.
- Reduced-motion preferences suppress celebration motion. Sound starts after user interaction to respect browser autoplay rules.

## Primary maths practice

This is selected skill practice, not a complete syllabus course or assessment.

| Stage | Current skills |
| --- | --- |
| Primary 1–2 | Addition and subtraction within 20, missing number bonds, tens and ones up to 99. |
| Primary 3–4 | Multiplication tables 2–12, exact division, addition of same-denominator fractions with totals up to one. |
| Primary 5–6 | Familiar percentages, decimal addition and simple ratio word problems. |

Each session mixes activities. Distractors are distinct in value; equivalent fractions cannot appear as competing answers. Decimal questions calculate with integer units before formatting.

## Validate and build

```sh
npm test
npm run build
node scripts/serve.mjs --dist
```

The 28 automated tests cover 15,000 generated maths questions across both the MRT game and new primary practice, answer locking, retries, full progression, transport ordering, flag assets, map data, treasure reachability, keyboard selection and blocked storage.

The build copies the three HTML entry points and their local assets into `dist/`. Every link and import is relative, so GitHub Pages project subdirectories work without SPA routing or rewrites. Builds and tests do not need network access.

## GitHub Pages

The local repository is connected to [abhivaikar/dhruva-games](https://github.com/abhivaikar/dhruva-games). No public deployment has been made from this workspace.

1. Push the project to the repository’s `main` branch.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. The included `.github/workflows/pages.yml` tests, builds, and deploys on pushes to `main`; it can also be run manually.

No environment variables or backend are required. Other static hosts can serve the contents of `dist/` directly.

## Source layout

- `index.html`, `club.css`, `src/club/hub.js`: the game hub and category filters.
- `play.html`, `src/club/play.js`: new game presentation, touch/keyboard controls, voice, and celebrations.
- `src/club/catalog.js`: the six offerings and their navigation.
- `src/club/rounds.js`: guarded quiz sessions and answer selection.
- `src/club/decks.js`: transport, flag and world-map missions.
- `src/club/maths.js`: primary maths questions and exact answer formatting.
- `src/club/treasure.js`: coordinate navigation, obstacles and treasure progression.
- `src/club/data/`: country metadata and locally generated map outlines.
- `src/club/art.js`: original hub/game SVG illustrations.
- `src/club/progress.js`: validated, optional browser-local settings and completion badges.
- `mrt-adventure.html`, `styles.css`, and the original `src/` modules: Pip’s MRT journey.
- `assets/flags/`, `assets/map-source.json`: bundled educational assets and provenance.
- `tests/`: Node’s built-in test runner; no testing framework dependency.

## Maps, flags and transport data

World Explorer uses generalised Natural Earth country outlines and locator dots for small places, including Singapore. Flag Detective uses local SVGs from flag-icons. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for licences, sources and asset preparation instructions. No third-party application calls, fonts, or remote images are loaded during play.

The MRT route is:

NE18 Punggol Coast → NE17 Punggol → NE16 Sengkang → NE15 Buangkok → NE14 Hougang → NE13 Kovan → NE12 Serangoon → NE11 Woodleigh → NE10 Potong Pasir → NE9 Boon Keng → NE8 Farrer Park → NE7 Little India → NE6 Dhoby Ghaut → NE5 Clarke Quay → NE4 Chinatown → NE3 Outram Park → NE1 HarbourFront.

NE2 is not served. Station order follows [SBS Transit](https://www.sbstransit.com.sg/first-train-last-train). The colourful station scenes are imaginative postcards; the actual North East Line runs underground. Verify current operator/LTA data before adding routes or changing transport facts.

See [QA.md](QA.md) for verification and remaining device checks.
