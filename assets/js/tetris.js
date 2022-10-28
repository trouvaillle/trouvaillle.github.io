window.onload = () => {
    let buttonLeft = document.querySelector('#buttonLeft');
    let buttonRight = document.querySelector('#buttonRight');
    let buttonUp = document.querySelector('#buttonUp');
    let buttonDown = document.querySelector('#buttonDown');
    let contentElement = document.querySelector('#content');
    let boardElement = document.querySelector('#board');

    let score = 0;
    let playing = false;
    let boardWidth = 10;
    let boardHeight = 20;
    let board = [];
    let cellSize = 0;
    let cells;
    let rows;
    let columns;

    applyPreventDefault([buttonLeft, buttonRight, buttonUp, buttonDown, contentElement, boardElement]);
    assignListeners();
    window.onresize = () => {
        boardElement.innerHTML = "";
        initBoard();
    }
    init();
    gameloop();

    function assignListeners() {
        buttonLeft.addEventListener('click', (event) => {
            event.preventDefault();
        })
        buttonRight.addEventListener('click', (event) => {
            event.preventDefault();
        })
        buttonUp.addEventListener('click', (event) => {
            event.preventDefault();
        })
        buttonDown.addEventListener('click', (event) => {
            event.preventDefault();
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
        score = 0;
        playing = false;
        boardWidth = 10;
        boardHeight = 20;
        board = [];
        
        for (let y = 0; y < boardHeight; ++y) {
            let tempRows = [];
            for (let x = 0; x < boardWidth; ++x) {
                tempRows.push([]);
            }
            board.push(tempRows);
        }
        initBoard();
    }

    function gameloop() {
        while(true) {
            break;
        }
    }

    function initBoard() {
        if (boardElement.innerHTML.trim().length == 0) {
            boardElement.innerHTML = "";
            
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

    render();

    function render() {
        for (let y = 0; y < boardHeight; ++y) {
            for (let x = 0; x < boardWidth; ++x) {
                board[y][x] = Math.floor(Math.random() * 8);
            }
        }
        for (let y = 0; y < boardHeight; ++y) {
            for (let x = 0; x < boardWidth; ++x) {
                // https://www.rapidtables.com/convert/color/hsv-to-rgb.html
                // hsv 0(+51x)deg 90% 85%
                let backgroundColor;
                switch (board[y][x]) {
                    case 0:
                        backgroundColor = '';
                        break;
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
                        backgroundColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
                        break;
                }
                if (backgroundColor.length != 0) {
                    cells[y][x].classList.add('cells-filled');
                    cells[y][x].setAttribute('style', `background-color:${backgroundColor};`)
                } else {
                    cells[y][x].classList.remove('cells-filled');
                    cells[y][x].removeAttribute('style');
                }
            }
        }
    }

    function convertRemToPixels(rem) {    
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
}