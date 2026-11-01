# Dhruva’s Discovery Club

A family website with eleven playful learning games. Built with static HTML, CSS, original SVG illustrations, bundled language audio and browser JavaScript. No package installation, accounts, advertisements, analytics, or paid backend.

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
| Pip’s Chinese Adventure | Explore Mandarin through 84 words, 40 useful phrases, listening missions, speaking turns and optional reading/sentence puzzles. |
| Pip’s Marathi Adventure | Learn everyday Marathi with 84 words, 40 phrases, picture-led listening, speaking practice and Devanagari reading puzzles. |

## Play locally

Requires Node.js 22 or later. No packages to install.

```sh
npm run dev
```

Open http://127.0.0.1:5173 and choose a game. The homepage filters games by Transport, Maths, Maps, Flags, Creative games and Languages. Every game has an **All games** link.

The original game is now at `mrt-adventure.html`. Its 17-stop route, train colours, speech, tap-to-count objects, difficulty settings and automatic station progression remain available.

## Quick play and less scrolling

The home screen presents compact game tiles and remembers the chosen category for the current browser visit. A tile opens an actual game immediately, using its starting difficulty or saved MRT preferences. Maths level and language activity/world selectors live inside play. Choosing a puzzle picture starts it directly; piece and dot counts can be changed beside the board. MRT settings apply a chosen level or train colour immediately.

Desktop layouts put painting tools beside the picture. Phone layouts keep the useful illustration, answers, puzzle tray and recovery controls close together. Workspaces are brought into view only when necessary; subsequent turns stay in the play area. Saved art and completion screens wait for an explicit choice of what to do next.

Automatic feedback pauses in hidden tabs and open dialogs. Restart, mode changes and sentence undo/reset cancel stale transitions. Only feedback advances; unanswered questions, drawing, dot connections, puzzle placement and self-reported speaking turns remain child-controlled. New language words still have a picture-and-audio introduction before their matching challenge, which opens automatically after the clip is heard. Missing audio keeps the listening gate locked and offers replay.

## Controls and pace

- Touch or click the large choices. Correct quiz answers, completed language turns and treasure discoveries move on automatically after a short celebration. Feedback waits for audio; **Pause** keeps the current card until **Continue** is chosen. Questions and creative play have no deadlines. Wrong answers wait for another try.
- For quiz answers, **← / →** changes selection and **Space** confirms. Tab and Enter also work. World-map markers support Enter and Space.
- In Treasure Trails, tap any walkable map square to have Captain Dhruva follow a path there, or use compass buttons / keyboard arrows one step at a time. Match the coordinate clue and **Dig for treasure**. **Parrot, help!** highlights one useful step. Collect three map pieces and shape keys, then match the shuffled key order to open the Sunstone vault. Five sparkle shells and Tilly’s rescue are optional discoveries. Every replay shuffles the hiding places.
- **Hear again** repeats a spoken prompt and enables sound if muted. **A little clue** provides an untimed hint. Browser speech availability and voice quality vary; all prompts are also visible.
- **Voice** in the header opens a narrator preview shared by all games. Google US English (en-US) is the default narrator. If it is unavailable, the automatic choice prefers natural/enhanced English voices and excludes novelty voices. Choose a different voice and a natural or gentler pace; the browser remembers the choice. Previews work even when game sounds are muted and do not turn game sound back on. Available voices and their quality depend on the device/browser; the website does not bundle studio narration.
- Club games share a locally saved sound preference and “Explored” badges. MRT Adventure keeps its existing sound, train-colour and difficulty preferences. Quiz and treasure refreshes start fresh sessions. Colouring resumes its current draft; completed badges remain when browser storage is available.
- Reduced-motion preferences suppress celebration motion. Sound starts after user interaction to respect browser autoplay rules.

## Creative games

Each activity offers 36 distinct SVG pictures across six worlds. These are individual drawings and silhouettes, rather than colour variants of the same templates.

