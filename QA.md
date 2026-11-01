# Verification — 1 November 2026

## Automated

`npm test`: 43 tests passed. Coverage includes:

- 6,000 original MRT questions and 9,000 new primary maths questions, with independently checked arithmetic and distinct-valued distractors.
- Three primary stages, including exact division, reduced fractions, integer-based decimal arithmetic, percentages, ratios and place value.
- All new quiz decks, full eight-round completion, retries, invalid choices, repeated taps and selection wrapping.
- The original complete 17-stop journey at all three MRT difficulty levels, plus train preferences and counting helpers.
- Singapore transport station neighbours in both directions, line identifiers and bus/rail distinctions.
- Non-repeating target countries, exactly one correct choice, and valid world-map outlines or Singapore locator support.
- All 20 local flag SVGs, their licence, and more than 150 map outlines.
- 500 generated pirate voyages: reachable, separated mission locations; shortest routes; mountain/edge handling; guarded map/key progression; one-time shell collection and turtle rescue; fog discovery and coordinate conversions.
- Local entry points, bounded completion badges and corrupt/blocked storage.
- Drawing region/colour validation, brush and stamp bounds, undo/redo and clear recovery.
- All six original activity scenes at 10/15/20 dots, ordered connection and completion guards.
- Interlocking puzzle seams, flat outer borders and guarded placement at 4/6/9/12 pieces.
- Browser-local gallery updates, full/blocked storage, removal/restoration, matching draft recovery and artwork preservation when reused as a puzzle.

`npm run build`: passed. The static output is approximately 612 KB and includes all nine offerings. No package installation or runtime framework is required. Local source syntax checks passed.

## Browser playthroughs

Checked in the Codex in-app browser at desktop 1280 × 900 and phone 390 × 844:

- Homepage: all nine links, category filters, grown-up information dialog, and completed-game badges.
- World Explorer: all eight countries found, a wrong choice followed by retry, direct SVG marker interaction, and Space-key activation of a map marker.
- Flag Detective: all eight rounds, both “name the country” and “find the flag” modes, clues, arrow-key selection and Space confirmation. All eight collected flag images loaded.
- Transport Dispatcher: all eight missions, including actual station neighbours towards both termini, line-colour identification, destination direction and the road-bus question.
- Maths Workshop: full eight-question sessions at Primary 1–2, Primary 3–4 and Primary 5–6. This included number bonds, tens/ones, fractions on phones, decimals, percentages and ratio word problems.
- Treasure Trails now uses the Captain Dhruva pirate quest described below. Its previous four fixed-coordinate dig rounds have been replaced.
- The original MRT page remains accessible from its hub card, with its own settings and a return link.

## Additional small-screen and deployment checks

- At 320 × 568 the homepage retains all nine cards with no horizontal overflow. Flag Detective also has no horizontal overflow, and its answer buttons measure 239 × 58 px.
- Treasure Trails at 320 × 568 keeps the coordinate clue, map, 60 × 44 px compass controls and 255 × 46 px Dig action in one play area. At 390 px the arrow buttons measure approximately 74 × 47 px and Dig measures 307 × 48 px. No horizontal overflow was observed.
- MRT Adventure’s hub link loads the preserved game at Punggol Coast. Answering its first question advances to Punggol with progress 1 of 17; its return link opens the hub.
- The built hub under `/dist/` exposes all nine relative links. Its Flag Detective link opens `/dist/play.html?game=flags`, loads its local flag and presents working answer controls.
- The built MRT entry point also opens correctly from the hub. An unknown game identifier offers a working “See all games” return link.
- Final browser checks recorded no console warnings or errors. Sound was restored before handing back the hub.

All application URLs are relative and static.

## Brighter theme refresh

- Reworked the hub with a purple/yellow hero, original animated SVG artwork, numbered colour-coded cards, and clear Play actions. Added the shared dotted background and tactile controls to all six games.
- Rechecked the hub at 1280 × 900, 390 × 844 and 320 × 568. The original six offerings, Maps filtering and the grown-up dialog work; no horizontal overflow was observed at 320 px.
- Checked the five new game entry screens and active rounds. Answered a maths question and collected the first treasure using phone movement controls. The original MRT All aboard action starts its journey.
- Re-ran all 28 tests and the static build. Browser checks recorded no warnings or errors. New floating hero illustrations are covered by the existing reduced-motion rule; the OS setting was not changed.

## Captain Dhruva & the Lost Sunstone

