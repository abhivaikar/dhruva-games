export const GRID_SIZE = 5;
export const ROCKS = Object.freeze(['B2', 'C2', 'D4', 'E1']);
export const TREASURES = Object.freeze(['C3', 'E5', 'B1', 'D3']);
export const DIRECTIONS = Object.freeze({ north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0] });
export const coordinate = (x, y) => `${String.fromCharCode(65 + x)}${y + 1}`;
export const position = cell => ({ x: cell.charCodeAt(0) - 65, y: Number(cell[1]) - 1 });

export class TreasureTrail {
  constructor() { this.x = 0; this.y = 4; this.completed = 0; this.phase = 'exploring'; }
  get cell() { return coordinate(this.x, this.y); }
  get target() { return TREASURES[this.completed]; }
  move(direction) {
    if (this.phase !== 'exploring' || !DIRECTIONS[direction]) return 'ignored';
    const [dx, dy] = DIRECTIONS[direction];
    const x = this.x + dx, y = this.y + dy;
    if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return 'edge';
    if (ROCKS.includes(coordinate(x, y))) return 'rock';
    this.x = x; this.y = y;
    return 'moved';
  }
  dig() {
    if (this.phase !== 'exploring') return 'ignored';
    if (this.cell !== this.target) return 'retry';
    this.completed++;
    this.phase = 'found';
    return 'found';
  }
  advance() {
    if (this.phase !== 'found') return false;
    this.phase = this.completed === TREASURES.length ? 'complete' : 'exploring';
    return true;
  }
}
