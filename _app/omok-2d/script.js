---
permalink: /app/omok-2d/script.js
visible: false
---
class OmokGame {
    constructor(evalParams = null) {
        this.boardSize = 15;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'user'; // 'user' or 'ai'
        this.gameActive = true;
        this.userScore = 0;
        this.aiScore = 0;
        this.roundStartTime = null;
        this.timerInterval = null;

        // AI 전략 관련
        this.aiStrategy = null; // 현재 라운드 전략 이름
        this.aiStrategyFunc = null; // 현재 라운드 전략 함수
        this.aiStrategyList = [
            { name: 'offense', func: this.offenseStrategy.bind(this) },
            { name: 'defense', func: this.defenseStrategy.bind(this) },
            { name: 'center', func: this.centerStrategy.bind(this) },
            { name: 'random', func: this.randomStrategy.bind(this) },
            { name: 'mixed', func: this.mixedStrategy.bind(this) },
        ];
        this.turnCount = 0; // 라운드 내 턴 카운트

        this.evalParams = evalParams || {
            openFour: 10000,
            closedFour: 5000,
            openThree: 1000,
            closedThree: 500,
            openTwo: 100,
            closedTwo: 50,
            doubleThreeBonus: 2000,
            doubleFourBonus: 5000, // 더블 포 보너스
        };

        this.evalBoardCache = new Map(); // 보드 평가 캐시
        this.evalPosCache = new Map();   // 포지션 평가 캐시

        this.patternTable = this.makePatternTable();

        this.lastAIStrategy = null; // 이전 라운드 AI 전략
        this.lastAIRoundWin = null; // 이전 라운드 AI 승리 여부

        this.initializeBoard();
        this.setupEventListeners();
        this.hideMessage();
        this.startRound();
    }

    initializeBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';

        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                gameBoard.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.addEventListener('click', (e) => {
            if (!this.gameActive) {
                this.startRound();
                return;
            }

            const cell = e.target.closest('.cell');
            if (!cell || cell.querySelector('.stone')) return;

            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            this.makeMove(row, col);
        });

        // 게임 메시지 영역 클릭 이벤트 추가
        const gameMessage = document.getElementById('game-message');
        gameMessage.addEventListener('click', () => {
            if (!this.gameActive) {
                this.startRound();
            }
        });

        // 모바일 줌/스크롤 처리
        const boardContainer = document.querySelector('.board-container');
        let initialDistance = 0;
        let currentScale = 1;

        boardContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );
            }
        });

        boardContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );
                const scale = Math.min(Math.max(currentDistance / initialDistance * currentScale, 0.5), 2);
                gameBoard.style.transform = `scale(${scale})`;
            }
        });

        boardContainer.addEventListener('touchend', () => {
            currentScale = parseFloat(gameBoard.style.transform.replace('scale(', '').replace(')', '')) || 1;
        });
    }

    startRound() {
        // 게임 보드 초기화
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        this.initializeBoard();
        
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.gameActive = true;
        this.currentPlayer = this.userScore >= this.aiScore ? 'user' : 'ai';
        this.updateStatus();
        this.startTimer();
        this.hideMessage();
        this.chooseAIStrategy(); // 라운드마다 전략 선택
        if (this.currentPlayer === 'ai') {
            this.makeAIMove();
        }
    }

    makeMove(row, col) {
        if (!this.gameActive || this.board[row][col]) return;
        this.board[row][col] = this.currentPlayer;
        this.placeStone(row, col);
        this.lastMoveRow = row;
        this.lastMoveCol = col;
        if (this.checkWin(row, col)) {
            this.handleWin();
            return;
        }
        this.currentPlayer = this.currentPlayer === 'user' ? 'ai' : 'user';
        this.updateStatus();
        if (this.currentPlayer === 'ai') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    makeAIMove() {
        this.turnCount++;
        let move = null;
        // 혼합 전략: 매 턴마다 전략을 섞어서 사용
        if (this.aiStrategy === 'mixed') {
            // 60% 공격, 20% 수비, 10% 중앙, 10% 랜덤
            const r = Math.random();
            if (r < 0.6) move = this.offenseStrategy();
            else if (r < 0.8) move = this.defenseStrategy();
            else if (r < 0.9) move = this.centerStrategy();
            else move = this.randomStrategy();
            console.log(`[AI] 혼합 전략(턴별): ${move && move.strategy ? move.strategy : '선택'}`);
        } else if (this.aiStrategy === 'random') {
            // 랜덤 전략: 30% 확률로만 랜덤, 나머지는 공격
            if (Math.random() < 0.3) {
                move = this.randomStrategy();
                console.log('[AI] 랜덤 전략(턴별)');
            } else {
                move = this.offenseStrategy();
                console.log('[AI] 랜덤 전략(공격 대체)');
            }
        } else {
            move = this.aiStrategyFunc();
            console.log(`[AI] ${this.aiStrategy} 전략`);
        }
        if (move && move.row !== undefined && move.col !== undefined) {
            this.makeMove(move.row, move.col);
        } else if (move) {
            // 전략 함수가 좌표만 반환한 경우
            this.makeMove(move.row, move.col);
        } else {
            // fallback
            const fallback = this.findBestPosition();
            if (fallback) this.makeMove(fallback.row, fallback.col);
        }
    }

    findFourInRow(player) {
        // 모든 빈 칸에 대해, 해당 칸에 player의 돌을 두었을 때 5목이 완성되는지 체크
        const positions = [];
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== null) continue;
                this.board[i][j] = player;
                if (this.checkWin(i, j, player)) {
                    positions.push({ row: i, col: j });
                }
                this.board[i][j] = null;
            }
        }
        return positions.length > 0 ? positions : null;
    }

    findThreeInRow(player) {
        const directions = [
            [[0, 1], [0, -1]], // 가로
            [[1, 0], [-1, 0]], // 세로
            [[1, 1], [-1, -1]], // 대각선
            [[1, -1], [-1, 1]] // 반대 대각선
        ];

        let blockPositions = [];

        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== null) continue;

                for (const direction of directions) {
                    let count = 0;
                    let emptyEnds = 0;
                    let emptyPositions = [];

                    // 양방향 확인
                    for (const [dx, dy] of direction) {
                        let r = i + dx;
                        let c = j + dy;
                        let consecutive = 0;

                        while (
                            r >= 0 && r < this.boardSize &&
                            c >= 0 && c < this.boardSize &&
                            this.board[r][c] === player
                        ) {
                            consecutive++;
                            r += dx;
                            c += dy;
                        }

                        // 빈 공간 확인
                        if (
                            r >= 0 && r < this.boardSize &&
                            c >= 0 && c < this.boardSize &&
                            this.board[r][c] === null
                        ) {
                            emptyEnds++;
                            emptyPositions.push({ row: r, col: c });
                        }

                        count += consecutive;
                    }

                    // 3목이고 양 끝 중 하나라도 비어있으면 그 위치들 모두 저장
                    if (count === 3 && emptyEnds >= 1) {
                        blockPositions.push(...emptyPositions);
                    }
                }
            }
        }
        // 중복 제거
        const uniqueBlocks = blockPositions.filter((pos, idx, arr) =>
            arr.findIndex(p => p.row === pos.row && p.col === pos.col) === idx
        );
        return uniqueBlocks.length > 0 ? uniqueBlocks : null;
    }

    findBestPosition() {
        let bestScore = -Infinity;
        let bestMove = null;

        // 모든 빈 칸에 대해 점수 계산
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    const score = this.evaluatePosition(i, j, 'ai');
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row: i, col: j };
                    }
                }
            }
        }

        return bestMove;
    }

    evaluatePosition(row, col, player = 'ai') {
        // 4방향, 5~6칸 라인 패턴을 문자열로 변환해 테이블에서 점수 반환
        let score = 0;
        const dirs = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];
        const opp = player === 'ai' ? 'user' : 'ai';
        for (const [dx, dy] of dirs) {
            let line = '';
            // 5칸(자신 기준 -2~+2)
            for (let k = -2; k <= 2; k++) {
                const r = row + dx * k;
                const c = col + dy * k;
                if (r < 0 || r >= this.boardSize || c < 0 || c >= this.boardSize) {
                    line += 'x'; // 경계
                } else if (this.board[r][c] === player) {
                    line += '1';
                } else if (this.board[r][c] === opp) {
                    line += '2';
                } else {
                    line += '0';
                }
            }
            // 5칸, 6칸 패턴 모두 체크
            for (let i = 0; i <= line.length - 5; i++) {
                const pat5 = line.slice(i, i + 5);
                if (this.patternTable[pat5]) score += this.patternTable[pat5];
            }
            for (let i = 0; i <= line.length - 6; i++) {
                const pat6 = line.slice(i, i + 6);
                if (this.patternTable[pat6]) score += this.patternTable[pat6];
            }
        }
        return score;
    }

    placeStone(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const stone = document.createElement('div');
        stone.className = `stone ${this.currentPlayer === 'user' ? 'black' : 'white'}`;
        cell.appendChild(stone);
    }

    checkWin(row, col, playerOverride = null) {
        const player = playerOverride || this.currentPlayer;
        const directions = [
            [[0, 1], [0, -1]], // 가로
            [[1, 0], [-1, 0]], // 세로
            [[1, 1], [-1, -1]], // 대각선
            [[1, -1], [-1, 1]] // 반대 대각선
        ];
        for (const direction of directions) {
            let count = 1;
            let blocked = 0;
            let winCoords = [[row, col]];
            for (const [dx, dy] of direction) {
                let r = row + dx;
                let c = col + dy;
                let consecutive = 0;
                let tempCoords = [];
                while (
                    r >= 0 && r < this.boardSize &&
                    c >= 0 && c < this.boardSize &&
                    this.board[r][c] === player
                ) {
                    consecutive++;
                    tempCoords.push([r, c]);
                    r += dx;
                    c += dy;
                }
                if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] !== null) {
                    blocked++;
                }
                count += consecutive;
                winCoords = winCoords.concat(tempCoords);
            }
            if (count === 5 && blocked < 2) {
                return winCoords;
            }
        }
        return false;
    }

    handleWin() {
        this.gameActive = false;
        this.stopTimer();
        let winCoords = null;
        // 마지막 수로 승리한 5목 좌표 추적
        if (this.lastMoveRow !== undefined && this.lastMoveCol !== undefined) {
            const res = this.checkWin(this.lastMoveRow, this.lastMoveCol);
            if (Array.isArray(res)) winCoords = res;
        }
        this.winCoords = winCoords;
        const isUserWin = this.currentPlayer === 'user';
        if (isUserWin) {
            this.userScore++;
            this.lastAIRoundWin = false;
        } else {
            this.aiScore++;
            this.lastAIRoundWin = true;
        }
        this.lastAIStrategy = this.aiStrategy;
        this.updateStatus();
        this.showMessage(`${isUserWin ? '유저' : 'AI'} 승리!`, isUserWin);
        this.redrawBoard(isUserWin); // 승리 강조
    }

    updateStatus() {
        const userScore = this.userScore;
        const aiScore = this.aiScore;
        const turnElem = document.getElementById('current-turn');
        if (turnElem) turnElem.textContent = this.currentPlayer === 'user' ? '유저' : 'AI';
        const userScoreElem = document.getElementById('user-score');
        if (userScoreElem) userScoreElem.textContent = userScore;
        const aiScoreElem = document.getElementById('ai-score');
        if (aiScoreElem) aiScoreElem.textContent = aiScore;
        // AI 로딩 스피너 표시
        const spinner = document.getElementById('ai-loading-spinner');
        if (spinner) {
            if (this.currentPlayer === 'ai' && this.gameActive) {
                spinner.classList.remove('hidden');
            } else {
                spinner.classList.add('hidden');
            }
        }
    }

    startTimer() {
        this.roundStartTime = Date.now();
        this.updateTimer();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.roundStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('round-timer').textContent = `${minutes}:${seconds}`;
    }

    showMessage(message, isUserWin = false) {
        const messageElement = document.getElementById('game-message');
        const messageContent = messageElement.querySelector('.message-content');
        messageContent.textContent = message;
        if (isUserWin) {
            messageContent.classList.add('user-win-message');
        } else {
            messageContent.classList.remove('user-win-message');
        }
        messageElement.classList.remove('hidden');
    }

    hideMessage() {
        const messageElement = document.getElementById('game-message');
        messageElement.classList.add('hidden');
    }

    // 외부에서 보드 상태를 입력받아 AI가 대응하도록 하는 함수
    setBoardState(newBoard, nextPlayer = 'ai') {
        // newBoard: 2차원 배열, 'user', 'ai', 또는 null 값
        this.board = newBoard.map(row => row.slice());
        this.gameActive = true;
        this.currentPlayer = nextPlayer;
        this.updateStatus();
        this.redrawBoard();
        if (this.currentPlayer === 'ai') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    // 현재 board 배열을 화면에 반영
    redrawBoard(isUserWin = false) {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        let winSet = null;
        if (this.winCoords && Array.isArray(this.winCoords)) {
            winSet = new Set(this.winCoords.map(([r, c]) => `${r},${c}`));
        }
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                if (this.board[i][j]) {
                    const stone = document.createElement('div');
                    stone.className = `stone ${this.board[i][j] === 'user' ? 'black' : 'white'}`;
                    if (winSet && winSet.has(`${i},${j}`)) {
                        stone.classList.add('stone-win');
                        if (isUserWin && this.board[i][j] === 'user') {
                            stone.classList.add('user-win');
                        }
                    }
                    cell.appendChild(stone);
                }
                gameBoard.appendChild(cell);
            }
        }
    }

    // 라운드 시작 시 AI 전략 선택
    chooseAIStrategy() {
        if (this.lastAIRoundWin && this.lastAIStrategy) {
            // AI가 이겼으면 이전 전략 유지
            this.aiStrategy = this.lastAIStrategy;
            this.aiStrategyFunc = this.aiStrategyList.find(s => s.name === this.aiStrategy).func;
            this.turnCount = 0;
            console.log(`[AI] 이번 라운드 전략(유지): ${this.aiStrategy}`);
        } else {
            // AI가 졌으면 랜덤 전략 선택
            const idx = Math.floor(Math.random() * this.aiStrategyList.length);
            this.aiStrategy = this.aiStrategyList[idx].name;
            this.aiStrategyFunc = this.aiStrategyList[idx].func;
            this.turnCount = 0;
            console.log(`[AI] 이번 라운드 전략(랜덤): ${this.aiStrategy}`);
        }
    }

    // AI가 전략에 따라 수를 두는 함수
    offenseStrategy() {
        return this.findBestMoveAlphaBeta(this.getDynamicDepth());
    }

    // 수비 전략: 상대 4목/3목 차단 우선
    defenseStrategy() {
        return this.findBestMoveAlphaBeta(this.getDynamicDepth());
    }

    // 중앙 선호 전략
    centerStrategy() {
        return this.findBestMoveAlphaBeta(this.getDynamicDepth());
    }

    // 랜덤 전략 (단, 라운드 내내 사용하지 않고 일부 턴만)
    randomStrategy() {
        const empty = [];
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    empty.push({ row: i, col: j, strategy: '랜덤' });
                }
            }
        }
        if (empty.length === 0) return null;
        return empty[Math.floor(Math.random() * empty.length)];
    }

    // 혼합 전략 (매 턴마다 다른 전략을 섞어서 사용)
    mixedStrategy() {
        // 실제 혼합은 makeAIMove에서 처리
        return this.offenseStrategy();
    }

    // 알파-베타 탐색 기반 최적 수 찾기 (깊이 제한)
    findBestMoveAlphaBeta(depth = 3) {
        // 1. 즉시 승리/패배(오픈4, 더블쓰리 등) 우선 처리
        const winMove = this.findImmediateWin('ai');
        if (winMove) return { ...winMove, strategy: '즉시승리' };
        const blockMove = this.findImmediateWin('user');
        if (blockMove) return { ...blockMove, strategy: '즉시패배차단' };
        // 2. 후보 수를 패턴 점수로 정렬
        let candidates = this.getCandidateMoves();
        candidates = candidates.map(pos => {
            return { ...pos, score: this.evaluatePosition(pos.row, pos.col, 'ai') };
        }).sort((a, b) => b.score - a.score);
        let bestScore = -Infinity;
        let bestMove = null;
        for (const {row: i, col: j} of candidates) {
            this.board[i][j] = 'ai';
            let score = this.alphaBeta(depth - 1, -Infinity, Infinity, false);
            this.board[i][j] = null;
            if (score > bestScore) {
                bestScore = score;
                bestMove = { row: i, col: j, strategy: '알파베타' };
            }
        }
        return bestMove;
    }

    // 알파-베타 재귀
    alphaBeta(depth, alpha, beta, maximizingPlayer) {
        const hash = this.getBoardHash() + `:${depth}:${maximizingPlayer}`;
        if (this.evalBoardCache.has(hash)) return this.evalBoardCache.get(hash);
        if (depth === 0 || this.isTerminal()) {
            const val = this.evaluateBoard();
            this.evalBoardCache.set(hash, val);
            return val;
        }
        const candidates = this.getCandidateMoves();
        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const {row: i, col: j} of candidates) {
                this.board[i][j] = 'ai';
                let evalScore = this.alphaBeta(depth - 1, alpha, beta, false);
                this.board[i][j] = null;
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            this.evalBoardCache.set(hash, maxEval);
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const {row: i, col: j} of candidates) {
                this.board[i][j] = 'user';
                let evalScore = this.alphaBeta(depth - 1, alpha, beta, true);
                this.board[i][j] = null;
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            this.evalBoardCache.set(hash, minEval);
            return minEval;
        }
    }

    // 현재 보드가 종료 상태인지(승리/무승부) 판정
    isTerminal() {
        // 승리 체크
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== null) {
                    if (this.checkWin(i, j)) return true;
                }
            }
        }
        // 무승부(빈 칸 없음)
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) return false;
            }
        }
        return true;
    }

    // 전체 보드 평가 (ai - user)
    evaluateBoard() {
        const hash = this.getBoardHash();
        if (this.evalBoardCache.has(hash)) return this.evalBoardCache.get(hash);
        let aiScore = 0;
        let userScore = 0;
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) continue;
                if (this.board[i][j] === 'ai') aiScore += this.evaluatePosition(i, j, 'ai');
                else if (this.board[i][j] === 'user') userScore += this.evaluatePosition(i, j, 'user');
            }
        }
        const score = aiScore - userScore;
        this.evalBoardCache.set(hash, score);
        return score;
    }

    // 기존 돌 주변 2칸 이내만 후보로 간주
    getCandidateMoves() {
        const range = 2;
        const candidates = new Set();
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== null) {
                    for (let dx = -range; dx <= range; dx++) {
                        for (let dy = -range; dy <= range; dy++) {
                            const ni = i + dx;
                            const nj = j + dy;
                            if (
                                ni >= 0 && ni < this.boardSize &&
                                nj >= 0 && nj < this.boardSize &&
                                this.board[ni][nj] === null
                            ) {
                                candidates.add(ni + ',' + nj);
                            }
                        }
                    }
                }
            }
        }
        // 만약 돌이 하나도 없으면 중앙부터 시작
        if (candidates.size === 0) {
            const center = Math.floor(this.boardSize / 2);
            return [{ row: center, col: center }];
        }
        return Array.from(candidates).map(s => {
            const [row, col] = s.split(',').map(Number);
            return { row, col };
        });
    }

    // 돌 개수에 따라 탐색 깊이 자동 조절
    getDynamicDepth() {
        let stones = 0;
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== null) stones++;
            }
        }
        if (stones < 10) return 3;
        if (stones < 30) return 2;
        return 1;
    }

    // 즉시 승리/패배(오픈4, 더블쓰리 등) 위치 찾기
    findImmediateWin(player) {
        // 1. 4목(한 수로 5목 완성)
        const four = this.findFourInRow(player);
        if (four && four.length > 0) return four[0];
        // 2. 더블쓰리(두 군데 이상 3목 오픈)
        const threes = this.findThreeInRow(player);
        if (threes && threes.length > 1) return threes[0];
        return null;
    }

    // 보드 상태를 문자열로 해시 (간단/빠름)
    getBoardHash() {
        let s = '';
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) s += '0';
                else if (this.board[i][j] === 'ai') s += '1';
                else s += '2';
            }
        }
        return s;
    }

    makePatternTable() {
        // 5~6칸 패턴별 점수 룩업 테이블 (간단 버전, 필요시 확장)
        // '11111': 99999999, '011110': 50000, '01111': 5000, ...
        const table = {};
        table['11111'] = 99999999;
        table['011110'] = 50000;
        table['01111'] = 5000;
        table['11110'] = 5000;
        table['011111'] = 5000;
        table['10111'] = 5000;
        table['11011'] = 5000;
        table['11101'] = 5000;
        table['001110'] = 500;
        table['011100'] = 500;
        table['00111'] = 200;
        table['01110'] = 200;
        table['010110'] = 200;
        table['011010'] = 200;
        table['0110'] = 50;
        table['01011'] = 50;
        table['11010'] = 50;
        table['10110'] = 50;
        // 필요시 더 추가
        return table;
    }
}

