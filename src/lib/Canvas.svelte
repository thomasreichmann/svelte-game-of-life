<script lang="ts">
  import {onMount} from "svelte";
  import {Board, type BoardState} from "./game/Game";

  const render = (ctx: CanvasRenderingContext2D, state: BoardState, scale: number) => {
    for (let x = 0; x < state.width; x++) {
      for (let y = 0; y < state.height; y++) {
        let cell = state.getCell(x, y)

        if (cell) ctx.fillStyle = '#e78d06'
        else ctx.fillStyle = '#000'

        ctx.fillRect(x * scale, y * scale, scale, scale)
      }
    }
  }

  let canvas: HTMLCanvasElement;
  let board: Board;
  let width = 50
  let height = 50
  let scale = 6

  const tick = () => {
    if (board) {
      board.tick()
    }
  }

  onMount(() => {
    let ctx = canvas.getContext('2d')
    if (!ctx) return;


    board = new Board(width, height, (state) => render(ctx!, state, scale))

    // board.setCellByCardinal(1, 1, true)
    // board.setCellByCardinal(1, 2, true)
    // board.setCellByCardinal(1, 3, true)

    board.tick()
  })

  const handleSliderChange = (event: any) => {
    scale = event.target.value
  }
</script>

<div class="container">
    <div>
        <button on:click={tick}>tick</button>
    </div>
    <canvas bind:this={canvas} height={height * scale} width={width * scale}/>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1em;
    }

    button {
        max-width: fit-content;
    }

    canvas {
        border: 2px solid #ff66d0;
    }
</style>