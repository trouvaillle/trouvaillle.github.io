---
permalink: /app/pushpush/script.js
visible: false
---
'use strict';

const COLS = 13;
const ROWS = 13;
const TOTAL_STAGES = 50;
const ASSET_PATH = '/assets/img/pushpush/';
const DATA_PATH = '/assets/data/pushpush.dat';
const SOUND_PATH = '/assets/media/pushpush/';

const CELL = {
  PLAYER: 0,
  BALL: 1,
  HOUSE_EMPTY: 2,
  HOUSE_FILLED: 3,
  WALL: 4,
  EMPTY: 5,
  VOID: 6
};

const DIR = {
  UP: [-1, 0],
  DOWN: [1, 0],
  LEFT: [0, -1],
  RIGHT: [0, 1]
};

const STATE = {
  WELCOME: 'welcome',
  PLAYING: 'playing',
  CLEAR: 'clear',
  GAMEOVER: 'gameover',
  REPLAY: 'replay'
};

class AssetLoader {
  constructor() {
    this.images = {};
    this.data = null;
  }

  async loadAll() {
    const imagePromises = [];
    for (let i = 0; i <= 5; i++) {
      imagePromises.push(this._loadImage(`cell${i}`, `${ASSET_PATH}pushpush${i}.jpg`));
    }
    imagePromises.push(this._loadImage('background', `${ASSET_PATH}background.jpg`));
    imagePromises.push(this._loadImage('pushend', `${ASSET_PATH}pushend.jpg`));
    for (let i = 1; i <= 6; i++) {
      imagePromises.push(this._loadImage(`start${i}`, `${ASSET_PATH}start${i}.jpg`));
    }
    const dataPromise = this._loadData();
    await Promise.all([...imagePromises, dataPromise]);
  }

  _loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { this.images[key] = img; resolve(); };
      img.onerror = () => reject(new Error(`Failed to load: ${src}`));
      img.src = src;
    });
  }

  async _loadData() {
    const res = await fetch(DATA_PATH);
    const buf = await res.arrayBuffer();
    this.data = new Uint8Array(buf);
  }

  getStageData(stageIndex) {
    const start = stageIndex * ROWS * COLS;
    const stage = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        row.push(this.data[start + r * COLS + c]);
      }
      stage.push(row);
    }
    return stage;
  }
}

class SoundManager {
  constructor() {
    this._muted = true;
    this._sounds = {};
    this._icon = document.getElementById('soundIcon');
  }

  play(name) {
    if (this._muted) return;
    if (!this._sounds[name]) {
      this._sounds[name] = new Audio(SOUND_PATH + name + '.wav');
    }
    this._sounds[name].currentTime = 0;
    this._sounds[name].play().catch(() => {});
  }

  toggle() {
    this._muted = !this._muted;
    this._icon.className = this._muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
  }
}

class Board {
  constructor(grid) {
    this.grid = grid.map(row => [...row]);
    this.terrain = grid.map(row => row.map(cell => {
      if (cell === CELL.HOUSE_EMPTY || cell === CELL.HOUSE_FILLED) return CELL.HOUSE_EMPTY;
      if (cell === CELL.WALL) return CELL.WALL;
      if (cell === CELL.VOID) return CELL.VOID;
      return CELL.EMPTY;
    }));
    this.initialHouseCount = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.terrain[r][c] === CELL.HOUSE_EMPTY) this.initialHouseCount++;
      }
    }
  }

  get(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    return this.grid[r][c];
  }

  set(r, c, val) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    this.grid[r][c] = val;
  }

  clearCell(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    this.grid[r][c] = this.terrain[r][c];
  }

  getFilledHouseCount() {
    let count = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.grid[r][c] === CELL.HOUSE_FILLED) count++;
      }
    }
    return count;
  }

  hasAnyMovableBall() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = this.grid[r][c];
        if (val !== CELL.BALL && val !== CELL.HOUSE_FILLED) continue;
        for (const [dr, dc] of Object.values(DIR)) {
          const nr = r + dr, nc = c + dc;
          const target = this.get(nr, nc);
          if (target === CELL.EMPTY || target === CELL.HOUSE_EMPTY) {
            return true;
          }
        }
      }
    }
    return false;
  }

  findPlayer() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.grid[r][c] === CELL.PLAYER) return [r, c];
      }
    }
    return null;
  }

  snapshot() {
    return this.grid.map(row => [...row]);
  }

  restore(snapshot) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.grid[r][c] = snapshot[r][c];
      }
    }
  }
}

