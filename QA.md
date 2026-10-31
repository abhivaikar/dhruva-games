# Verification — 31 October 2026

## Automated

`npm test`: 28 tests passed. Coverage includes:

- 6,000 original MRT questions and 9,000 new primary maths questions, with independently checked arithmetic and distinct-valued distractors.
- Three primary stages, including exact division, reduced fractions, integer-based decimal arithmetic, percentages, ratios and place value.
- All new quiz decks, full eight-round completion, retries, invalid choices, repeated taps and selection wrapping.
- The original complete 17-stop journey at all three MRT difficulty levels, plus train preferences and counting helpers.
- Singapore transport station neighbours in both directions, line identifiers and bus/rail distinctions.
- Non-repeating target countries, exactly one correct choice, and valid world-map outlines or Singapore locator support.
- All 20 local flag SVGs, their licence, and more than 150 map outlines.
- Reachability of all four island clues, mountain/edge handling, one-time collection, and coordinate conversions.
- Local entry points, bounded completion badges and corrupt/blocked storage.

`npm run build`: passed. The static output is approximately 460 KB and includes all six offerings. No package installation or runtime framework is required. Local source syntax checks passed.

## Browser playthroughs

Checked in the Codex in-app browser at desktop 1280 × 900 and phone 390 × 844:

- Homepage: all six links, category filters, grown-up information dialog, and completed-game badges.
- World Explorer: all eight countries found, a wrong choice followed by retry, direct SVG marker interaction, and Space-key activation of a map marker.
- Flag Detective: all eight rounds, both “name the country” and “find the flag” modes, clues, arrow-key selection and Space confirmation. All eight collected flag images loaded.
- Transport Dispatcher: all eight missions, including actual station neighbours towards both termini, line-colour identification, destination direction and the road-bus question.
- Maths Workshop: full eight-question sessions at Primary 1–2, Primary 3–4 and Primary 5–6. This included number bonds, tens/ones, fractions on phones, decimals, percentages and ratio word problems.
- Treasure Trails: collected C3, E5, B1 and D3; tested a premature dig, rejected a non-adjacent jump, and used keyboard and touch navigation. A phone layout revision brings the clue, grid, movement and dig controls together.
- The original MRT page remains accessible from its hub card, with its own settings and a return link.

## Additional small-screen and deployment checks

- At 320 × 568 the homepage retains all six cards with no horizontal overflow. Flag Detective also has no horizontal overflow, and its answer buttons measure 239 × 58 px.
- Treasure Trails keeps the grid, clue, compass controls and 255 × 52 px Dig action together at 320 px. The Dig action fits within the short viewport. A mountain collision leaves the player at B3; keyboard movement to C3 and Space digging finds the first treasure.
- MRT Adventure’s hub link loads the preserved game at Punggol Coast. Answering its first question advances to Punggol with progress 1 of 17; its return link opens the hub.
- The built hub under `/dist/` exposes all six relative links. Its Flag Detective link opens `/dist/play.html?game=flags`, loads its local flag and presents working answer controls.
- The built MRT entry point also opens correctly from the hub. An unknown game identifier offers a working “See all games” return link.
- Final browser checks recorded no console warnings or errors. Sound was restored before handing back the hub.

All application URLs are relative and static.

## Limits

Physical iPhone/Android and desktop Safari sessions have not been tested. Browser voice quality and audible playback should be checked on the family’s devices. Missing speech APIs and blocked storage have automated fallback coverage; all prompts remain visible.

Reduced-motion CSS is implemented; the operating system’s motion preference was not changed during QA. The maths offering covers selected skills rather than an entire primary syllabus. Map outlines are generalised educational data; small locations use locator dots.

GitHub Pages deployment has not been run. The repository is linked to `abhivaikar/dhruva-games`; enable GitHub Actions as the Pages source after pushing the game.

A play session with Dhruva is the best next check of reading load, voice, pace and difficulty.
