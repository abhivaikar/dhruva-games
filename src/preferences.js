const KEY = 'dhruva-mrt-settings';
export function loadPreferences() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY)) || {};
    return {
      sound: value.sound !== false,
      level: ['beginner', 'explorer', 'super'].includes(value.level) ? value.level : 'beginner',
      train: ['purple', 'ocean', 'sunshine'].includes(value.train) ? value.train : 'purple',
    };
  } catch { return { sound: true, level: 'beginner', train: 'purple' }; }
}
export function savePreferences(value) {
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* Storage may be blocked. */ }
}