class Player {
  constructor(board) {
    this.board = board;
    const pos = board.findPlayer();
    if (!pos) throw new Error('Player not found on board');
    this.row = pos[0];
    this.col = pos[1];
  }

  tryMove(dr, dc) {
    const nr = this.row + dr;
    const nc = this.col + dc;
    const target = this.board.get(nr, nc);
    if (target === null || target === CELL.WALL || target === CELL.VOID) return false;
    if (target === CELL.EMPTY || target === CELL.HOUSE_EMPTY) {
      this.board.clearCell(this.row, this.col);
      this.row = nr;
      this.col = nc;
      this.board.set(this.row, this.col, CELL.PLAYER);
      return true;
    }
    if (target === CELL.BALL || target === CELL.HOUSE_FILLED) {
      const br = nr + dr, bc = nc + dc;
      const pushTarget = this.board.get(br, bc);
      if (pushTarget === null) return false;
      if (pushTarget !== CELL.EMPTY && pushTarget !== CELL.HOUSE_EMPTY) return false;
      this.board.set(br, bc, pushTarget === CELL.HOUSE_EMPTY ? CELL.HOUSE_FILLED : CELL.BALL);
      this.board.clearCell(nr, nc);
      this.board.clearCell(this.row, this.col);
      this.row = nr;
      this.col = nc;
      this.board.set(this.row, this.col, CELL.PLAYER);
      return true;
    }
    return false;
  }

  move(dir) {
    const [dr, dc] = DIR[dir];
    if (!dr && !dc) return false;
    return this.tryMove(dr, dc);
  }
}

