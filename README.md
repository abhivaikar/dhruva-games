# Dhruva’s Discovery Club

A family website with nine playful learning games. Built with static HTML, CSS, original SVG illustrations and browser JavaScript. No package installation, accounts, advertisements, analytics, or paid backend.

| Game | What children do |
| --- | --- |
| MRT Adventure | Ride with Pip from Punggol Coast to HarbourFront; count at all 17 stations and collect souvenirs. |
| Transport Dispatcher | Read real Singapore station sequences and destination displays, recognise MRT line colours, and distinguish buses from rail. |
| Maths Workshop | Solve eight selected primary maths puzzles to light up a rocket. Choose Primary 1–2, 3–4, or 5–6 practice. |
| World Explorer | Find eight countries on an actual world map using highlighted outlines, locator dots, and A/B/C controls. |
| Treasure Trails | Become Captain Dhruva: explore a misty island, find three map pieces and shape keys, collect shells, rescue Tilly and unlock the lost Sunstone. |
| Flag Detective | Match countries to flags and flags to countries, drawing from 20 locally bundled flag images. |
| Colouring Studio | Choose from 36 original pictures, paint with fills, freehand brushes and stamps, then save, download or print. |
| Mystery Dot-to-Dot | Explore 108 challenges: 36 surprise pictures with 10, 15 or 20 dots, then colour the picture revealed. |
| Picture Puzzle Factory | Assemble 144 picture/size combinations with 4, 6, 9 or 12 pieces, plus puzzles made from saved artwork. |

## Play locally

Requires Node.js 22 or later. No packages to install.

```sh
npm run dev
```

Open http://127.0.0.1:5173 and choose a game. The homepage filters games by Transport, Maths, Maps, Flags and Activity Book. Every game has an **All games** link.

The original game is now at `mrt-adventure.html`. Its 17-stop route, train colours, speech, tap-to-count objects, difficulty settings and automatic station progression remain available.

## Controls and pace

- Touch or click the large choices. New quiz games use **Next discovery** after a correct answer so the child controls the pace. Wrong answers invite another try.
- For quiz answers, **← / →** changes selection and **Space** confirms. Tab and Enter also work. World-map markers support Enter and Space.
- In Treasure Trails, tap any walkable map square to have Captain Dhruva follow a path there, or use compass buttons / keyboard arrows one step at a time. Match the coordinate clue and **Dig for treasure**. **Parrot, help!** highlights one useful step. Collect three map pieces and shape keys, then match the shuffled key order to open the Sunstone vault. Five sparkle shells and Tilly’s rescue are optional discoveries. Every replay shuffles the hiding places.
- **Hear again** repeats a spoken prompt and enables sound if muted. **A little clue** provides an untimed hint. Browser speech availability and voice quality vary; all prompts are also visible.
- **Voice** in the header opens a narrator preview shared by all games. The automatic choice prefers natural/enhanced voices, then familiar narrators such as Samantha, and excludes robotic novelty voices. Choose a different voice and a natural or gentler pace; the browser remembers the choice. Previews work even when game sounds are muted and do not turn game sound back on. Available voices and their quality depend on the device/browser; the website does not bundle studio narration.
- Club games share a locally saved sound preference and “Explored” badges. MRT Adventure keeps its existing sound, train-colour and difficulty preferences. Quiz and treasure refreshes start fresh sessions. Colouring resumes its matching saved page or draft; completed badges remain when browser storage is available.
- Reduced-motion preferences suppress celebration motion. Sound starts after user interaction to respect browser autoplay rules.

## Creative activity book

Each activity offers 36 distinct SVG pictures across six worlds. These are individual drawings and silhouettes, rather than colour variants of the same templates.

| World | Six pictures |
| --- | --- |
| On the move | Train, double-decker bus, aeroplane, helicopter, sailboat, excavator |
| Animal friends | Dinosaur, cat, owl, elephant, lion, penguin |
| Under the sea | Turtle, whale, octopus, crab, seahorse, jellyfish |
| In the garden | Butterfly, bee, ladybird, sunflower, snail, apple tree |
| Space & make-believe | Rocket, robot, flying saucer, castle, dragon, astronaut |
| Happy days | Ice cream, cupcake, hot-air balloon, kite, cosy house, treasure chest |

