/**
 * game.js
 * Lógica principal do Sudoku — Projeto DIO
 *
 * Depende de: data.js (SOLUTION, GIVEN)
 */

/* ── Estado global ───────────────────────────── */
let userBoard   = Array.from({ length: 9 }, () => Array(9).fill(0));
let selected    = null;   // [row, col] da célula selecionada
let errorCount  = 0;
let hintsLeft   = 3;
let seconds     = 0;
let timerActive = false;
let timerInterval;

/* ── Inicialização ───────────────────────────── */
function init() {
  resetState();
  buildBoard();
  buildNumpad();
  bindControls();
  startTimer();
}

function resetState() {
  userBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
  GIVEN.forEach((row, r) =>
    row.forEach((isGiven, c) => {
      if (isGiven) userBoard[r][c] = SOLUTION[r][c];
    })
  );
  selected    = null;
  errorCount  = 0;
  hintsLeft   = 3;
  seconds     = 0;
  timerActive = true;
  updateTimer();
}

/* ── Construção do tabuleiro ─────────────────── */
function buildBoard() {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.tabIndex  = 0;

      // Bordas grossas de bloco 3×3
      const thickR = c === 2 || c === 5;
      const thickB = r === 2 || r === 5;
      if (thickR && thickB) cell.classList.add("box-rb");
      else if (thickR)      cell.classList.add("box-r");
      else if (thickB)      cell.classList.add("box-b");

      cell.addEventListener("click",   () => selectCell(r, c));
      cell.addEventListener("keydown", onKeydown);
      boardEl.appendChild(cell);
    }
  }

  render();
}

/* ── Numpad ──────────────────────────────────── */
function buildNumpad() {
  const numpad = document.getElementById("numpad");
  numpad.innerHTML = "";

  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement("button");
    btn.className   = "num-btn";
    btn.textContent = n;
    btn.setAttribute("aria-label", `Inserir ${n}`);
    btn.addEventListener("click", () => placeNumber(n));
    numpad.appendChild(btn);
  }

  const eraseBtn = document.createElement("button");
  eraseBtn.className   = "num-btn erase";
  eraseBtn.textContent = "⌫";
  eraseBtn.setAttribute("aria-label", "Apagar");
  eraseBtn.addEventListener("click", () => placeNumber(0));
  numpad.appendChild(eraseBtn);
}

/* ── Render ──────────────────────────────────── */
function render() {
  let correctFilled = 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = getCell(r, c);
      const val  = userBoard[r][c];

      cell.textContent = val || "";
      cell.classList.remove("given", "user", "error", "selected", "highlight");

      if (GIVEN[r][c]) {
        cell.classList.add("given");
        correctFilled++;
      } else if (val && val !== SOLUTION[r][c]) {
        cell.classList.add("error");
      } else if (val) {
        cell.classList.add("user");
        correctFilled++;
      }
    }
  }

  // Destaque da célula selecionada e seu grupo
  if (selected) {
    const [sr, sc] = selected;
    const selVal   = userBoard[sr][sc];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell    = getCell(r, c);
        const sameBox = Math.floor(r / 3) === Math.floor(sr / 3) &&
                        Math.floor(c / 3) === Math.floor(sc / 3);

        if (r === sr || c === sc || sameBox)
          cell.classList.add("highlight");

        if (selVal && userBoard[r][c] === selVal)
          cell.classList.add("highlight");

        if (r === sr && c === sc)
          cell.classList.add("selected");
      }
    }
  }

  document.getElementById("filled-count").textContent = correctFilled;
  document.getElementById("errors-count").textContent = errorCount;
}

/* ── Interação ───────────────────────────────── */
function selectCell(r, c) {
  selected = [r, c];
  render();
}

function placeNumber(n) {
  if (!selected) return;
  const [r, c] = selected;
  if (GIVEN[r][c]) return;

  if (n === 0) {
    userBoard[r][c] = 0;
  } else {
    if (userBoard[r][c] !== SOLUTION[r][c] && n !== SOLUTION[r][c]) {
      errorCount++;
    } else if (userBoard[r][c] === 0 && n !== SOLUTION[r][c]) {
      errorCount++;
    }
    userBoard[r][c] = n;
  }

  render();
  checkWin();
}

function onKeydown(e) {
  if (!selected) return;
  const [r, c] = selected;

  if (e.key >= "1" && e.key <= "9") { placeNumber(parseInt(e.key)); return; }
  if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") { placeNumber(0); return; }

  const moves = {
    ArrowUp:    [-1,  0],
    ArrowDown:  [ 1,  0],
    ArrowLeft:  [ 0, -1],
    ArrowRight: [ 0,  1],
  };

  if (moves[e.key]) {
    e.preventDefault();
    const [dr, dc] = moves[e.key];
    selected = [
      Math.max(0, Math.min(8, r + dr)),
      Math.max(0, Math.min(8, c + dc)),
    ];
    render();
  }
}

/* ── Verificar ───────────────────────────────── */
function checkBoard() {
  let wrong = 0;
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (userBoard[r][c] && !GIVEN[r][c] && userBoard[r][c] !== SOLUTION[r][c])
        wrong++;

  showToast(wrong === 0
    ? "✓ Tudo certo até agora!"
    : `${wrong} célula(s) incorreta(s)`
  );
}

/* ── Dica ────────────────────────────────────── */
function giveHint() {
  if (hintsLeft <= 0) { showToast("Sem mais dicas disponíveis"); return; }

  const empties = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (!GIVEN[r][c] && userBoard[r][c] !== SOLUTION[r][c])
        empties.push([r, c]);

  if (!empties.length) { showToast("Tabuleiro já completo!"); return; }

  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  userBoard[r][c] = SOLUTION[r][c];
  hintsLeft--;
  selected = [r, c];
  render();
  showToast(`Dica usada! Restam ${hintsLeft}`);
  checkWin();
}

/* ── Resolver ────────────────────────────────── */
function solveBoard() {
  SOLUTION.forEach((row, r) =>
    row.forEach((val, c) => { userBoard[r][c] = val; })
  );
  selected = null;
  timerActive = false;
  render();
  showToast("Tabuleiro resolvido automaticamente!");
  checkWin();
}

/* ── Reiniciar ───────────────────────────────── */
function resetBoard() {
  clearInterval(timerInterval);
  document.getElementById("victory").classList.remove("show");
  resetState();
  startTimer();
  render();
}

/* ── Vitória ─────────────────────────────────── */
function checkWin() {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (userBoard[r][c] !== SOLUTION[r][c]) return;

  timerActive = false;
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  document.getElementById("victory-msg").textContent =
    `Concluído em ${m}:${s} com ${errorCount} erro(s)!`;
  document.getElementById("victory").classList.add("show");
}

/* ── Timer ───────────────────────────────────── */
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!timerActive) return;
    seconds++;
    updateTimer();
  }, 1000);
}

function updateTimer() {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  document.getElementById("timer").textContent = `${m}:${s}`;
}

/* ── Toast ───────────────────────────────────── */
let toastTimeout;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove("show"), 2500);
}

/* ── Utilitários ─────────────────────────────── */
function getCell(r, c) {
  return document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

/* ── Bind de controles ───────────────────────── */
function bindControls() {
  document.getElementById("btn-check") .addEventListener("click", checkBoard);
  document.getElementById("btn-hint")  .addEventListener("click", giveHint);
  document.getElementById("btn-reset") .addEventListener("click", resetBoard);
  document.getElementById("btn-solve") .addEventListener("click", solveBoard);
  document.getElementById("btn-again") .addEventListener("click", resetBoard);
}

/* ── Start ───────────────────────────────────── */
init();