// 게임 시작
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        new OmokGame();
    });
}

// 시뮬레이션/테스트용 OmokSimulator 클래스
class OmokSimulator {
    constructor(numGames = 100) {
        this.numGames = numGames;
        this.userWins = 0;
        this.aiWins = 0;
        this.draws = 0;
        this.userStrategyList = [
            'offense', 'defense', 'center', 'random', 'mixed'
        ];
        this.aiStrategyList = [
            'offense', 'defense', 'center', 'random', 'mixed'
        ];
    }

    async run() {
        for (let i = 0; i < this.numGames; i++) {
            const userStrategy = this.randomStrategy(this.userStrategyList);
            const aiStrategy = this.randomStrategy(this.aiStrategyList);
            const result = this.runSingleGame(userStrategy, aiStrategy);
            if (result === 'user') this.userWins++;
            else if (result === 'ai') this.aiWins++;
            else this.draws++;
        }
        console.log(`User 승률: ${(this.userWins/this.numGames*100).toFixed(1)}%`);
        console.log(`AI 승률: ${(this.aiWins/this.numGames*100).toFixed(1)}%`);
        console.log(`무승부: ${(this.draws/this.numGames*100).toFixed(1)}%`);
    }

    randomStrategy(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    runSingleGame(userStrategyName, aiStrategyName) {
        // OmokGame 인스턴스를 headless로 생성
        const game = new OmokGame(this.aiEvalParams);
        // 화면/이벤트/타이머 등 무시
        game.hideMessage = () => {};
        game.showMessage = () => {};
        game.updateStatus = () => {};
        game.startTimer = () => {};
        game.stopTimer = () => {};
        game.placeStone = () => {};
        // 전략 강제 지정
        game.chooseAIStrategy = function() {
            this.aiStrategy = aiStrategyName;
            this.aiStrategyFunc = this.aiStrategyList.find(s => s.name === aiStrategyName).func;
            this.turnCount = 0;
        };
        // 유저도 AI 전략 사용
        let winner = null;
        let turn = 0;
        game.startRound();
        while (game.gameActive) {
            if (game.currentPlayer === 'user') {
                // 유저 전략 함수
                const stratFunc = game.aiStrategyList.find(s => s.name === userStrategyName).func;
                let move = null;
                if (userStrategyName === 'mixed') {
                    const r = Math.random();
                    if (r < 0.6) move = game.offenseStrategy();
                    else if (r < 0.8) move = game.defenseStrategy();
                    else if (r < 0.9) move = game.centerStrategy();
                    else move = game.randomStrategy();
                } else if (userStrategyName === 'random') {
                    if (Math.random() < 0.3) move = game.randomStrategy();
                    else move = game.offenseStrategy();
                } else {
                    move = stratFunc();
                }
                if (move && move.row !== undefined && move.col !== undefined) {
                    game.board[move.row][move.col] = 'user';
                    // 승리 체크
                    if (game.checkWin(move.row, move.col)) {
                        winner = 'user';
                        break;
                    }
                    game.currentPlayer = 'ai';
                } else {
                    // fallback
                    const fallback = game.findBestPosition();
                    if (fallback) {
                        game.board[fallback.row][fallback.col] = 'user';
                        if (game.checkWin(fallback.row, fallback.col)) {
                            winner = 'user';
                            break;
                        }
                        game.currentPlayer = 'ai';
                    } else {
                        break; // 무승부
                    }
                }
            } else {
                // AI 턴 (기존 makeAIMove 로직 활용)
                let move = null;
                if (aiStrategyName === 'mixed') {
                    const r = Math.random();
                    if (r < 0.6) move = game.offenseStrategy();
                    else if (r < 0.8) move = game.defenseStrategy();
                    else if (r < 0.9) move = game.centerStrategy();
                    else move = game.randomStrategy();
                } else if (aiStrategyName === 'random') {
                    if (Math.random() < 0.3) move = game.randomStrategy();
                    else move = game.offenseStrategy();
                } else {
                    move = game.aiStrategyFunc();
                }
                if (move && move.row !== undefined && move.col !== undefined) {
                    game.board[move.row][move.col] = 'ai';
                    if (game.checkWin(move.row, move.col)) {
                        winner = 'ai';
                        break;
                    }
                    game.currentPlayer = 'user';
                } else {
                    const fallback = game.findBestPosition();
                    if (fallback) {
                        game.board[fallback.row][fallback.col] = 'ai';
                        if (game.checkWin(fallback.row, fallback.col)) {
                            winner = 'ai';
                            break;
                        }
                        game.currentPlayer = 'user';
                    } else {
                        break; // 무승부
                    }
                }
            }
            turn++;
            if (turn > 225) break; // 무한루프 방지
        }
        return winner;
    }
}

// 사용 예시 (콘솔에서 실행)
// const sim = new OmokSimulator(100);
// sim.run();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OmokGame, OmokSimulator };
} 