Colouring and puzzle pickers have theme filters, name search and pages of 12 previews. The puzzle picker also has a **My artwork** filter for saved drawings. Existing saved pictures retain their original region IDs and colours.

- Colouring: choose a colour and tap a shape with **Fill**. Use **Brush** for freehand strokes, or tap to add star, heart and flower stamps. Undo/redo applies to fills, brushwork, stamps and clearing. Keyboard users can fill focused shapes with Enter; in Brush/Stamp mode arrows move a drawing cursor, Enter adds a mark, and Shift+arrows draw a line.
- Colouring drafts persist after each change. Changing pictures or leaving an edited page also keeps its work in the activity book when storage is available. **Save in my book** explicitly saves or updates the current page.
- Dot-to-dot: choose a world (or all pictures), select 10, 15 or 20 dots and connect them in order. Each world uses a shuffled deck so every picture appears before repeats within that world during a visit. A hint highlights the next dot. The revealed picture links directly to its colouring page.
- Puzzles: select a picture and 4, 6, 9 or 12 pieces. Drag a piece to its matching space, or tap a piece and then a space. Tab/Enter supports the same interaction. **Show the picture** provides an optional guide.
- **My book** keeps up to 18 pages in this browser. Saved artwork appears in the puzzle picker. Pages can be edited, downloaded as 1200 × 880 PNGs, or printed one per sheet. Removal offers Undo. Browser storage availability and capacity determine whether saves succeed; failures are shown without silently discarding existing pages.
- **Print** opens the browser’s print dialog. Page size, printer margins and final print output should be checked on the family’s printer.

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

The 43 automated tests cover 15,000 generated maths questions across both the MRT game and new primary practice, answer locking, retries, full progression, transport ordering, flag assets, map data, 500 generated pirate voyages, island reachability, one-time collectibles, key-lock progression, keyboard selection, drawing undo/redo, dot ordering, jigsaw seams/progression, draft recovery, gallery updates and blocked storage.

The build copies the four HTML entry points and their local assets into `dist/`. Every link and import is relative, so GitHub Pages project subdirectories work without SPA routing or rewrites. Builds and tests do not need network access.

## GitHub Pages

The local repository is connected to [abhivaikar/dhruva-games](https://github.com/abhivaikar/dhruva-games). GitHub Pages is configured to deploy through GitHub Actions at [abhivaikar.github.io/dhruva-games](https://abhivaikar.github.io/dhruva-games/).

1. Push the project to the repository’s `main` branch.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. The included `.github/workflows/pages.yml` tests, builds, and deploys on pushes to `main`; it can also be run manually.

No environment variables or backend are required. Other static hosts can serve the contents of `dist/` directly.

## Source layout

- `index.html`, `club.css`, `src/club/hub.js`: the game hub and category filters.
- `play.html`, `src/club/play.js`: new game presentation, touch/keyboard controls, voice, and celebrations.
- `activity.html`, `activity.css`, `src/club/activity.js`: the three creative games, gallery, pointer controls, PNG export and print layouts.
- `src/club/activity-scenes.js`, `src/club/activity-extra-scenes.js`, `src/club/activity-card-art.js`: original colourable scenes, silhouettes and card illustrations.
- `src/club/activity-library.js`, `src/club/activity-picker.js`: themes, searchable/paginated picture libraries and shuffled mystery decks.
- `src/club/activity-model.js`: drawing history, numbered-dot progression and jigsaw geometry/matching.
- `src/club/activity-book.js`: validated browser-local gallery, drafts and restoration.
- `src/club/catalog.js`: the nine offerings and their navigation.
- `src/club/rounds.js`: guarded quiz sessions and answer selection.
- `src/club/decks.js`: transport, flag and world-map missions.
- `src/club/maths.js`: primary maths questions and exact answer formatting.
- `src/club/treasure.js`: generated pirate voyages, shortest paths, fog discovery, optional collectibles and the guarded key-lock state machine.
- `src/club/treasure-view.js`, `src/club/treasure-art.js`, `treasure.css`: pirate quest screens, original captain/parrot/key/chest SVG artwork, and responsive game styling.
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
