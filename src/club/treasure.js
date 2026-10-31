export const GRID_SIZE = 5;
export const ROCKS = Object.freeze(['B2', 'C2', 'D4', 'E1']);
export const DIRECTIONS = Object.freeze({ north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0] });
export const coordinate = (x, y) => `${String.fromCharCode(65 + x)}${y + 1}`;
export const position = cell => ({ x: cell.charCodeAt(0) - 65, y: Number(cell[1]) - 1 });
export const KEYS = Object.freeze([
  Object.freeze({ id: 'star', name: 'Star key', symbol: '★', colour: '#ffce40', message: 'A golden key and the first piece of our secret map!' }),
  Object.freeze({ id: 'moon', name: 'Moon key', symbol: '☾', colour: '#58dfdc', message: 'A moon-shaped key! Our secret map is coming together.' }),
  Object.freeze({ id: 'heart', name: 'Heart key', symbol: '♥', colour: '#ff83a8', message: 'The final map piece! Now we can find the Sunstone vault.' }),
]);
const LANDMARKS = Object.freeze([
  Object.freeze({ name: 'Whispering Palms', kind: 'palms', story: 'Ahoy, Captain Dhruva! The palms are hiding our first map piece.', found: 'Rustle, rustle… something golden is hiding in the sand!' }),
  Object.freeze({ name: 'Shipwreck Bay', kind: 'wreck', story: 'A friendly pirate left another map piece beside the old shipwreck.', found: 'Creak! A secret drawer in the ship slides open.' }),
  Object.freeze({ name: 'Crystal Cave', kind: 'cave', story: 'Follow the sparkle! The last map piece is waiting at Crystal Cave.', found: 'Twinkle! The cave lights up with a magical glow.' }),
  Object.freeze({ name: 'Sunstone Vault', kind: 'vault', story: 'The map is complete! Find the vault, then use your three shape keys.', found: 'You found the vault! Our secret map shows how to open it.' }),
]);
const CELLS = Array.from({ length: 25 }, (_, i) => coordinate(i % 5, Math.floor(i / 5)));
const walkable = cell => /^[A-E][1-5]$/.test(cell) && !ROCKS.includes(cell);
const shuffled = (items, random) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.max(0, Math.min(i, Math.floor(random() * (i + 1))));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/** A shortest, walkable route. Used by tapping a destination and the optional parrot hint. */
export function islandPath(start, goal) {
  if (!walkable(start) || !walkable(goal)) return null;
  const queue = [{ cell: start, steps: [] }], seen = new Set([start]);
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (current.cell === goal) return current.steps;
    const { x, y } = position(current.cell);
    for (const [direction, [dx, dy]] of Object.entries(DIRECTIONS)) {
      const next = coordinate(x + dx, y + dy);
      if (!walkable(next) || seen.has(next)) continue;
      seen.add(next);
      queue.push({ cell: next, steps: [...current.steps, direction] });
    }
  }
  return null;
}

export class TreasureTrail {
  constructor(random = Math.random) {
    this.x = 0; this.y = 4; this.completed = 0; this.phase = 'exploring';
    this.visited = new Set([this.cell]);
    this.shells = new Set(); this.rescued = false; this.steps = 0; this.unlocked = 0;
    let previous = this.cell;
    const pool = shuffled(CELLS.filter(cell => walkable(cell) && cell !== this.cell), random);
    this.missions = LANDMARKS.map(landmark => {
      const index = Math.max(0, pool.findIndex(cell => islandPath(previous, cell).length >= 3));
      const [cell] = pool.splice(index, 1);
      previous = cell;
      return Object.freeze({ ...landmark, cell });
    });
    this.shellSpots = Object.freeze(pool.splice(0, 5));
    this.turtleCell = pool[0];
    this.lockOrder = Object.freeze(shuffled(KEYS.map(key => key.id), random));
    this.lastEvent = null;
  }
  get cell() { return coordinate(this.x, this.y); }
  get mission() { return this.missions[Math.min(this.completed, 3)]; }
  get target() { return this.mission.cell; }
  get distance() { return islandPath(this.cell, this.target)?.length ?? 0; }
  get foundMissions() { return this.missions.slice(0, this.completed); }
  get ownedKeys() { return KEYS.slice(0, Math.min(this.completed, 3)); }
  get nextStep() { return islandPath(this.cell, this.target)?.[0] || null; }
  isVisible(cell) {
    const point = position(cell);
    return [...this.visited].some(visited => {
      const v = position(visited);
      return Math.abs(point.x - v.x) + Math.abs(point.y - v.y) <= 1;
    });
  }
  move(direction) {
    if (this.phase !== 'exploring' || !DIRECTIONS[direction]) return 'ignored';
    const [dx, dy] = DIRECTIONS[direction];
    const x = this.x + dx, y = this.y + dy;
    if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return 'edge';
    if (ROCKS.includes(coordinate(x, y))) return 'rock';
    this.x = x; this.y = y; this.steps++; this.visited.add(this.cell);
    this.lastEvent = null;
    if (this.shellSpots.includes(this.cell) && !this.shells.has(this.cell)) {
      this.shells.add(this.cell);
      this.lastEvent = { kind: 'shell', text: 'A sparkle shell! It’s going in your captain’s collection.' };
    }
    if (this.cell === this.turtleCell && !this.rescued) {
      this.rescued = true;
      this.lastEvent = { kind: 'turtle', text: 'You rescued Tilly the turtle! She’s safely back in the sea.' };
    }
    return 'moved';
  }
  dig() {
    if (this.phase !== 'exploring') return 'ignored';
    if (this.cell !== this.target) return 'retry';
    if (this.completed === 3) { this.phase = 'unlocking'; return 'vault'; }
    this.completed++;
    this.phase = 'found';
    return 'found';
  }
  advance() {
    if (this.phase !== 'found') return false;
    this.phase = 'exploring';
    return true;
  }
  turnKey(id) {
    if (this.phase !== 'unlocking' || !KEYS.some(key => key.id === id)) return 'ignored';
    if (id !== this.lockOrder[this.unlocked]) return 'retry';
    this.unlocked++;
    if (this.unlocked === 3) { this.completed = 4; this.phase = 'complete'; return 'complete'; }
    return 'unlocked';
  }
}