class Renderer {
  constructor(canvas, loader) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.canvas.style.imageRendering = 'pixelated';
    this.loader = loader;
    this.cellSize = 0;
    this.welcomeFrame = 0;
    this.welcomeInterval = null;
    this.clearTimer = null;
  }

  resize(boardWidth, boardHeight) {
    this.cellSize = Math.floor(Math.min(boardWidth / COLS, boardHeight / ROWS));
    const w = this.cellSize * COLS;
    const h = this.cellSize * ROWS;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.canvas.width = w;
    this.canvas.height = h;
    this.boardPixelWidth = w;
    this.boardPixelHeight = h;
  }

  render(state, board, player) {
    const ctx = this.ctx;
    const s = this.cellSize;
    ctx.clearRect(0, 0, this.boardPixelWidth, this.boardPixelHeight);
    const bg = this.loader.images['background'];
    if (bg) ctx.drawImage(bg, 0, 0, this.boardPixelWidth, this.boardPixelHeight);
    if (state === STATE.WELCOME) {
      this._renderWelcome();
      return;
    }
    this._renderBoard(board);
    if (state === STATE.GAMEOVER) {
      this._renderGameOver();
    } else if (state === STATE.CLEAR) {
      this._renderClear();
    } else if (state === STATE.REPLAY) {
      this._renderReplay();
    }
  }

  _renderReplay() {
    const ctx = this.ctx;
    const w = this.boardPixelWidth;
    const h = this.boardPixelHeight;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = `bold ${Math.floor(h * 0.12)}px 'PT Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u00BB', w / 2, h / 2);
  }

  _renderBoard(board) {
    const ctx = this.ctx;
    const s = this.cellSize;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = board.grid[r][c];
        const key = `cell${val}`;
        const img = this.loader.images[key];
        if (img) ctx.drawImage(img, c * s, r * s, s, s);
      }
    }
  }

  _renderWelcome() {
    const ctx = this.ctx;
    const w = this.boardPixelWidth;
    const h = this.boardPixelHeight;
    const idx = (this.welcomeFrame % 6) + 1;
    const img = this.loader.images[`start${idx}`];
    if (img) ctx.drawImage(img, 0, 0, w, h);
  }

  _renderGameOver() {
    const ctx = this.ctx;
    const w = this.boardPixelWidth;
    const h = this.boardPixelHeight;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, w, h);
    const img = this.loader.images['pushend'];
    if (img) {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.min(w / iw, h / ih) * 0.8;
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    }
  }

  _renderClear() {
    const ctx = this.ctx;
    const w = this.boardPixelWidth;
    const h = this.boardPixelHeight;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(h * 0.1)}px 'PT Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Clear!', w / 2, h / 2);
  }

  startWelcomeAnimation() {
    this.welcomeFrame = 0;
    this.welcomeInterval = setInterval(() => {
      this.welcomeFrame++;
    }, 300);
  }

  stopWelcomeAnimation() {
    if (this.welcomeInterval) {
      clearInterval(this.welcomeInterval);
      this.welcomeInterval = null;
    }
  }

  startClearTimer(callback) {
    this.clearTimer = setTimeout(callback, 3000);
  }

  stopClearTimer() {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
      this.clearTimer = null;
    }
  }
}

class InputManager {
  constructor(game) {
    this.game = game;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onDpadDown = this._onDpadDown.bind(this);
    this._onDpadUp = this._onDpadUp.bind(this);
    this._holdDir = null;
    this._holdTimer = null;
  }

  bind() {
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('click', this._onClick);
    document.querySelectorAll('#dpad button[data-dir]').forEach(btn => {
      btn.addEventListener('pointerdown', this._onDpadDown);
    });
    document.addEventListener('pointerup', this._onDpadUp);
    document.addEventListener('pointercancel', this._onDpadUp);
  }

  unbind() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('click', this._onClick);
    document.querySelectorAll('#dpad button[data-dir]').forEach(btn => {
      btn.removeEventListener('pointerdown', this._onDpadDown);
    });
    document.removeEventListener('pointerup', this._onDpadUp);
    document.removeEventListener('pointercancel', this._onDpadUp);
    this._stopHold();
  }

  _onDpadDown(e) {
    e.preventDefault();
    this._stopHold();
    const dir = e.currentTarget.getAttribute('data-dir');
    if (!dir) return;
    this.game.handleInput({ type: 'move', dir });
    this._holdDir = dir;
    this._holdTimer = setTimeout(() => {
      this._holdTimer = setInterval(() => {
        if (this._holdDir) this.game.handleInput({ type: 'move', dir: this._holdDir });
      }, 300);
    }, 200);
  }

  _onDpadUp(e) {
    if (this._holdDir) this._stopHold();
  }

  _stopHold() {
    if (this._holdTimer) {
      clearTimeout(this._holdTimer);
      clearInterval(this._holdTimer);
      this._holdTimer = null;
    }
    this._holdDir = null;
  }

  _onKeyDown(e) {
    const keyMap = {
      'w': 'UP', 'W': 'UP', 'ArrowUp': 'UP',
      's': 'DOWN', 'S': 'DOWN', 'ArrowDown': 'DOWN',
      'a': 'LEFT', 'A': 'LEFT', 'ArrowLeft': 'LEFT',
      'd': 'RIGHT', 'D': 'RIGHT', 'ArrowRight': 'RIGHT'
    };
    const dir = keyMap[e.key];
    if (dir) {
      e.preventDefault();
      this.game.handleInput({ type: 'move', dir });
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.game.handleInput({ type: 'confirm' });
    }
  }

  _onClick(e) {
    if (e.target.closest('#dpad') || e.target.closest('#sound') || e.target.closest('#showMovesBtn')) return;
    const canvas = this.game.renderer.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      this.game.handleInput({ type: 'confirm' });
      return;
    }
    const col = Math.floor(x / rect.width * COLS);
    const row = Math.floor(y / rect.height * ROWS);
    const player = this.game.player;
    if (player) {
      const dr = row - player.row;
      const dc = col - player.col;
      if (Math.abs(dr) + Math.abs(dc) === 1) {
        const dirMap = { '-1,0': 'UP', '1,0': 'DOWN', '0,-1': 'LEFT', '0,1': 'RIGHT' };
        const dir = dirMap[`${dr},${dc}`];
        if (dir) {
          this.game.handleInput({ type: 'move', dir });
          return;
        }
      }
    }
    this.game.handleInput({ type: 'confirm' });
  }
}

class LevelSelect {
  constructor(game) {
    this.game = game;
    this.select = document.getElementById('levelDropdown');
  }

  build() {
    if (!this.select) return;
    const maxLevel = this.game.getMaxAccessibleLevel();
    this.select.innerHTML = '';
    for (let i = 1; i <= maxLevel; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Level ${i}`;
      if (i === this.game.currentStage + 1) opt.selected = true;
      this.select.appendChild(opt);
    }
    this.select.addEventListener('change', () => {
      this.game.loadStage(parseInt(this.select.value) - 1);
    });
  }

  update() {
    if (!this.select) return;
    const currentVal = this.game.currentStage + 1;
    const needed = Math.max(this.game.getMaxAccessibleLevel(), currentVal);
    while (this.select.options.length < needed) {
      const opt = document.createElement('option');
      opt.value = this.select.options.length + 1;
      opt.textContent = `Level ${opt.value}`;
      this.select.appendChild(opt);
    }
    this.select.value = currentVal;
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.levelLabel = document.getElementById('levelLabel');
    this.state = STATE.WELCOME;
    this.lastCleared = this._loadNum('pushpush_lastCleared', 0);
    this.lastPlayed = this._loadNum('pushpush_lastPlayed', 0);
    this.currentStage = Math.max(0, this.getMaxAccessibleLevel() - 1);
    this.loader = new AssetLoader();
    this.renderer = new Renderer(this.canvas, this.loader);
    this.inputManager = new InputManager(this);
    this.levelSelect = new LevelSelect(this);
    this.sound = new SoundManager();
    this.board = null;
    this.player = null;
    this._rafId = null;
    this.history = [];
    this.redoStack = [];
    this._replayTimer = null;
  }

  async init() {
    try {
      await this.loader.loadAll();
    } catch (e) {
      console.error('Asset load failed:', e);
      return;
    }
    this.inputManager.bind();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.levelSelect.build();
    document.getElementById('sound').addEventListener('click', () => this.sound.toggle());
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.loadStage(this.currentStage);
    });
    document.getElementById('undoBtn').addEventListener('click', () => this.undo());
    document.getElementById('redoBtn').addEventListener('click', () => this.redo());
    document.getElementById('showMovesBtn').addEventListener('click', () => this.showMoves());
    this._updateUndoButtons();
    this.renderer.startWelcomeAnimation();
    this.state = STATE.WELCOME;
    this._loop();
  }

  _loop() {
    this._update();
    this.renderer.render(this.state, this.board, this.player);
    this._rafId = requestAnimationFrame(() => this._loop());
  }

  _update() {
    if (this.state === STATE.PLAYING && this.board) {
      if (this.board.getFilledHouseCount() >= this.board.initialHouseCount) {
        this.state = STATE.CLEAR;
        this._onClear();
      } else if (!this.board.hasAnyMovableBall()) {
        this.state = STATE.GAMEOVER;
        this.sound.play('success');
      }
      
    }
  }

  _onClear() {
    this.sound.play('clear');
    document.getElementById('showMovesBtn').style.display = this.history.length > 0 ? '' : 'none';
    const stageNum = this.currentStage + 1;
    if (stageNum > this.lastCleared) {
      this.lastCleared = stageNum;
      this._saveNum('pushpush_lastCleared', this.lastCleared);
    }
    this.levelSelect.update();
    this.renderer.startClearTimer(() => this._advanceAfterClear());
  }

  _advanceAfterClear() {
    if (this.currentStage + 1 < TOTAL_STAGES) {
      this.loadStage(this.currentStage + 1);
    } else {
      this.loadStage(0);
    }
  }

  handleInput(input) {
    if (this.state === STATE.WELCOME) {
      this.renderer.stopWelcomeAnimation();
      this.loadStage(this.currentStage);
      this.state = STATE.PLAYING;
      this.sound.play('start');
      return;
    }
    if (this.state === STATE.GAMEOVER) {
      this.loadStage(this.currentStage);
      this.state = STATE.PLAYING;
      
      return;
    }
    if (this.state === STATE.CLEAR) {
      if (input.type === 'confirm') {
        this.renderer.stopClearTimer();
        this._advanceAfterClear();
      }
      return;
    }
    if (this.state === STATE.REPLAY) {
      return;
    }
    if (this.state === STATE.PLAYING && input.type === 'move') {
      const prevGrid = this.board.snapshot();
      const prevRow = this.player.row;
      const prevCol = this.player.col;
      if (this.player.move(input.dir)) {
        this._pushHistory(prevGrid, prevRow, prevCol);
        this.sound.play('move');
        const stageNum = this.currentStage + 1;
        if (stageNum > this.lastPlayed) {
          this.lastPlayed = stageNum;
          this._saveNum('pushpush_lastPlayed', this.lastPlayed);
          this.levelSelect.update();
        }
        
      }
    }
  }

  loadStage(index) {
    if (this.renderer.clearTimer) this.renderer.stopClearTimer();
    if (this.state === STATE.WELCOME) this.renderer.stopWelcomeAnimation();
    this.currentStage = Math.min(index, TOTAL_STAGES - 1);
    this._saveNum('pushpush_currentStage', this.currentStage);
    if (this.currentStage + 1 > this.lastPlayed) {
      this.lastPlayed = this.currentStage + 1;
      this._saveNum('pushpush_lastPlayed', this.lastPlayed);
    }
    this.history = [];
    this.redoStack = [];
    this._updateUndoButtons();
    this._stopReplay();
    document.getElementById('showMovesBtn').style.display = 'none';
    const grid = this.loader.getStageData(this.currentStage);
    this.board = new Board(grid);
    this.player = new Player(this.board);
    this.state = STATE.PLAYING;
    this.levelSelect.update();
    if (this.levelLabel) {
      this.levelLabel.textContent = `Level ${this.currentStage + 1}`;
    }
  }

  _pushHistory(grid, row, col) {
    this.history.push({ grid, row, col });
    this.redoStack = [];
    this._updateUndoButtons();
  }

  undo() {
    if (this.history.length === 0) return;
    const state = this.history.pop();
    this.redoStack.push({
      grid: this.board.snapshot(),
      row: this.player.row,
      col: this.player.col
    });
    this.board.restore(state.grid);
    this.player.row = state.row;
    this.player.col = state.col;
    this._updateUndoButtons();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const state = this.redoStack.pop();
    this.history.push({
      grid: this.board.snapshot(),
      row: this.player.row,
      col: this.player.col
    });
    this.board.restore(state.grid);
    this.player.row = state.row;
    this.player.col = state.col;
    this._updateUndoButtons();
  }

  _updateUndoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.disabled = this.history.length === 0;
    if (redoBtn) redoBtn.disabled = this.redoStack.length === 0;
  }

  showMoves() {
    if (this.history.length === 0) return;
    this._stopReplay();
    this.renderer.stopClearTimer();
    this._finalState = {
      grid: this.board.snapshot(),
      row: this.player.row,
      col: this.player.col
    };
    this._replayIndex = 0;
    const s = this.history[0];
    this.board.restore(s.grid);
    this.player.row = s.row;
    this.player.col = s.col;
    this.state = STATE.REPLAY;
    document.getElementById('showMovesBtn').style.display = 'none';
    this._replayTimer = setInterval(() => this._replayStep(), 150);
  }

  _replayStep() {
    this._replayIndex++;
    if (this._replayIndex < this.history.length) {
      const s = this.history[this._replayIndex];
      this.board.restore(s.grid);
      this.player.row = s.row;
      this.player.col = s.col;
    } else if (this._replayIndex === this.history.length) {
      this.board.restore(this._finalState.grid);
      this.player.row = this._finalState.row;
      this.player.col = this._finalState.col;
    } else {
      this._finishReplay();
    }
  }

  _finishReplay() {
    this._stopReplay();
    this.state = STATE.CLEAR;
    document.getElementById('showMovesBtn').style.display = '';
    this.renderer.startClearTimer(() => this._advanceAfterClear());
  }

  _stopReplay() {
    if (this._replayTimer) {
      clearInterval(this._replayTimer);
      this._replayTimer = null;
    }
  }

  getMaxAccessibleLevel() {
    return Math.max(1, this.lastCleared, this.lastPlayed);
  }

  resize() {
    const container = document.getElementById('content');
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    this.renderer.resize(cw, ch);
    
  }

  _loadNum(key, def) {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? parseInt(v, 10) : def;
    } catch { return def; }
  }

  _saveNum(key, val) {
    try { localStorage.setItem(key, String(val)); } catch {}
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();
});
