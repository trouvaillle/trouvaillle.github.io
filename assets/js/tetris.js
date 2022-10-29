window.onload = () => {
    let buttonLeft = document.querySelector('#buttonLeft');
    let buttonRight = document.querySelector('#buttonRight');
    let buttonUp = document.querySelector('#buttonUp');
    let buttonDown = document.querySelector('#buttonDown');
    let contentElement = document.querySelector('#content');
    let boardElement = document.querySelector('#board');
    let scoreElement = document.querySelector('#score');
    let overlayElement = document.querySelector('#overlay');
    let nextBlockPanelElement = document.querySelector('#next-block-panel');

    let gameCurrentState = 'PAUSED';
    let gameNextState = 'PAUSED';

    let gameIntervalHandler = null;
    let moveBlockIntervalHandler = null;
    let completeLinesIntervalHandler = null;
    let completeLinesTimeOffset = 0;
    let completedLines = [];

    let gameManualDownDelay = 120;
    let gameIntervalDelay = 550;
    let gameNextButton = null;

    const blockSize = 4;

    let score = 0;
    let stackCount = 0;
    let playing = false;
    let boardWidth = 10;
    let boardHeight = 20;
    let board = [];
    
    let fixedBlocks = [];
    let currentBlock;
    let nextBlock;
    let currentBlockOffset;

    let cellSize = 0;
    let cells;
    let rows;
    let columns;

    let nextBlockPanelCells;

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
            switch(event.key) {
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
                default:
                    break;
            }
        });
        window.addEventListener('keyup', (event) => {
            if (event.ctrlKey || event.altKey || event.shiftKey) {
                return;
            }
            switch(event.key) {
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
        })
    }

    function applyPreventDefault(element) {
        if (Array.isArray(element)) {
            for (i of element) {
                i.addEventListener('click', (event) => {
                    event.preventDefault();
                })
                i.addEventListener('dblclick', (event) => {
                    event.preventDefault();
                })
            }
        } else {
            element.addEventListener('click', (event) => {
                event.preventDefault();
            })
            element.addEventListener('dblclick', (event) => {
                event.preventDefault();
            })
        }
    }

    function init() {
        if (gameIntervalHandler != null) {
            clearInterval(gameIntervalHandler);
            gameIntervalHandler = null;
        }
        score = 0;
        stackCount = 0;
        playing = false;
        boardWidth = 10;
        boardHeight = 20;
        
        fixedBlocks = get2DArrayWithZeros(boardHeight, boardWidth);
        board = get2DArrayWithZeros(boardHeight, boardWidth);

        currentBlock = generateBlock();
        resetCurrentBlockOffset();
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
                    gameIntervalHandler = setInterval(gameloop, gameIntervalDelay);
                } else {
                    gameNextState = 'PAUSED';
                }
                break;
            case 'GAMEOVER':
                if (gameNextButton != null && gameNextButton.trim().length != 0) {
                    gameNextState = 'PLAYING';
                    init();
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
                    gameIntervalHandler = setInterval(gameloop, gameIntervalDelay);
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

            return true;
        } else {
            switchToNextBlock();
            return false;
        }
    }

    function completeLineBlinking() {
        if (completeLinesTimeOffset >= 8) {
            if (gameIntervalHandler == null) {
                clearInterval(gameIntervalHandler);
                gameIntervalHandler = null;
            }
            score += (completedLines.length + 1) * (completedLines.length) / 2;
            compactLines();
            switchToNextBlock();
            render();
            gameIntervalHandler = setInterval(gameloop, gameIntervalDelay);
            gameCurrentState = 'PLAYING';
            if (completeLinesIntervalHandler != null) {
                clearInterval(completeLinesIntervalHandler);
                completeLinesIntervalHandler = null;
            }
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
                startY = -1;
                endY = -1;
            }
        }
    }

    function moveBlock() {
        let expectedBlock = currentBlock;
        let expectedBlockOffset = [currentBlockOffset[0], currentBlockOffset[1]];
        let valid;
        switch(gameNextButton) {
            case 'LEFT':
                expectedBlockOffset[1] = currentBlockOffset[1] - 1;
                break;
            case 'RIGHT':
                expectedBlockOffset[1] = currentBlockOffset[1] + 1;
                break;
            case 'UP':
                expectedBlock = rotateBlock(currentBlock, 1);
                break;
            case 'DOWN':
                expectedBlockOffset[0] = currentBlockOffset[0] - 1;
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
            if (gameIntervalHandler != null) {
                clearInterval(gameIntervalHandler);
                gameIntervalHandler = null;
            }
            if (moveBlockIntervalHandler != null) {
                clearInterval(moveBlockIntervalHandler);
                moveBlockIntervalHandler = null;
            }
            gameNextButton = null;
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
        let tempCellSizeByWidth = (getComputedStyle(contentElement).width.replaceAll('px', '')) / boardWidth;
        let tempCellSizeByHeight = (getComputedStyle(boardElement).height.replaceAll('px', '')) / boardHeight;
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
                overlayElement.classList.remove('blur-effect');
                overlayElement.innerHTML = '';
                break;
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
        let blockType = randBetween(0, 7);
        let rotation = randBetween(0, 4);
        let block;
        let blockCenter;
        let result;
        
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
                    result.block[y][x] = sourceBlock.block[x][sourceBlock.block.length - 1 - y];
                }    
            }
            result.center = [sourceBlock.block[0].length - 1 - result.center[1], result.center[0]];
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
                result[y][x] = (source[y][x] == 0 ? 0: color);
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
};