| World | Six pictures |
| --- | --- |
| On the move | Train, double-decker bus, aeroplane, helicopter, sailboat, excavator |
| Animal friends | Dinosaur, cat, owl, elephant, lion, penguin |
| Under the sea | Turtle, whale, octopus, crab, seahorse, jellyfish |
| In the garden | Butterfly, bee, ladybird, sunflower, snail, apple tree |
| Space & make-believe | Rocket, robot, flying saucer, castle, dragon, astronaut |
| Happy days | Ice cream, cupcake, hot-air balloon, kite, cosy house, treasure chest |

Colouring and puzzle pickers have theme filters, name search and pages of 12 previews.

- Colouring: choose a colour and tap a shape with **Fill**. Use **Brush** for freehand strokes, or tap to add star, heart and flower stamps. Undo/redo applies to fills, brushwork, stamps and clearing. Keyboard users can fill focused shapes with Enter; in Brush/Stamp mode arrows move a drawing cursor, Enter adds a mark, and Shift+arrows draw a line.
- The current colouring page resumes after a refresh when browser storage is available. There is no saved artwork collection. Download the current picture as a 1200 × 880 PNG or print it to keep a copy; choosing another picture starts a fresh page.
- Dot-to-dot: choose a world (or all pictures), select 10, 15 or 20 dots and connect them in order. Each world uses a shuffled deck so every picture appears before repeats within that world during a visit. A hint highlights the next dot. Join every number and tap 1 again to close the outline. All three dot counts preserve every bend of the authored contour; interior picture details are preprinted clues. The finished drawing stays on the same board, with optional colouring or another picture. Blank-space taps and held keys cannot advance it.
- Puzzles: select a picture and 4, 6, 9 or 12 pieces. Drag a piece to its matching space, or tap a piece and then a space. Tab/Enter supports the same interaction. **Show the picture** provides an optional guide.

- **Print** opens the browser’s print dialog. Page size, printer margins and final print output should be checked on the family’s printer.

### Undo and starting over

- Picture puzzles and dot-to-dot have **Undo**, **Redo** and **Reset picture**, including on completion screens. Reset keeps the same picture, difficulty and original tray order; Undo can restore a reset. Incorrect guesses and hints do not create extra undo steps.
- Colouring has a labelled **Reset page** alongside its existing undo/redo tools. Reset starts a fresh draft and leaves saved book pages intact. Undo restores the colours; empty reset drafts are not automatically added to the book.
- Chinese and Marathi sentence puzzles have **Reset sentence** and **Take back a word**, even after solving. Re-solving a recovered sentence does not count the same practice twice within an adventure.
- Maths, flags, world maps, Singapore transport, treasure voyages and both language games offer **Restart adventure** during play. The MRT train has **Restart journey**. A **Keep playing / Start again** dialog prevents an accidental restart. Restarts retain the selected level and original challenge set (or treasure island); the train returns to Punggol Coast. Saved achievements, language passports, artwork and preferences stay intact. Train timers and treasure walking stop safely while the dialog is open.

## Chinese and Marathi adventures

Two dedicated games live at `language.html?lang=chinese` and `language.html?lang=marathi`. Both begin with K1-friendly picture-led activities; word recognition, optional sound guides and hideable sentence models provide reading challenges.

- Each language has **84 words, 40 original everyday phrases and 10 worlds**: transport, people, animals, food, home, creative/school objects, body/feelings, outdoors, colours and numbers.
- **Listen & find:** unfamiliar words are introduced with their picture, written form and audio before a three-picture matching question. Six different targets per adventure. Hearing the target is required before answering; gentle retries do not cost lives.
- **Word detective:** match pictures to written words. Audio is available as help; it does not automatically reveal each new reading question.
- **My speaking turn:** three everyday model phrases, slow replay and an explicit “I tried saying it” acknowledgement. Optional local record/replay is available where supported; it rewards trying, without pronunciation grading. Single phrases can also be practised directly from the phrase book.
- **Sentence puzzles:** three phrases assembled from whole word/phrase tiles. Models can be hidden for a challenge, and undo is available. Marathi vowel signs stay with their words; Chinese word groups are authored rather than split into arbitrary characters.
- **My word book / Everyday phrases:** searchable, themed libraries with pages of 12. Chinese has tone-marked Pinyin; Marathi’s optional Roman guide is an informal aid. Several familiar picture words link to their existing colouring templates.
- Each game has its own passport, separating listening matches, written-word matches, speaking attempts and sentence puzzles. Counts are practice records, not proficiency scores. Progress and help preferences stay in the browser, with safe handling when storage is unavailable.
- **Help me play** speaks the current activity's instructions using the shared English guide voice. Mandarin/Marathi word and phrase playback remains separate.

