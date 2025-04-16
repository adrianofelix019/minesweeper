const gridSize = 8;
const numMines = 10;
const clickSound = document.getElementById("click-sound");
const explosionSound = document.getElementById("explosion-sound");

let grid = [];
let timer = 0;
let intervalId = null;
let gameStarted = false;
let flagsPlaced = 0;
let defeated = false;

// const sounds = {
//   click: new Audio(`${soundPath}/click.mp3`),
// };

function updateUI() {
  document.getElementById("timer").textContent = timer;
  document.getElementById("flags").textContent = flagsPlaced;
  document.getElementById("mines").textContent = numMines;
}

function startTimer() {
  if (!gameStarted) {
    gameStarted = true;
    intervalId = setInterval(() => {
      timer++;
      updateUI();
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(intervalId);
}

function createCellElement(row, col) {
  const button = document.createElement("button");
  button.className = "cell";
  button.dataset.row = row;
  button.dataset.col = col;

  button.addEventListener("click", () => {
    startTimer();
    handleClick(row, col);
  });

  button.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    toggleFlag(row, col);
  });

  return button;
}

function generateGrid() {
  grid = [];
  for (let r = 0; r < gridSize; r++) {
    const row = [];
    for (let c = 0; c < gridSize; c++) {
      row.push({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
        element: createCellElement(r, c),
      });
    }
    grid.push(row);
  }

  let minesPlaced = 0;
  while (minesPlaced < numMines) {
    const r = Math.floor(Math.random() * gridSize);
    const c = Math.floor(Math.random() * gridSize);
    if (!grid[r][c].isMine) {
      grid[r][c].isMine = true;
      minesPlaced++;
    }
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      grid[r][c].neighborMines = countNeighborMines(r, c);
    }
  }

  renderGrid();
}

function countNeighborMines(row, col) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = row + dr;
      const nc = col + dc;
      if (
        nr >= 0 &&
        nr < gridSize &&
        nc >= 0 &&
        nc < gridSize &&
        grid[nr][nc].isMine
      ) {
        count++;
      }
    }
  }
  return count;
}

function renderGrid() {
  const gridContainer = document.getElementById("grid");
  gridContainer.innerHTML = "";

  grid.forEach((row) => {
    row.forEach((cell) => {
      gridContainer.appendChild(cell.element);
    });
  });

  updateUI();
}

function handleClick(row, col) {
  const cell = grid[row][col];
  if (cell.isRevealed || cell.isFlagged) return;

  cell.isRevealed = true;
  updateCellUI(cell);

  if (cell.isMine) {
    explosionSound.currentTime = 0;
    explosionSound.play();

    cell.element.classList.add("mine");
    revealAll();
    stopTimer();
    setTimeout(() => alert("💥 Você perdeu!"), 50);
    defeated = true;
  } else if (cell.neighborMines === 0) {
    revealEmptyCells(row, col);
  }

  if (!cell.isMine) {
    clickSound.currentTime = 0;
    clickSound.play();
  }

  checkWin();
}

function toggleFlag(row, col) {
  const cell = grid[row][col];
  if (cell.isRevealed) return;

  if (!cell.isFlagged && flagsPlaced >= numMines) return;

  cell.isFlagged = !cell.isFlagged;
  flagsPlaced += cell.isFlagged ? 1 : -1;
  updateCellUI(cell);
  updateUI();
  checkWin();
}

function updateCellUI(cell) {
  const el = cell.element;
  el.classList.remove("flag", "revealed", "mine");
  el.textContent = "";

  if (cell.isFlagged) {
    el.classList.add("flag");
    el.textContent = "🚩";
  } else if (cell.isRevealed) {
    el.classList.add("revealed");
    if (cell.isMine) {
      el.textContent = "💣";
    } else if (cell.neighborMines > 0) {
      el.textContent = cell.neighborMines;
    }
  }
}

function revealEmptyCells(row, col) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = row + dr;
      const nc = col + dc;
      if (
        nr >= 0 &&
        nr < gridSize &&
        nc >= 0 &&
        nc < gridSize &&
        !grid[nr][nc].isRevealed &&
        !grid[nr][nc].isMine
      ) {
        grid[nr][nc].isRevealed = true;
        updateCellUI(grid[nr][nc]);
        if (grid[nr][nc].neighborMines === 0) {
          revealEmptyCells(nr, nc);
        }
      }
    }
  }
}

function revealAll() {
  for (let row of grid) {
    for (let cell of row) {
      cell.isRevealed = true;
      updateCellUI(cell);
    }
  }
}

function checkWin() {
  const allClear = grid.flat().every((cell) =>
    cell.isMine ? true : cell.isRevealed
  );
  if (allClear && !defeated) {
    stopTimer();
    setTimeout(() => alert("🏆 Você venceu!"), 50);
  }
}

function resetGame() {
  timer = 0;
  flagsPlaced = 0;
  gameStarted = false;
  stopTimer();
  generateGrid();
}

// Inicia o jogo
window.onload = resetGame;
