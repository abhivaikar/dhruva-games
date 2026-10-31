// Keep shortcuts away from dialogs, settings, and unrelated controls.
export function shortcutAction({ key, repeat, altKey, ctrlKey, metaKey }, phase, allowed = true) {
  if (!allowed || phase !== 'question' || repeat || altKey || ctrlKey || metaKey) return null;
  if (key === 'ArrowLeft') return 'previous';
  if (key === 'ArrowRight') return 'next';
  if (key === ' ' || key === 'Spacebar') return 'answer';
  return null;
}
