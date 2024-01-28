<script lang="ts">
  import {onMount} from "svelte";
  import {Board, type BoardState} from "./game/Game";

  let canvas: HTMLCanvasElement;
  let board: Board;
  let scale = 20;
  let isDragging = false;
  let isPanning = false;
  let play = false;
  let frameLoopId: number;
  let frameSpeed = 75;
  let currentToggleState: boolean | null = null;
  let viewport = {x: 0, y: 0};

  let cellCount = 0

  const render = (ctx: CanvasRenderingContext2D, state: BoardState, scale: number) => {
    if (!canvas) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    state.cells.forEach((val, key) => {
      const [x, y] = key.split(',').map(Number);
      let cell = state.getCell(x, y);
      if (cell) ctx.fillStyle = '#e78d06';
      else ctx.fillStyle = '#000';
      ctx.fillRect((x - viewport.x) * scale, (y - viewport.y) * scale, scale, scale);
    });

    cellCount = state.cells.size
  };

  const toggleCellAt = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / scale) + viewport.x;
    const y = Math.floor((event.clientY - rect.top) / scale) + viewport.y;
    if (currentToggleState === null) {
      const currentCellState = board.getCell(x, y);
      currentToggleState = !currentCellState;
    }
    board.setCellByCardinal(x, y, currentToggleState);
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (event.shiftKey) {
      isPanning = true;
      canvas.style.cursor = 'move';
    } else {
      isDragging = true;
      currentToggleState = null;
      toggleCellAt(event);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isPanning) {
      viewport.x -= event.movementX / scale;
      viewport.y -= event.movementY / scale;
      requestAnimationFrame(() => board.render());  // Trigger board render
    } else if (isDragging) {
      toggleCellAt(event);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      // Snap viewport position to the nearest grid point after panning
      viewport.x = Math.round(viewport.x);
      viewport.y = Math.round(viewport.y);

      requestAnimationFrame(() => board.render()); // Update the rendering after snapping
    }

    isDragging = false;
    isPanning = false;
    canvas.style.cursor = 'default';
    currentToggleState = null;
  };

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    board = new Board((state) => render(ctx, state, scale));
  });

  const tick = () => {
    if (board) {
      board.tick();
    }
  };

  const togglePlay = () => {
    play = !play;
  };

  $: if (play) {
    clearInterval(frameLoopId);
    frameLoopId = setInterval(tick, frameSpeed);
  } else {
    clearInterval(frameLoopId);
  }

  const handleWheel = (event: WheelEvent) => {
    if (event.shiftKey) {
      event.preventDefault();

      const rect = canvas.getBoundingClientRect();

      // Calculate the cursor position relative to the canvas before scaling
      const cursorXBeforeScale = (event.clientX - rect.left) / scale + viewport.x;
      const cursorYBeforeScale = (event.clientY - rect.top) / scale + viewport.y;

      // Determine the scale factor based on the scroll direction
      const scaleFactor = event.deltaY < 0 ? 1 : -1;
      scale = Math.max(1, scale + scaleFactor)

      // Adjust the viewport based on the cursor's position
      viewport.x = Math.round(cursorXBeforeScale - (event.clientX - rect.left) / scale);
      viewport.y = Math.round(cursorYBeforeScale - (event.clientY - rect.top) / scale);

      // Render the board with the new scale
      requestAnimationFrame(() => board.render());
    }
  };

  const resetVp = () => {
    viewport.x = 0
    viewport.y = 0

    scale = 20

    requestAnimationFrame(() => board.render());
  }

  const reset = () => {
    resetVp()
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    play = false
    board = new Board((state) => render(ctx, state, scale));
  }
</script>

<div class="container">
    <div style="display: flex; gap: 12px">
        <button on:click={tick}>tick</button>
        <button on:click={togglePlay}>play/pause</button>
        <button on:click={reset}>reset</button>
        <button on:click={resetVp}>view port 0</button>
        <div style="display: flex; flex-direction: column">
            <span>cells: {cellCount}</span>
            <span>scale: {scale}</span>
        </div>
        <div style="display: flex; flex-direction: column">
            <label for="frame-speed">Frame Speed: {frameSpeed}</label>
            <input aria-label="simulation speed (ms)" bind:value={frameSpeed} id="frame-speed" max="300" min="1"
                   type="range">
        </div>
        <span>{play ? "playing" : "paused"}</span>
    </div>
    <canvas
            bind:this={canvas}
            height={800}
            on:mousedown={handleMouseDown}
            on:mouseleave={handleMouseUp}
            on:mousemove={handleMouseMove}
            on:mouseup={handleMouseUp}
            on:wheel={handleWheel}
            width={1500}
    />
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1em;
        height: 100vh;
        width: 100vh;
    }

    button {
        max-width: fit-content;
    }

    canvas {
        border: 2px solid #ff66d0;
        cursor: default;
    }
</style>
