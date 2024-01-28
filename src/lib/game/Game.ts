interface IBoard {
  onRender?: (state: BoardState) => any;
}

export interface BoardState {
  cells: Map<string, boolean>;
  getCell: (x: number, y: number) => boolean;
  indexToCardinal: (index: string) => { x: number, y: number };
}

export class Board implements IBoard {
  public cells: Map<string, boolean> = new Map();
  private changedCells: Set<string> = new Set();

  constructor(public onRender?: (state: BoardState) => void) {
    this.setCellByCardinal(4, 3, true);
    this.setCellByCardinal(3, 4, true);
    this.setCellByCardinal(4, 4, true);
    this.setCellByCardinal(5, 4, true);
  }

  public tick() {
    let newState = new Map<string, boolean>();
    let cellsToCheck = new Set<string>([...this.cells.keys()].flatMap(key => this.getNeighbors(key)));

    cellsToCheck.forEach(key => {
      let aliveCount = this.getNeighbors(key).filter(neighborKey => this.cells.get(neighborKey)).length;
      let isAlive = this.cells.get(key) || false;

      if (isAlive && (aliveCount < 2 || aliveCount > 3)) {
        // Cell dies, do not add to newState
      } else if (!isAlive && aliveCount === 3) {
        newState.set(key, true); // Cell becomes alive
      } else if (isAlive) {
        newState.set(key, true); // Keep alive cell
      }
    });

    this.cells = newState;

    if (this.onRender) {
      this.onRender(this.getBoardState());
    }
  }

  public getNeighbors(key: string): string[] {
    const [x, y] = key.split(',').map(Number);
    return [
      `${x - 1},${y - 1}`, `${x},${y - 1}`, `${x + 1},${y - 1}`,
      `${x - 1},${y}`, `${x + 1},${y}`,
      `${x - 1},${y + 1}`, `${x},${y + 1}`, `${x + 1},${y + 1}`
    ];
  }

  public getCell(x: number, y: number): boolean {
    return this.cells.get(`${x},${y}`) || false;
  }

  public setCellByCardinal(x: number, y: number, value: boolean) {
    const key = `${x},${y}`;
    this.cells.set(key, value);
    this.changedCells.add(key);
    this.render();
  }

  public getBoardState(): BoardState {
    return {
      cells: this.cells,
      getCell: this.getCell.bind(this),
      indexToCardinal: (key: string) => {
        const [x, y] = key.split(',').map(Number);
        return {x, y};
      }
    };
  }

  public render() {
    this.onRender?.(this.getBoardState());
    this.changedCells.clear();
  }
}