All **248 learning clips** are bundled MP3s, generated in the appropriate Mandarin or Marathi language with gTTS. No speech service is called while playing. Slower playback preserves pitch. If a clip cannot load, a matching language voice may be used; English/Hindi are never substituted for Marathi, and Cantonese is not substituted for Mandarin. Missing audio leaves listening questions locked and offers retry or the word book. The shared **Voice** picker changes the English guide, not the bundled language voice.

Practice recordings are optional, limited to 15 seconds and held only in memory. They are cleared on activity changes, page exit or hiding the page. Tracks are stopped and playback URLs revoked. Games work without microphone permission. Automated tests exercise recording lifecycle with a simulated microphone; no real child's recording was captured during verification.

Material is original beginner practice, not a complete Singapore Chinese syllabus or Marathi course. Chinese uses simplified characters. Standalone Marathi colour words can change endings in sentences. Learning-content and audio provenance are documented in `assets/languages/README.md`; future stories and expanded reading pathways remain in `LANGUAGE-GAMES-PLAN.md`.

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

The automated tests cover 15,000 generated maths questions across both the MRT game and new primary practice, answer locking, retries, full progression, transport ordering, flag assets, map data, 500 generated pirate voyages, island reachability, one-time collectibles, key-lock progression, keyboard selection, drawing undo/redo, dot ordering, jigsaw seams/progression, draft recovery, blocked storage and the automatic-transition clock (delay, pause/resume, multiple blockers, audio waiting and stale callback cancellation).

The build copies the five HTML entry points and their local assets into `dist/`. Every link and import is relative, so GitHub Pages project subdirectories work without SPA routing or rewrites. Builds and tests do not need network access. Published stylesheets, entry scripts and every dependency import share a content-based release version so browsers load compatible files after updates.

## GitHub Pages

The local repository is connected to [abhivaikar/dhruva-games](https://github.com/abhivaikar/dhruva-games). GitHub Pages is configured to deploy through GitHub Actions at [abhivaikar.github.io/dhruva-games](https://abhivaikar.github.io/dhruva-games/).

1. Push the project to the repository’s `main` branch.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. The included `.github/workflows/pages.yml` tests, builds, and deploys on pushes to `main`; it can also be run manually.

No environment variables or backend are required. Other static hosts can serve the contents of `dist/` directly.

## Source layout

- `index.html`, `club.css`, `src/club/hub.js`: the game hub and category filters.
- `play.html`, `src/club/play.js`: new game presentation, touch/keyboard controls, voice, and celebrations.
- `activity.html`, `activity.css`, `src/club/activity.js`: the three creative games, pointer controls, PNG export and print layouts.
- `src/club/activity-scenes.js`, `src/club/activity-extra-scenes.js`, `src/club/activity-card-art.js`: original colourable scenes, silhouettes and card illustrations.
- `src/club/activity-library.js`, `src/club/activity-picker.js`: themes, searchable/paginated picture libraries and shuffled mystery decks.
- `src/club/activity-model.js`: drawing history, contour-preserving dot routes, explicit outline closure and jigsaw geometry/matching.
- `src/club/dot-view.js`: printed picture details, number placement and the persistent dot drawing board.
- `src/club/colouring-draft.js`: validated recovery of the current colouring page after refresh.
- `src/club/catalog.js`: the eleven offerings and their navigation.
- `language.html`, `language.css`, `src/club/language.js`: the two language games and their four activities, libraries and passports.
- `src/club/language-data.js`, `language-model.js`, `language-art.js`: original vocabulary/phrases, guarded rounds, sentence tiles, progress and illustrations.
- `src/club/language-audio.js`, `language-recording.js`, `assets/languages/`: bundled learning audio, language-specific fallback and optional in-memory speaking recordings.
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