- Completed the three map-piece chapters, discovered the vault and opened its three shape locks in desktop and 320 px phone playthroughs. Wrong digs and wrong keys offer retries without losing progress.
- Tested destination tapping with animated walking, direct compass movement, keyboard arrows, Space digging, Enter key activation and the parrot’s highlighted route hint.
- Explored all 21 walkable squares in the phone browser, collected all five shells and rescued Tilly; the ending displayed both optional rewards. Revisited squares do not award duplicate collectibles (also covered by model tests).
- Replayed to a fresh generated voyage and checked 390 px controls. Clues remain spoken and visible. The final key sequence uses both shapes and names, so colour alone is not required.
- The captain, parrot, keys, map fragment and closed/open chest use original local SVG artwork. The static build includes the separate treasure stylesheet and modules.
- Reduced-motion CSS suppresses new ambient effects, and tap-to-walk skips its timed steps when the browser reports reduced motion. The operating system preference was not changed during QA.

## Creative activity book

- Desktop 1280 × 900: filled train regions, made a real pointer-drag brush stroke, added a heart stamp, and verified undo/redo. Saved the picture, downloaded its 1200 × 880 PNG, reopened it in My Book and used the same colours, brushwork and stamp in a jigsaw.
- Completed the four-piece artwork jigsaw with wrong-placement retry, real pointer dragging, tap-to-place and keyboard Enter. Completed 6-, 9- and 12-piece puzzles in the phone viewport.
- Completed 10-, 15- and 20-dot mysteries; checked wrong-order hints, keyboard activation, picture reveals and the link into Colouring Studio.
- At 390 × 844 and 320 × 568: checked colouring, puzzle selection and the new hub category without horizontal overflow. The smallest phone’s colour buttons measure 44 × 44 px.
- Removed and restored a saved page through My Book’s Undo action. Saved-page editing, unsaved-colour refresh recovery and picture selection after refresh were checked in the browser; a regression test covers draft selection.
- Verified all nine hub cards and the Activity Book filter’s three offerings. Print CSS is included for the current picture and one gallery page per sheet; a physical printer session has not been tested.

## Limits

Physical iPhone/Android and desktop Safari sessions have not been tested. Browser voice quality and audible playback should be checked on the family’s devices. Missing speech APIs and blocked storage have automated fallback coverage; all prompts remain visible.

Reduced-motion CSS is implemented; the operating system’s motion preference was not changed during QA. The maths offering covers selected skills rather than an entire primary syllabus. Map outlines are generalised educational data; small locations use locator dots.

The earlier GitHub Pages deployment at commit `e86256f` succeeded. Pages uses the GitHub Actions publishing source at `https://abhivaikar.github.io/dhruva-games/`; check the new commit’s workflow when publishing this update.

A play session with Dhruva is the best next check of reading load, voice, pace and difficulty.

## Saved activity-book removal

- Removed the homepage collection banner, header/navigation links, gallery, save-to-book actions and saved-art puzzle sources. The three creative games remain available under **Creative games**.
- Verified in the local browser: colouring changes survive refresh; reset can be undone; a four-piece puzzle completes; all ten dots complete with a link to colouring; template choices show all 36 pictures without a saved-artwork tab.
- An old `activity.html?game=book` URL now opens Colouring Studio. The earlier gallery checks above are historical; that feature is no longer available.
- The current-picture PNG download and print actions remain. Existing gallery storage is left untouched and is no longer read or written.
- All 75 remaining automated tests and the static build pass.

## Dot-to-dot outline and completion correction

- All 36 finished dot pictures were visually reviewed together. At 10, 15 and 20 dots, the trace now follows each picture’s full authored contour rather than drawing straight shortcuts between sampled points. Interior clues use that picture’s existing art.
- In the built site, the excavator stays on the drawing board at 9/10, at 10/10 awaiting closure, and after tapping 1 to close the final line. Clicking blank space near dot 10 leaves it at 9/10. Extra Enter after completion does not start a new picture.
- Checked completion Undo/Redo, Reset and undoing Reset. A held Enter on the 20-dot robot connects only one dot. No timer changes the finished picture.
- Desktop drawing and controls are arranged alongside one another. Completion retains the trace and numbered dots rather than replacing them with a colouring-page screen.
- All 80 automated tests and the static build pass. Regression checks cover retained contour corners, explicit closure, reversible completion, label spacing, disjoint targets, and consistent release versions across the published module graph.

## Unrestricted picture-puzzle placement

- Any piece can occupy any board space at all four puzzle sizes. The board stores the actual piece in each space, and a full incorrect arrangement does not complete the puzzle.
- Verified in the browser: put piece 1 in space 4; filled all four spaces incorrectly; swapped board pieces by clicking and by dragging; dragged a board piece back to the tray; replaced an occupied space from the tray; moved a piece and returned it with the keyboard/button.
- Verified a correct picture celebrates on the same board, its pieces can still move afterward, and Undo/Redo, Reset and undoing Reset restore both correct and incorrect arrangements.
- All 81 tests and the static build pass. Regression checks cover every piece/space combination for 4, 6, 9 and 12 pieces, displaced-piece recovery, and piece uniqueness during repeated moves and history operations.
