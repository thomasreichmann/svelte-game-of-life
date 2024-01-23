interface IBoard {
  onRender?: (state: BoardState) => any;
}

export interface BoardState {
  width: number;
  height: number;
  cells: Cell[];
  getCell: (x: number, y: number) => Cell | undefined;
}

type Cell = boolean;

export class Board implements IBoard {
  cells: Cell[] = [];

  constructor(
    private width: number,
    private height: number,
    public onRender?: (a: BoardState) => void,
  ) {
    this.cells = this.createCells();
  }

  public tick() {
    const newState: Cell[] = [...this.cells]
    //
    // for (let i = 0; i < this.cells.length; i++) {
    //   let neighbors = this.getNeighbors(i)
    //
    //   let aliveCount = neighbors.filter(e => e).length
    //   let deadCount = neighbors.filter(e => !e).length
    //
    //   if (this.cells[i]) {
    //     // Checks to do if the cell is alive
    //     if (aliveCount < 2) {
    //       // Dies of underpopulation
    //       newState[i] = false
    //     } else if (aliveCount <= 3) {
    //       // Continues to next gen
    //     } else {
    //       // Dies of overpopulation
    //       newState[i] = false
    //     }
    //   } else {
    //     // Check to do if the cell is dead
    //     if (aliveCount == 3) {
    //       newState[i] = true
    //     }
    //   }
    // }

    this.cells = newState

    if (this.onRender) {
      this.onRender(this.getBoardState());
    }
  }

  public getNeighbors(i: number): boolean[] {
    let {x, y} = this.indexToCardinal(i)

    const t = (x: number, y: number) => this.cells[this.cardinalToIndex(x, y)]

    let topLeft = t(x - 1, y - 1)
    let topMiddle = t(x, y - 1)
    let topRight = t(x - 1, y)

    let middleLeft = t(x - 1, y)
    let middleRight = t(x + 1, y)

    let bottomLeft = t(x - 1, y + 1)
    let bottomMiddle = t(x, y + 1)
    let bottomRight = t(x + 1, y + 1)

    return [topLeft, topMiddle, topRight, middleLeft, middleRight, bottomLeft, bottomMiddle, bottomRight]
  }

  public getCell(x: number, y: number): Cell | undefined {
    return this.cells[this.cardinalToIndex(x, y)];
  }

  public cardinalToIndex(x: number, y: number): number {
    return this.width * y + x;
  }

  public indexToCardinal(index: number): { x: number, y: number } {
    let x = Math.floor(index / this.width);
    let y = index % this.width;
    return {x, y};
  }

  public setCell(index: number, value: boolean) {
    if (index > this.cells.length - 1) return;

    this.cells[index] = value
  }

  public setCellByCardinal(x: number, y: number, value: boolean) {
    let index = this.cardinalToIndex(x, y);

    // Check if passed x,y are within array bounds
    if (this.cells.length - 1 < index) return;

    this.cells[index] = value;
  }

  public getBoardState(): BoardState {
    return {
      width: this.width,
      height: this.height,
      cells: this.cells,
      getCell: this.getCell.bind(this),
    };
  }

  private createCells(): boolean[] {
    // return Array.from({length: this.width * this.height}, () => Math.random() < 0.5);
    return new Array(this.width * this.height).fill(true);
  }

  private render() {
    this.onRender?.(this.getBoardState());
  }
}
