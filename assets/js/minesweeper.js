window.onload = () => {
  const {x, y, mines} = {x: 10, y: 10, mines: 10};
  let map = []; // 10 - mine, 11 - bombed mine, 12 - flag, 13 - mined flag, 14 - question, 15 - mined question
  let mineCoords = [];
  let items = [];
  let gameover = false;
  let win = false;
  let score = 0;
  let notClicked = 0;
  const container =  document.querySelector('#container');
  const board =  document.querySelector('#board');
  const smiley =  document.querySelector('#smiley');
  const youwin =  document.querySelector('#youwin');
  
  initMap();
  createBoard();
  render();

  window.addEventListener('resize', adjustSize);

  function initMap() {
    map = [];
    alreadyTaken = new Set();
    left = mines;
    gameover = false;

    while (left > 0) {
        const maxNumber = x * y;
        dice = getRandomInt(maxNumber);
        if (!alreadyTaken.has(dice)) {
            alreadyTaken.add(dice);
            --left;
        }
    }

    mineCoords = [];
    for (let i of alreadyTaken) {
        const a = i % x;
        const b = Math.floor(i / x);
        mineCoords.push([a, b]);
    }

    map = [...new Array(y).keys()].map(_ => [...new Array(x).keys()].map(_ => 0));

    for (const [a, b] of mineCoords) {
        map[b][a] = 10;
    }

    notClicked = x * y;
  }

  function adjustSize() {
    const cellWidth = Math.min(container.clientWidth / x, container.clientHeight / y);
    console.log(cellWidth);
    board.setAttribute('style', `width: ${cellWidth * x}px; height: ${cellWidth * y}px; font-size: ${cellWidth * 0.25}px`);
  }

  function createBoard() {
    adjustSize();

    items = [];
    for (let j = 0; j < y; ++j) {
        itemsRow = [];
        const row = document.createElement('div');
        row.classList.add('row');
        for (let i = 0; i < x; ++i) {
            const cell = document.createElement('div');
            const item = document.createElement('div');
            let thisItemDown = false;
            const itemMouseDown = (item) => (evt) => {
                evt.preventDefault();
                if (map[j][i] === 0 || map[j][i] === 10 || (map[j][i] >= 12 && map[j][i] <= 15)) {
                    item.classList.add('mousedown');
                    thisItemDown = true;
                    smiley.innerHTML = '😮';
                }
            };
            const itemMouseEnter = (item) => (evt) => {
                evt.preventDefault();
                if (thisItemDown) {
                    item.classList.add('mousedown');
                    setSmiley();
                }
            };
            const itemMouseUp = (item) => (evt) => {
                evt.preventDefault();
                if (resetGame()) {
                    return;
                }
                if (map[j][i] === 0 || map[j][i] === 10 || (map[j][i] >= 12 && map[j][i] <= 15)) {
                    item.classList.remove('mousedown');
                    if (thisItemDown) {
                        if (evt.button === 0) {
                            itemClicked(i, j);
                            checkWin();
                        } else if (evt.button === 2) {
                            if (map[j][i] === 0) {
                                map[j][i] = 12;
                            } else if (map[j][i] === 12) {
                                map[j][i] = 14;
                            } else if (map[j][i] === 14) {
                                map[j][i] = 0;
                            }
                            if (map[j][i] === 10) {
                                map[j][i] = 13;
                            } else if (map[j][i] === 13) {
                                map[j][i] = 15;
                            } else if (map[j][i] === 15) {
                                map[j][i] = 10;
                            }
                            render();
                        }
                    }
                    thisItemDown = false;
                }
            };
            const itemMouseLeave = (item) => (evt) => {
                evt.preventDefault();
                if (map[j][i] === 0 || (!gameover && map[j][i] === 10) || (map[j][i] >= 12 && map[j][i] <= 15)) {
                    item.classList.remove('mousedown');
                    thisItemDown = false;
                    setSmiley();
                }
            };
            cell.classList.add('cell');
            item.classList.add('item');
            item.classList.add('embossed');
            item.addEventListener('mousedown', itemMouseDown(item));
            item.addEventListener('pointerdown', itemMouseDown(item))
            item.addEventListener('mouseenter', itemMouseEnter(item));;
            item.addEventListener('pointerenter', itemMouseEnter(item));
            item.addEventListener('mouseup', itemMouseUp(item));
            item.addEventListener('pointerup', itemMouseUp(item));
            item.addEventListener('mouseleave', itemMouseLeave(item));
            item.addEventListener('pointerleave', itemMouseLeave(item));
            item.addEventListener('contextmenu', (evt) => {
                evt.preventDefault();
            });
            cell.appendChild(item);
            row.appendChild(cell);
            itemsRow.push(item);
        }
        board.appendChild(row);
        items.push(itemsRow);
      }

      youwin.addEventListener('click', () => {
        resetGame();
      });
  }

  function resetGame() {
    if (gameover) {
        initMap();
        render();
        return true;
    } else {
        return false;
    }
  }

  function itemClicked(i, j) {
    if (map[j][i] === 0 || map[j][i] === 14) {
        const num = getSurroundedMines(i, j);
        map[j][i] = num + 1;
        --notClicked;
        if (num == 0) {
            for (let a = 0; a < 3; ++a) {
                for (let b = 0; b < 3; ++b) {
                    checkAndClick(i + a - 1, j + b -1);
                }
            }
        }
    } else if (map[j][i] === 10 || map[j][i] === 15) {
        map[j][i] = 11;
        gameover = true;
    }
    render();
  }

  function checkAndClick(i, j) {
    if (i >= 0 && i < x && j >= 0 && j < y) {
        if (map[j][i] === 0) {
            itemClicked(i, j);
        }
    }
  }

  function setSmiley() {
    if (gameover) {
        if (win) {
            smiley.innerHTML = '😎';
        } else {
            smiley.innerHTML = '😵';
        }
    } else {
        smiley.innerHTML = '🙂';
    }
  }

  function render() {
    for (let j = 0; j < y; ++j) {
        for (let i = 0; i < x; ++i) {
            if (map[j][i] === 11 || (gameover && map[j][i] === 10)) {
                items[j][i].classList.remove('red');
                items[j][i].classList.remove('flag');
                items[j][i].classList.remove('question');
                items[j][i].classList.add('mine');
                if (map[j][i] === 11) {
                    items[j][i].classList.add('red');
                }
                items[j][i].classList.add('mousedown');
            } else if (map[j][i] > 0 && map[j][i] < 10) {
                items[j][i].classList.remove('red');
                items[j][i].classList.remove('mine');
                items[j][i].classList.remove('flag');
                items[j][i].classList.remove('question');
                items[j][i].classList.add(`number-${map[j][i] - 1}`);
                items[j][i].classList.add('mousedown');
            } else if (map[j][i] === 0 || map[j][i] === 10) {
                items[j][i].classList.remove('red');
                items[j][i].classList.remove('mine');
                items[j][i].classList.remove('flag');
                items[j][i].classList.remove('question');
                items[j][i].classList.remove('mousedown');
                for (let k = 1; k < 9; ++k) {
                    items[j][i].classList.remove(`number-${k}`);
                }
            } else if (map[j][i] === 12 || map[j][i] === 13) {
                items[j][i].classList.remove('red');
                items[j][i].classList.remove('question');
                items[j][i].classList.add('flag');
                items[j][i].classList.remove('mousedown');
            } else if (map[j][i] === 14 || map[j][i] === 15) {
                items[j][i].classList.remove('red');
                items[j][i].classList.remove('flag');
                items[j][i].classList.add('question');
                items[j][i].classList.remove('mousedown');
            }
        }
    }

    if (!gameover || !win) {
        youwin.removeAttribute('style');
    }

    setSmiley();
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function getSurroundedMines(a, b) {
    let result = 0;
    for (let j = 0; j < 3; ++j) {
        for (let i = 0; i < 3; ++i) {
            const c = a + i - 1;
            const d = b + j - 1;
            if (c >= 0 && c < x && d >= 0 && d < y) {
                if (map[d][c] === 10 || map[d][c] === 11 || map[d][c] === 13 || map[d][c] === 15) {
                    ++result;
                }
            }
        }
    }
    return result;
  }

  function checkWin() {
    if (notClicked === mines) {
        gameover = true;
        win = true;
        youwin.setAttribute('style', 'visibility: visible;');
    }
  }
};
