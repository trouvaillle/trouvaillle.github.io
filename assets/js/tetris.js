window.onload = () => {
    class AudioController {
        constructor() {
            this.bgMusicController = undefined;
            this.sfxController = undefined;
            this.bgMusicPlaying = false;
            this.muted = true;
            this.sfxOnly = false;
            this.soundIconElement = document.querySelector("#soundIcon");
            this.constructSfxController();
            this.initAudioContext();
        }

        initAudioContext() {
            if ('AudioContext' in window) {
                this.audioContext = new AudioContext();
            } else if ('webkitAudioContext' in window) {
                this.audioContext = new webkitAudioContext();
            } else {
                this.audioContext = null;
            }
        }

        constructSfxController() {
            if (this.sfxController === undefined) {
                const sfxList = [
                    ['ROTATE', '../assets/media/se_game_rotate.mp3', 1.0],
                    ['LANDING', '../assets/media/se_game_landing.mp3', 1.0],
                    ['COMPLETE', '../assets/media/se_game_double.mp3', 1.0],
                    ['COMPACT', '../assets/media/se_game_ko2.mp3', 1.0],
                    ['COMBOS', '../assets/media/se_game_triple.mp3', 1.0],
                    ['MOVE', '../assets/media/se_game_move.mp3', 1.0]
                ];
                this.sfxController = {};

                for (let sfx of sfxList) {
                    let controller = document.createElement("audio");
                    controller.autoplay = false;
                    controller.loop = false;
                    controller.volume = sfx[2];
                    controller.src = sfx[1];
                    controller.source = null;
                    controller.load();
                    this.sfxController[sfx[0]] = controller;

                    let request = new XMLHttpRequest();
                    request.open('GET', sfx[1], true);
                    request.responseType = 'arraybuffer';
                    request.addEventListener('load', (event) => {
                        var request = event.target;
                        var source = this.audioContext.createBufferSource();
                        source.buffer = this.audioContext.createBuffer(request.response, false);
                        controller.source = source;
                    }, false);
                    request.send();
                }
            }
        }

        playSoundEffect(type) {
            if (this.sfxController === undefined ||
                this.muted == true ||
                !(type in this.sfxController)) {
                return;
            }
            if (getMobileOperatingSystem() == "iOS") {
                return;
            }
            if (this.audioContext != null && this.sfxController[type].source != null) {
                this.sfxController[type].source.noteOn(0);
                this.sfxController[type].source.connect(this.audioContext.destination);
            } else {
                this.sfxController[type].pause();
                this.sfxController[type].currentTime = 0;
                this.sfxController[type].play().then();
            }
        }

        async startMusic() {
            if (this.bgMusicController !== undefined) {
                await this.bgMusicController.play();
            } else {
                let source = "../assets/media/tetris-soundtrack.mp3";
                this.bgMusicController = document.createElement("audio");
                this.bgMusicController.volume = 1;
                this.bgMusicController.autoplay = true;
                this.bgMusicController.loop = true;
                this.bgMusicController.addEventListener(
                    "load",
                    async function () {
                        await this.bgMusicController.play();
                    },
                    true
                );
                this.bgMusicController.src = source;
                this.bgMusicController.load();
            }
            this.muted = false;
            this.bgMusicPlaying = true;
            this.soundIconElement.className = "fa-solid fa-volume-high";
        }

        stopMusic() {
            if (this.bgMusicController !== undefined) {
                this.bgMusicController.pause();
                this.bgMusicController.currentTime = 0;
            }
            this.bgMusicPlaying = false;
        }

        pauseMusic() {
            if (this.bgMusicController !== undefined) {
                this.bgMusicController.pause();
            }
            this.bgMusicPlaying = false;
        }

        setMute(value) {
            this.muted = value;
            if (this.bgMusicPlaying && value) {
                this.pauseMusic();
            }
            if (value) {
                this.soundIconElement.className = "fa-solid fa-volume-xmark";
            } else {
                if (this.sfxOnly) {
                    this.soundIconElement.className = "fa-solid fa-volume-low";
                } else {
                    this.soundIconElement.className = "fa-solid fa-volume-high";
                }
            }
        }

        async toggleSound() {
            if (this.bgMusicController === undefined || !this.bgMusicPlaying) {
                if (this.sfxOnly) {
                    this.sfxOnly = false;
                    await this.startMusic();
                } else {
                    this.sfxOnly = true;
                    this.setMute(false);
                }
            } else {
                this.sfxOnly = false;
                this.setMute(true);
            }
        }
    }

    const appListUrl = "https://trouvaillle.github.io/app";

    const backElement = document.querySelector("#back");
    const soundElement = document.querySelector("#sound");
    const pauseElement = document.querySelector("#pause");
    const pauseIconElement = document.querySelector("#pauseIcon");

    let buttonLeft = document.querySelector('#buttonLeft');
    let buttonRight = document.querySelector('#buttonRight');
    let buttonUp = document.querySelector('#buttonUp');
    let buttonDown = document.querySelector('#buttonDown');
    let contentElement = document.querySelector('#content');
    let boardElement = document.querySelector('#board');
    let scoreElement = document.querySelector('#score');
    let linesElement = document.querySelector('#lines');
    let timeElement = document.querySelector('#time');
    let overlayElement = document.querySelector('#overlay');
    let nextBlockPanelElement = document.querySelector('#next-block-panel');
    let informationPanelElement = document.querySelector('#information-panel');

    let gameCurrentState = 'PAUSED';
    let gameNextState = 'PAUSED';

    let gameIntervalHandler = null;
    let moveBlockIntervalHandler = null;
    let showCombosHandler = null;
    let completeLinesIntervalHandler = null;
    let completeLinesTimeOffset = 0;
    let completedLines = [];

    let gameManualDownDelay = 100; // 120;
    let gameIntervalDelay = 550;
    let gameNextButton = null;

    const blockSize = 4;

    let score = 0;
    let lines = 0;
    let combos = -1;
    let stackCount = 0;
    let startTime = null;
    let playing = false;
    let boardWidth = 10;
    let boardHeight = 20;
    let board = [];

    let fixedBlocks = [];
    let currentBlock;
    let currentBlockOffset;
    let nextBlock;
    let nextBlockCandidates = [];

    let cellSize = 0;
    let cells;
    let rows;
    let columns;

    let nextBlockPanelCells;

    let audioController = new AudioController();
    applyPreventDefault([buttonLeft, buttonRight, buttonUp, buttonDown, contentElement, boardElement]);
    assignListeners();
    window.onresize = () => {
        boardElement.innerHTML = "";
        nextBlockPanelElement.innerHTML = "";
        initBoard();
        render();
    }
    init();
    render();
    proceed();

    function assignListeners() {
        let leftHandler = (event) => {
            event.preventDefault();
            gameNextButton = 'LEFT';
            proceed();
        };
        let rightHandler = (event) => {
            event.preventDefault();
            gameNextButton = 'RIGHT';
            proceed();
        };
        let upHandler = (event) => {
            event.preventDefault();
            gameNextButton = 'UP';
            proceed();
        };
        let downHandler = (event) => {
            event.preventDefault();
            gameNextButton = 'DOWN';
            proceed();
        }
        let resetHandler = (event) => {
            event.preventDefault();
            gameNextButton = null;
            if (moveBlockIntervalHandler != null) {
                clearInterval(moveBlockIntervalHandler);
                moveBlockIntervalHandler = null;
            }
        }
        let toggleSound = () => {
            if (gameCurrentState == "PLAYING") {
                audioController.toggleSound();
            } else {
                if (audioController.muted) {
                    audioController.sfxOnly = true;
                    audioController.setMute(false);
                } else {
                    if (audioController.sfxOnly) {
                        audioController.sfxOnly = false;
                        audioController.setMute(false);
                    } else {
                        audioController.setMute(true);
                    }
                }
            }
        };

        buttonLeft.addEventListener('mousedown', leftHandler);
        buttonLeft.addEventListener('pointerdown', leftHandler);
        buttonLeft.addEventListener('mouseup', resetHandler);
        buttonLeft.addEventListener('pointerup', resetHandler);

        buttonRight.addEventListener('mousedown', rightHandler);
        buttonRight.addEventListener('pointerdown', rightHandler);
        buttonRight.addEventListener('mouseup', resetHandler);
        buttonRight.addEventListener('pointerup', resetHandler);

        buttonUp.addEventListener('mousedown', upHandler);
        buttonUp.addEventListener('pointerdown', upHandler);
        buttonUp.addEventListener('mouseup', resetHandler);
        buttonUp.addEventListener('pointerup', resetHandler);

        buttonDown.addEventListener('mousedown', downHandler);
        buttonDown.addEventListener('pointerdown', downHandler);
        buttonDown.addEventListener('mouseup', resetHandler);
        buttonDown.addEventListener('pointerup', resetHandler);

        window.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.altKey || event.shiftKey) {
                return;
            }
            switch (event.key) {
                case 'ArrowLeft':
                case 'a':
                    leftHandler(event);
                    break;
                case 'ArrowRight':
                case 'd':
                    rightHandler(event);
                    break;
                case 'ArrowUp':
                case 'w':
                    upHandler(event);
                    break;
                case 'ArrowDown':
                case 's':
                    downHandler(event);
                    break;
                case 'm':
                    toggleSound();
                    break;
                default:
                    break;
            }
        });

        window.addEventListener('keyup', (event) => {
            if (event.ctrlKey || event.altKey || event.shiftKey) {
                return;
            }
            switch (event.key) {
                case 'ArrowLeft':
                case 'a':
                case 'ArrowRight':
                case 'd':
                case 'ArrowUp':
                case 'w':
                case 'ArrowDown':
                case 's':
                    resetHandler(event);
                    break;
                default:
                    break;
            }
        });

        backElement.addEventListener("click", (_) => {
            window.location.href = appListUrl;
        });

        soundElement.addEventListener("click", (event) => {
            event.preventDefault();
            toggleSound();
        });

        pauseElement.addEventListener('click', (event) => {
            event.preventDefault();
            toggleGame();
        });

        document.addEventListener("visibilitychange", (event) => {
            switch (document.visibilityState) {
                case "hidden":
                    if (!audioController.muted) {
                        audioController.pauseMusic();
                    }
                    if (gameCurrentState == "PLAYING" || gameCurrentState == "PAUSED") {
                        pauseGame();
                    }
                    console.log("hidden");
                    break;
                case "visible":
                    if (gameCurrentState == "PLAYING" && !audioController.muted && !audioController.sfxOnly) {
                        audioController.startMusic();
                    }
                    if (gameCurrentState == "PLAYING" || gameCurrentState == "PAUSED") {
                        resumeGame();
                    }
                    console.log("visible");
                    /* if (game !== undefined && !game.gameOver) {
                      game.resume();
                      if (!audioController.muted) {
                        audioController.startMusic();
                      }
                    } */
                    break;
            }
        });
    }

    function applyPreventDefault(element) {
        if (Array.isArray(element)) {
            for (i of element) {
                i.addEventListener('click', (event) => {
                    event.preventDefault();
                });
                i.addEventListener('dblclick', (event) => {
                    event.preventDefault();
                });
                /* i.addEventListener('touchstart', (event) => {
                    event.preventDefault();
                });
                i.addEventListener('touchend', (event) => {
                    event.preventDefault();
                }); */
            }
        } else {
            element.addEventListener('click', (event) => {
                event.preventDefault();
            });
            element.addEventListener('dblclick', (event) => {
                event.preventDefault();
            });
            /* element.addEventListener('touchstart', (event) => {
                event.preventDefault();
            });
            element.addEventListener('touchend', (event) => {
                event.preventDefault();
            }); */
        }
    }

    function init() {
        if (gameIntervalHandler != null) {
            clearInterval(gameIntervalHandler);
            gameIntervalHandler = null;
        }
        score = 0;
        lines = 0;
        combos = -1;
        stackCount = 0;
        startTime = null;
        playing = false;
        boardWidth = 10;
        boardHeight = 20;

        fixedBlocks = get2DArrayWithZeros(boardHeight, boardWidth);
        board = get2DArrayWithZeros(boardHeight, boardWidth);

        currentBlock = generateBlock();
        resetCurrentBlockOffset();
        nextBlockCandidates = [0, 1, 2, 3, 4, 5, 6];
        nextBlock = generateBlock();
        initBoard();
    }

    function get2DArrayWithZeros(firstDimension, secondDimension) {
        let result = [];
        for (let y = 0; y < firstDimension; ++y) {
            let tempRows = [];
            for (let x = 0; x < secondDimension; ++x) {
                tempRows.push([0]);
            }
            result.push(tempRows);
        }
        return result;
    }

    function proceed() {
        switch (gameCurrentState) {
            case 'PLAYING':
                gameNextState = 'PLAYING';
                if (gameNextButton != null && gameNextButton.trim().length != 0) {
                    if (moveBlockIntervalHandler == null) {
                        moveBlock();
                        moveBlockIntervalHandler = setInterval(moveBlock, gameManualDownDelay);
                    }
                } else {
                    if (moveBlockIntervalHandler != null) {
                        clearInterval(moveBlockIntervalHandler);
                        moveBlockIntervalHandler = null;
                    }
                }
                break;
            case 'PAUSED':
                if (gameNextButton != null && gameNextButton.trim().length != 0) {
                    resumeGame();
                } else {
                    gameNextState = 'PAUSED';
                }
                break;
            case 'GAMEOVER':
                if (audioController != null) {
                    audioController.stopMusic();
                }
                if (gameNextButton != null && gameNextButton.trim().length != 0) {
                    init();
                    resumeGame();
                } else {
                    gameNextState = 'GAMEOVER';
                }
                break;
            case 'COMPLETE_LINES':
                gameNextState = 'COMPLETE_LINES';
                break;
            default:
                break;
        }
        // console.log(`${gameCurrentState} -> ${gameNextState}`);
        gameCurrentState = gameNextState;
    }

    function resumeGame() {
        if (startTime == null) {
            startTime = new Date();
        }
        if (audioController != null && !audioController.muted && !audioController.sfxOnly) {
            audioController.startMusic();
        }
        if (gameNextButton != null && gameNextButton.trim().length != 0) {
            if (moveBlockIntervalHandler == null) {
                moveBlock();
                moveBlockIntervalHandler = setInterval(moveBlock, gameManualDownDelay);
            }
        } else {
            if (moveBlockIntervalHandler != null) {
                clearInterval(moveBlockIntervalHandler);
                moveBlockIntervalHandler = null;
            }
        }
        overlayElement.classList.remove('blur-effect');
        overlayElement.innerHTML = '';
        gameIntervalHandler = setInterval(gameloop, gameIntervalDelay);
        pauseIconElement.classList.remove('fa-play');
        pauseIconElement.classList.add('fa-pause');
        gameCurrentState = 'PLAYING';
        gameNextState = 'PLAYING';
        render();
    }

    function pauseGame() {
        if (gameIntervalHandler != null) {
            clearInterval(gameIntervalHandler);
            gameIntervalHandler = null;
        }
        if (moveBlockIntervalHandler != null) {
            clearInterval(moveBlockIntervalHandler);
            moveBlockIntervalHandler = null;
        }
        if (!audioController.muted) {
            audioController.pauseMusic();
        }
        pauseIconElement.classList.remove('fa-pause');
        pauseIconElement.classList.add('fa-play');
        gameCurrentState = "PAUSED";
        gameNextState = "PAUSED";
        render();
    }

    function toggleGame() {
        switch (gameCurrentState) {
            case "PLAYING":
                pauseGame();
                break;
            case "PAUSED":
            case 'GAMEOVER':
                resumeGame();
                break;
            default:
                break;
        }
    }

    function gameloop() {
        if (gameNextButton != 'DOWN') {
            gravity();
        }
    }

    function gravity() {
        let expectedBlock = currentBlock;
        let expectedBlockOffset = [currentBlockOffset[0], currentBlockOffset[1]];
        let valid;
        expectedBlockOffset[0] = currentBlockOffset[0] - 1;
        valid = checkBlockValid(expectedBlock, expectedBlockOffset);
        if (valid) {
            currentBlock = expectedBlock;
            currentBlockOffset = expectedBlockOffset;
        } else {
            fixAndGetNextBlock();
        }
        render();
    }

    function checkCompleteLines() {
        completedLines = [];
        for (let y = 0; y < boardHeight; ++y) {
            let count = 0;
            for (let x = 0; x < boardWidth; ++x) {
                if (fixedBlocks[y][x] != 0) {
                    ++count;
                }
            }
            if (count == boardWidth) {
                completedLines.push(y);
            }
        }

        if (completedLines.length != 0) {
            if (gameIntervalHandler != null) {
                clearInterval(gameIntervalHandler);
                gameIntervalHandler = null;
            }
            if (moveBlockIntervalHandler != null) {
                clearInterval(moveBlockIntervalHandler);
                moveBlockIntervalHandler = null;
            }
            if (completeLinesIntervalHandler != null) {
                clearInterval(completeLinesIntervalHandler);
                completeLinesIntervalHandler = null;
            }
            gameCurrentState = 'COMPLETE_LINES';

            completeLinesTimeOffset = 0;
            completeLinesIntervalHandler = setInterval(completeLineBlinking, 120);

            audioController.playSoundEffect('COMPLETE');

            combos += 1;
            if (combos > 0) {
                showCombos();
            }

            return true;
        } else {
            combos = -1;
            switchToNextBlock();
            audioController.playSoundEffect('LANDING');
            return false;
        }
    }

    function showCombos() {
        if (showCombosHandler != null) {
            clearTimeout(showCombosHandler);
            showCombosHandler = null;
        }
        if (overlayElement.innerHTML.length != 0) {
            return;
        }
        overlayElement.innerHTML = `<span>${combos} COMBO</span>`;
        overlayElement.classList.add('animate-combos');
        showCombosHandler = setTimeout(() => {
            overlayElement.innerHTML = '';
            overlayElement.classList.remove('animate-combos');
        }, 1080);
        audioController.playSoundEffect('COMBOS');
    }

    function completeLineBlinking() {
        if (completeLinesTimeOffset >= 8) {
            if (gameIntervalHandler == null) {
                clearInterval(gameIntervalHandler);
                gameIntervalHandler = null;
            }

            score += ((completedLines.length + 1) * (completedLines.length) / 2) * (combos + 1);
            lines += completedLines.length;

            compactLines();
            switchToNextBlock();
            render();
            gameIntervalHandler = setInterval(gameloop, gameIntervalDelay);
            gameCurrentState = 'PLAYING';
            if (completeLinesIntervalHandler != null) {
                clearInterval(completeLinesIntervalHandler);
                completeLinesIntervalHandler = null;
            }

            audioController.playSoundEffect('COMPACT');
        } else {
            for (let row of completedLines) {
                if (completeLinesTimeOffset % 2 == 0) {
                    rows[row].setAttribute('style', 'visibility: hidden;');
                } else {
                    rows[row].removeAttribute('style');
                }
            }
        }
        ++completeLinesTimeOffset;
    }

    function compactLines() {
        let startY = -1;
        let endY = -1;
        for (let y = 0; y < boardHeight; ++y) {
            let count = 0;
            for (let x = 0; x < boardWidth; ++x) {
                if (fixedBlocks[y][x] != 0) {
                    ++count;
                }
            }
            if (count == boardWidth) {
                if (startY == -1) {
                    startY = y;
                }
                endY = y;
            } else if (startY != -1) {
                for (let y2 = startY; y2 < boardHeight; ++y2) {
                    for (let x2 = 0; x2 < boardWidth; ++x2) {
                        if (y2 < boardHeight - (endY - startY + 1)) {
                            fixedBlocks[y2][x2] = fixedBlocks[y2 + (endY - startY + 1)][x2];
                        } else {
                            fixedBlocks[y2][x2] = 0;
                        }
                    }
                }
                y = startY;
                startY = -1;
                endY = -1;
            }
        }
    }

    function moveBlock() {
        let expectedBlock = currentBlock;
        let expectedBlockOffset = [currentBlockOffset[0], currentBlockOffset[1]];
        let valid;
        switch (gameNextButton) {
            case 'LEFT':
                expectedBlockOffset[1] = currentBlockOffset[1] - 1;
                // audioController.playSoundEffect('MOVE');
                break;
            case 'RIGHT':
                expectedBlockOffset[1] = currentBlockOffset[1] + 1;
                // audioController.playSoundEffect('MOVE');
                break;
            case 'UP':
                expectedBlock = rotateBlock(currentBlock, 1);
                gameNextButton = null;
                audioController.playSoundEffect('ROTATE');
                break;
            case 'DOWN':
                expectedBlockOffset[0] = currentBlockOffset[0] - 1;
                // audioController.playSoundEffect('MOVE');
                break;
            default:
                break;
        }
        valid = checkBlockValid(expectedBlock, expectedBlockOffset);
        if (valid) {
            currentBlock = expectedBlock;
            currentBlockOffset = expectedBlockOffset;
        } else if (gameNextButton == 'DOWN') {
            fixAndGetNextBlock();
        }
        render();
    }

    function fixAndGetNextBlock() {
        fixCurrentBlock();
        checkCompleteLines();
    }

    function switchToNextBlock() {
        currentBlock = nextBlock;
        resetCurrentBlockOffset();
        nextBlock = generateBlock();
        if (!checkBlockValid(currentBlock, currentBlockOffset)) {
            gameCurrentState = 'GAMEOVER';
            gameNextButton = null;
            if (gameIntervalHandler != null) {
                clearInterval(gameIntervalHandler);
                gameIntervalHandler = null;
            }
            if (moveBlockIntervalHandler != null) {
                clearInterval(moveBlockIntervalHandler);
                moveBlockIntervalHandler = null;
            }
            proceed();
        }
    }

    function checkBlockValid(expectedBlock, expectedBlockOffset) {
        let valid = true;
        for (let y = 0; y < blockSize; ++y) {
            for (let x = 0; x < blockSize; ++x) {
                let calculatedX = x + expectedBlockOffset[1] - expectedBlock.center[1];
                let calculatedY = y + expectedBlockOffset[0] - expectedBlock.center[0];
                if (expectedBlock.block[y][x] != 0) {
                    if (!(calculatedX >= 0 && calculatedX < boardWidth &&
                        calculatedY >= 0 && calculatedY < boardHeight) ||
                        fixedBlocks[calculatedY][calculatedX] != 0) {
                        valid = false;
                        break;
                    }
                }
            }
            if (!valid) break;
        }
        return valid;
    }

    function fixCurrentBlock() {
        for (let y = 0; y < blockSize; ++y) {
            for (let x = 0; x < blockSize; ++x) {
                let calculatedX = x + currentBlockOffset[1] - currentBlock.center[1];
                let calculatedY = y + currentBlockOffset[0] - currentBlock.center[0];
                if (currentBlock.block[y][x] != 0) {
                    if ((calculatedX >= 0 && calculatedX < boardWidth &&
                        calculatedY >= 0 && calculatedY < boardHeight) &&
                        fixedBlocks[calculatedY][calculatedX] == 0) {
                        fixedBlocks[calculatedY][calculatedX] = currentBlock.block[y][x];
                    }
                }
            }
        }
        ++stackCount;
    }

    function resetCurrentBlockOffset() {
        currentBlockOffset = [0, 0];
        blockRect = getBlockRect();
        currentBlockOffset = [
            boardHeight - 1 - blockRect[0][1],
            Math.floor(boardWidth / 2) - blockRect[1][0] - Math.floor((blockRect[1][1] - blockRect[1][0] + 1) / 2)
        ];
    }

    function getBlockRect() {
        let result = [];
        let minX = blockSize - 1;
        let maxX = 0;
        let minY = blockSize - 1;
        let maxY = 0;
        for (let y = 0; y < blockSize; ++y) {
            for (let x = 0; x < blockSize; ++x) {
                let calculatedX = x + currentBlockOffset[1] - currentBlock.center[1];
                let calculatedY = y + currentBlockOffset[0] - currentBlock.center[0];
                if (currentBlock.block[y][x] != 0) {
                    if (minX > calculatedX) {
                        minX = calculatedX;
                    }
                    if (maxX < calculatedX) {
                        maxX = calculatedX;
                    }
                    if (minY > calculatedY) {
                        minY = calculatedY;
                    }
                    if (maxY < calculatedY) {
                        maxY = calculatedY;
                    }
                }
            }
        }
        result = [[minY, maxY], [minX, maxX]];
        return result;
    }

    function initBoard() {
        if (boardElement.innerHTML.trim().length == 0) {
            adjustCellSize();

            cells = [];
            rows = [];
            columns = [];

            for (let y = 0; y < boardHeight; ++y) {
                let row = document.createElement('div');
                let cellsOfRow = [];
                row.id = `row-${y}`;
                row.classList.add(`row`);
                row.classList.add(`row-${y}`);
                for (let x = 0; x < boardWidth; ++x) {
                    let cell = document.createElement('div');
                    cell.id = `cell-${x}-${y}`;
                    cell.classList.add(`cell`);
                    cell.classList.add(`cell-x-${x}`);
                    cell.classList.add(`cell-y-${y}`);
                    row.appendChild(cell);
                    cellsOfRow.push(cell);
                }
                boardElement.appendChild(row);
                rows.push(row);
                cells.push(cellsOfRow);
            }
        }

        if (nextBlockPanelElement.innerHTML.trim().length == 0) {
            nextBlockPanelCells = [];

            for (let y = 0; y < blockSize; ++y) {
                let row = document.createElement('div');
                let cellsOfRow = [];
                row.id = `next-block-row-${y}`;
                row.classList.add(`next-block-row`);
                row.classList.add(`next-block-row-${y}`);
                for (let x = 0; x < blockSize; ++x) {
                    let cell = document.createElement('div');
                    cell.id = `next-block-cell-${x}-${y}`;
                    cell.classList.add(`next-block-cell`);
                    cell.classList.add(`next-block-cell-x-${x}`);
                    cell.classList.add(`next-block-cell-y-${y}`);
                    row.appendChild(cell);
                    cellsOfRow.push(cell);
                }
                nextBlockPanelElement.appendChild(row);
                nextBlockPanelCells.push(cellsOfRow);
            }
        }
    }

    function adjustCellSize() {
        let computedContentSize = getComputedStyle(contentElement);
        let tempCellSizeByWidth = (
            computedContentSize.width.replaceAll('px', '') -
            getComputedStyle(informationPanelElement).width.replaceAll('px', '')
        ) / boardWidth;
        let tempCellSizeByHeight = (computedContentSize.height.replaceAll('px', '')) / boardHeight;
        cellSize = Math.min(tempCellSizeByWidth, tempCellSizeByHeight) - 3;

        let cellStyleElement = document.querySelector('#cell-style');
        if (cellStyleElement != null) {
            cellStyleElement.remove();
        }
        let additionalStyle = document.createElement('style');
        additionalStyle.id = "cell-style";
        additionalStyle.innerHTML = `.cell{width:${cellSize}px;height:${cellSize}px;}`;
        document.querySelector('head').appendChild(
            additionalStyle
        );
    }

    function render() {
        if (board.length != boardHeight) {
            return;
        }

        for (let y = 0; y < boardHeight; ++y) {
            for (let x = 0; x < boardWidth; ++x) {
                board[y][x] = fixedBlocks[y][x];
            }
        }

        for (let y = 0; y < blockSize; ++y) {
            for (let x = 0; x < blockSize; ++x) {
                let calculatedX = x + currentBlockOffset[1] - currentBlock.center[1];
                let calculatedY = y + currentBlockOffset[0] - currentBlock.center[0];
                if (calculatedX >= 0 && calculatedX < boardWidth &&
                    calculatedY >= 0 && calculatedY < boardHeight &&
                    currentBlock.block[y][x] != 0) {
                    board[calculatedY][calculatedX] = currentBlock.block[y][x];
                }
            }
        }

        for (let y = 0; y < boardHeight; ++y) {
            for (let x = 0; x < boardWidth; ++x) {
                let backgroundColor = getColor(board[y][x]);
                if (backgroundColor.length != 0) {
                    cells[y][x].classList.add('cells-filled');
                    cells[y][x].setAttribute('style', `background-color:${backgroundColor};`)
                } else {
                    cells[y][x].classList.remove('cells-filled');
                    cells[y][x].removeAttribute('style');
                }
            }
        }

        for (let y = 0; y < blockSize; ++y) {
            for (let x = 0; x < blockSize; ++x) {
                let backgroundColor = getColor(nextBlock.block[y][x]);
                if (backgroundColor.length != 0) {
                    nextBlockPanelCells[y][x].classList.add('cells-filled');
                    nextBlockPanelCells[y][x].setAttribute('style', `background-color:${backgroundColor};`)
                } else {
                    nextBlockPanelCells[y][x].classList.remove('cells-filled');
                    nextBlockPanelCells[y][x].removeAttribute('style');
                }
            }
        }

        scoreElement.innerHTML = score;
        linesElement.innerHTML = lines;
        timeElement.innerHTML = getElapsedTime();

        switch (gameNextState) {
            case 'PAUSED':
                overlayElement.classList.add('blur-effect');
                overlayElement.innerHTML = '<span>PAUSED</span>';
                break;
            case 'GAMEOVER':
                overlayElement.classList.add('blur-effect');
                overlayElement.innerHTML = '<span>GAMEOVER</span>';
                break;
            default:
                break;
        }
    }

    function getElapsedTime() {
        if (startTime == null) {
            return '0:00:00';
        } else {
            let elapsedTime = new Date() - startTime;
            let hours = Math.floor(elapsedTime / 1000 / 60 / 60);
            let minutes = Math.floor(elapsedTime / 1000 / 60);
            let seconds = Math.floor(elapsedTime / 1000);
            // hours = ('0' + hours).slice(-2);
            minutes = ('0' + minutes).slice(-2);
            seconds = ('0' + seconds).slice(-2);
            return `${hours}:${minutes}:${seconds}`;
        }
    }

    function getColor(colorIndex) {
        // https://www.rapidtables.com/convert/color/hsv-to-rgb.html
        // hsv 0(+51x)deg 90% 85%
        let backgroundColor;
        switch (colorIndex) {
            case 1:
                backgroundColor = `#D91616`;
                break;
            case 2:
                backgroundColor = `#D9BB16`;
                break;
            case 3:
                backgroundColor = `#50D916`;
                break;
            case 4:
                backgroundColor = `#16D981`;
                break;
            case 5:
                backgroundColor = `#168BD9`;
                break;
            case 6:
                backgroundColor = `#4616D9`;
                break;
            case 7:
                backgroundColor = `#D916C5`;
                break;
            case 8:
                backgroundColor = `#D916C5`;
                break;
            default:
                backgroundColor = '';
                // backgroundColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
                break;
        }
        return backgroundColor;
    }

    function generateBlock() {
        let nextBlockCandidatesIndex;
        let blockType;
        let rotation = randBetween(0, 4);
        let block;
        let blockCenter;
        let result;

        //7-bag system
        if (nextBlockCandidates == null || nextBlockCandidates.length == 0) {
            nextBlockCandidates = Array.from(Array(7).keys());
        }
        nextBlockCandidatesIndex = randBetween(0, nextBlockCandidates.length);
        blockType = nextBlockCandidates[nextBlockCandidatesIndex];
        nextBlockCandidates.splice(nextBlockCandidatesIndex, 1);

        function fillO() {
            let result = get2DArrayWithZeros(blockSize, blockSize);
            result[0][0] = 1;
            result[0][1] = 1;
            result[1][0] = 1;
            result[1][1] = 1;
            return result;
        }

        function fillI() {
            let result = get2DArrayWithZeros(blockSize, blockSize);
            result[0][0] = 1;
            result[1][0] = 1;
            result[2][0] = 1;
            result[3][0] = 1;
            return result;
        }

        function fillS() {
            let result = get2DArrayWithZeros(blockSize, blockSize);
            result[0][0] = 1;
            result[0][1] = 1;
            result[1][1] = 1;
            result[1][2] = 1;
            return result;
        }

        function fillL() {
            let result = get2DArrayWithZeros(blockSize, blockSize);
            result[0][1] = 1;
            result[0][0] = 1;
            result[1][0] = 1;
            result[2][0] = 1;
            return result;
        }

        function fillT() {
            let result = get2DArrayWithZeros(blockSize, blockSize);
            result[1][0] = 1;
            result[1][1] = 1;
            result[1][2] = 1;
            result[0][1] = 1;
            return result;
        }

        switch (blockType) {
            case 0: // O
                block = fillO();
                blockCenter = [0, 0];
                rotation = 0;
                break;
            case 1: // I
                block = fillI();
                blockCenter = [2, 0];
                break;
            case 2: // S
                block = fillS();
                blockCenter = [1, 1];
                break;
            case 3: // Z
                block = invertX(fillS());
                blockCenter = [1, 2];
                break;
            case 4: // L
                block = fillL();
                blockCenter = [1, 0];
                break;
            case 5: // J
                block = invertX(fillL());
                blockCenter = [1, 3];
                break;
            case 6: // T
                block = fillT();
                blockCenter = [1, 1];
                break;
            default:
                break;
        }
        block = colorizeBlock(block, blockType + 1);
        result = {
            'block': block,
            'center': blockCenter,
            'type': blockType
        };
        result = rotateBlock(result, rotation);
        return result;
    }

    function invertX(source) {
        let result = get2DArrayWithZeros(source.length, source[0].length);
        for (let y = 0; y < source.length; ++y) {
            for (let x = 0; x < source[0].length; ++x) {
                result[y][x] = source[y][source[0].length - 1 - x];
            }
        }
        return result;
    }


    function rotateBlock(source, count) {
        function rotate(sourceBlock) {
            let result = {
                'block': sourceBlock.block,
                'center': sourceBlock.center,
                'type': sourceBlock.type
            };
            result.block = get2DArrayWithZeros(sourceBlock.block.length, sourceBlock.block[0].length);
            for (let y = 0; y < sourceBlock.block.length; ++y) {
                for (let x = 0; x < sourceBlock.block[0].length; ++x) {
                    // clockwise
                    // result.block[y][x] = sourceBlock.block[x][sourceBlock.block.length - 1 - y];
                    // anti-clockwise
                    result.block[y][x] = sourceBlock.block[sourceBlock.block[0].length - 1 - x][y];
                }
            }
            // clockwise
            // result.center = [sourceBlock.block[0].length - 1 - result.center[1], result.center[0]];
            // anti-clockwise
            result.center = [result.center[1], sourceBlock.block[1].length - 1 - result.center[0]];

            return result;
        }
        if (source.type == 0) {
            return source;
        }
        let result = source;
        for (let i = 0; i < count; ++i) {
            result = rotate(result);
        }
        return result;
    }

    function colorizeBlock(source, color) {
        let result = get2DArrayWithZeros(source.length, source[0].length);
        for (let y = 0; y < source.length; ++y) {
            for (let x = 0; x < source[0].length; ++x) {
                result[y][x] = (source[y][x] == 0 ? 0 : color);
            }
        }
        return result;
    }

    function randBetween(min, max) {
        // min inclusive, max exclusive
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function convertRemToPixels(rem) {
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    function getMobileOperatingSystem() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Windows Phone must come first because its UA also contains "Android"
        if (/windows phone/i.test(userAgent)) {
            return "Windows Phone";
        }

        if (/android/i.test(userAgent)) {
            return "Android";
        }

        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return "iOS";
        }

        return "unknown";
    }
};