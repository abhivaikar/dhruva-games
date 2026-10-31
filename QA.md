# Verification — 31 October 2026

## Automated

`npm test`: 30 tests passed. Coverage includes:

- 6,000 original MRT questions and 9,000 new primary maths questions, with independently checked arithmetic and distinct-valued distractors.
- Three primary stages, including exact division, reduced fractions, integer-based decimal arithmetic, percentages, ratios and place value.
- All new quiz decks, full eight-round completion, retries, invalid choices, repeated taps and selection wrapping.
- The original complete 17-stop journey at all three MRT difficulty levels, plus train preferences and counting helpers.
- Singapore transport station neighbours in both directions, line identifiers and bus/rail distinctions.
- Non-repeating target countries, exactly one correct choice, and valid world-map outlines or Singapore locator support.
- All 20 local flag SVGs, their licence, and more than 150 map outlines.
- 500 generated pirate voyages: reachable, separated mission locations; shortest routes; mountain/edge handling; guarded map/key progression; one-time shell collection and turtle rescue; fog discovery and coordinate conversions.
- Local entry points, bounded completion badges and corrupt/blocked storage.

`npm run build`: passed. The static output is approximately 508 KB and includes all six offerings. No package installation or runtime framework is required. Local source syntax checks passed.

## Browser playthroughs

Checked in the Codex in-app browser at desktop 1280 × 900 and phone 390 × 844:

- Homepage: all six links, category filters, grown-up information dialog, and completed-game badges.
- World Explorer: all eight countries found, a wrong choice followed by retry, direct SVG marker interaction, and Space-key activation of a map marker.
- Flag Detective: all eight rounds, both “name the country” and “find the flag” modes, clues, arrow-key selection and Space confirmation. All eight collected flag images loaded.
- Transport Dispatcher: all eight missions, including actual station neighbours towards both termini, line-colour identification, destination direction and the road-bus question.
- Maths Workshop: full eight-question sessions at Primary 1–2, Primary 3–4 and Primary 5–6. This included number bonds, tens/ones, fractions on phones, decimals, percentages and ratio word problems.
- Treasure Trails now uses the Captain Dhruva pirate quest described below. Its previous four fixed-coordinate dig rounds have been replaced.
- The original MRT page remains accessible from its hub card, with its own settings and a return link.

## Additional small-screen and deployment checks

- At 320 × 568 the homepage retains all six cards with no horizontal overflow. Flag Detective also has no horizontal overflow, and its answer buttons measure 239 × 58 px.
- Treasure Trails at 320 × 568 keeps the coordinate clue, map, 60 × 44 px compass controls and 255 × 46 px Dig action in one play area. At 390 px the arrow buttons measure approximately 74 × 47 px and Dig measures 307 × 48 px. No horizontal overflow was observed.
- MRT Adventure’s hub link loads the preserved game at Punggol Coast. Answering its first question advances to Punggol with progress 1 of 17; its return link opens the hub.
- The built hub under `/dist/` exposes all six relative links. Its Flag Detective link opens `/dist/play.html?game=flags`, loads its local flag and presents working answer controls.
- The built MRT entry point also opens correctly from the hub. An unknown game identifier offers a working “See all games” return link.
- Final browser checks recorded no console warnings or errors. Sound was restored before handing back the hub.

All application URLs are relative and static.

## Brighter theme refresh

- Reworked the hub with a purple/yellow hero, original animated SVG artwork, numbered colour-coded cards, and clear Play actions. Added the shared dotted background and tactile controls to all six games.
- Rechecked the hub at 1280 × 900, 390 × 844 and 320 × 568. All six offerings, Maps filtering and the grown-up dialog work; no horizontal overflow was observed at 320 px.
- Checked the five new game entry screens and active rounds. Answered a maths question and collected the first treasure using phone movement controls. The original MRT All aboard action starts its journey.
- Re-ran all 28 tests and the static build. Browser checks recorded no warnings or errors. New floating hero illustrations are covered by the existing reduced-motion rule; the OS setting was not changed.

## Captain Dhruva & the Lost Sunstone

- Completed the three map-piece chapters, discovered the vault and opened its three shape locks in desktop and 320 px phone playthroughs. Wrong digs and wrong keys offer retries without losing progress.
- Tested destination tapping with animated walking, direct compass movement, keyboard arrows, Space digging, Enter key activation and the parrot’s highlighted route hint.
- Explored all 21 walkable squares in the phone browser, collected all five shells and rescued Tilly; the ending displayed both optional rewards. Revisited squares do not award duplicate collectibles (also covered by model tests).
- Replayed to a fresh generated voyage and checked 390 px controls. Clues remain spoken and visible. The final key sequence uses both shapes and names, so colour alone is not required.
- The captain, parrot, keys, map fragment and closed/open chest use original local SVG artwork. The static build includes the separate treasure stylesheet and modules.
- Reduced-motion CSS suppresses new ambient effects, and tap-to-walk skips its timed steps when the browser reports reduced motion. The operating system preference was not changed during QA.

## Limits

Physical iPhone/Android and desktop Safari sessions have not been tested. Browser voice quality and audible playback should be checked on the family’s devices. Missing speech APIs and blocked storage have automated fallback coverage; all prompts remain visible.

Reduced-motion CSS is implemented; the operating system’s motion preference was not changed during QA. The maths offering covers selected skills rather than an entire primary syllabus. Map outlines are generalised educational data; small locations use locator dots.

No successful GitHub Pages deployment has been verified. The repository is linked to `abhivaikar/dhruva-games`; enable GitHub Actions as the Pages source after pushing the game.

A play session with Dhruva is the best next check of reading load, voice, pace and difficulty.
