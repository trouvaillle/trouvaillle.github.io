window.onload = () => {
    /* 
      map values
      10 - mine, 
      11 - bombed mine, 
      12 - flag,
      13 - flag with mine,
      14 - flag with no mine,
      15 - question,
      16 - question with mine 
    */

    const ITEM_MINE = 10;
    const ITEM_BOMBED_MINE = 11;
    const ITEM_FLAG = 12;
    const ITEM_FLAG_WITH_MINE = 13;
    const ITEM_FLAG_WITH_NO_MINE = 14;
    const ITEM_QUESTION = 15;
    const ITEM_QUESTION_WITH_MINE = 16;

    const keyPrefix = '/trouvaille.github.io/app/minesweeper';

    let difficulty = 'beginner';
    let { x, y, mines } = { x: 9, y: 9, mines: 10 };
    let map = []; // map values
    let mineCoords = [];
    let items = [];
    let gameover = false;
    let win = false;
    let score = 0;
    let notClicked = 0;
    let leftMinesUserThinks = 0;
    let startTime = 0;
    let timeIndicator = null;
    let menuCloser = [];
    let autoplayTimer = null;
    let openedItems = 0;


    const body = document.querySelector('body');
    const container = document.querySelector('#container');
    const header = document.querySelector('#header');
    const board = document.querySelector('#board');
    const left = document.querySelector('#left');
    const smiley = document.querySelector('#smiley');
    const time = document.querySelector('#time');
    const menu = document.querySelector('#menu');
    const theme = document.querySelector('#theme');

    initMap();
    loadState();
    createBoard();
    initializeSmiley();
    initializeMenu();
    initializeTheme();
    render();
    startTimeIndicator();    

    window.addEventListener('resize', adjustSize);
    window.addEventListener('contextmenu', (evt) => { evt.preventDefault(); });

    function initMap() {
        map = [];
        gameover = false;
        win = false;
        score = 0;
        notClicked = x * y;
        leftMinesUserThinks = mines;
        startTime = new Date().getTime();
        if (autoplayTimer !== null) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
        openedItems = 0;

        let alreadyTaken = new Set();
        let left = mines;
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
            map[b][a] = ITEM_MINE;
        }
    }

    function adjustSize() {
        // const cellWidth = Math.min(container.clientWidth / x, container.clientHeight / y);
        const cellWidth = Math.min((body.clientWidth - 14 * (2.6 + 0.1)) / x, 48);
        board.setAttribute('style', `width: ${cellWidth * x}px; height: ${cellWidth * y}px; font-size: ${cellWidth * 0.25}px`);
        header.setAttribute('style', `width: ${cellWidth * x}px;`);
    }

    function createBoard() {
        adjustSize();

        board.innerHTML = '';
        items = [];
        for (let j = 0; j < y; ++j) {
            itemsRow = [];
            const row = document.createElement('div');
            row.classList.add('row');
            for (let i = 0; i < x; ++i) {
                const cell = document.createElement('div');
                const item = document.createElement('div');
                let thisItemDown = false;
                let timer = null;
                const itemMouseDown = (item) => (evt) => {
                    evt.preventDefault();
                    closeAllMenuContext();
                    if (gameover) return;
                    if (map[j][i] >= 0 && map[j][i] <= ITEM_MINE || (map[j][i] >= ITEM_FLAG && map[j][i] <= ITEM_QUESTION_WITH_MINE)) {
                        if (evt.button === 0) {
                            item.classList.add('mousedown');
                        }
                        thisItemDown = true;
                        smiley.innerHTML = '😮';

                        timer = setTimeout(() => {
                            itemMouseUp(item)({ 'button': 2, 'preventDefault': () => { } });
                        }, 150);
                    }
                };
                const itemMouseEnter = (item) => (evt) => {
                    evt.preventDefault();
                    if (!gameover && thisItemDown) {
                        item.classList.add('mousedown');
                        setSmiley();
                    }
                };
                const itemMouseUp = (item) => (evt) => {
                    evt.preventDefault();
                    if (timer !== null) {
                        clearTimeout(timer);
                        timer = null;
                    }
                    /* if (resetGame()) {
                        thisItemDown = false;
                        return;
                    } */
                    if (gameover) return;
                    if (map[j][i] >= 0 && map[j][i] <= ITEM_MINE || (map[j][i] >= ITEM_FLAG && map[j][i] <= ITEM_QUESTION_WITH_MINE)) {
                        if (!(map[j][i] > 0 && map[j][i] < ITEM_MINE)) {
                            item.classList.remove('mousedown');
                        }
                        if (thisItemDown) {
                            if (evt.button === 0) {
                                clickItem(i, j);
                                checkWin();
                                render();
                            } else if (evt.button === 2) {
                                if (map[j][i] === 0) {
                                    map[j][i] = ITEM_FLAG;
                                    --leftMinesUserThinks;
                                    setLeft();
                                } else if (map[j][i] === ITEM_FLAG) {
                                    map[j][i] = ITEM_QUESTION;
                                    ++leftMinesUserThinks;
                                    setLeft();
                                } else if (map[j][i] === ITEM_QUESTION) {
                                    map[j][i] = 0;
                                }
                                if (map[j][i] === ITEM_MINE) {
                                    map[j][i] = ITEM_FLAG_WITH_MINE;
                                    --leftMinesUserThinks;
                                    setLeft();
                                } else if (map[j][i] === ITEM_FLAG_WITH_MINE) {
                                    map[j][i] = ITEM_QUESTION_WITH_MINE;
                                    ++leftMinesUserThinks;
                                    setLeft();
                                } else if (map[j][i] === ITEM_QUESTION_WITH_MINE) {
                                    map[j][i] = ITEM_MINE;
                                }
                                render();
                            }
                            saveState();
                        }
                        thisItemDown = false;
                    }
                };
                const itemMouseLeave = (item) => (evt) => {
                    evt.preventDefault();
                    if (map[j][i] === 0 || (!gameover && (map[j][i] === ITEM_MINE || (map[j][i] >= ITEM_FLAG && map[j][i] <= ITEM_QUESTION_WITH_MINE)))) {
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
    }

    function initializeSmiley() {
        let thisItemDown = false;
        let timer = null;
        const itemMouseDown = (item) => (evt) => {
            evt.preventDefault();
            if (evt.button === 0) {
                item.classList.add('debossed-middle');
            }
            thisItemDown = true;
            if (!gameover) {
                smiley.innerHTML = '😮';
            }

            /* timer = setTimeout(() => {
                itemMouseUp(item)({'button': 0, 'preventDefault': () => {}});
            }, 250); */
        };
        const itemMouseEnter = (item) => (evt) => {
            evt.preventDefault();
            if (thisItemDown) {
                item.classList.add('debossed-middle');
                setSmiley();
            }
        };
        const itemMouseUp = (item) => (evt) => {
            evt.preventDefault();
            closeAllMenuContext();
            item.classList.remove('debossed-middle');
            setSmiley();
            if (timer !== null) {
                clearTimeout(timer);
                timer = null;
            }
            /*
            if (thisItemDown && resetGame()) {
                thisItemDown = false;
                return;
            }
            */
            newGame();
            thisItemDown = false;
        };
        const itemMouseLeave = (item) => (evt) => {
            evt.preventDefault();
            item.classList.remove('debossed-middle');
            thisItemDown = false;
            setSmiley();
        };

        smiley.addEventListener('mousedown', itemMouseDown(smiley));
        smiley.addEventListener('pointerdown', itemMouseDown(smiley))
        smiley.addEventListener('mouseenter', itemMouseEnter(smiley));;
        smiley.addEventListener('pointerenter', itemMouseEnter(smiley));
        smiley.addEventListener('mouseup', itemMouseUp(smiley));
        smiley.addEventListener('pointerup', itemMouseUp(smiley));
        smiley.addEventListener('mouseleave', itemMouseLeave(smiley));
        smiley.addEventListener('pointerleave', itemMouseLeave(smiley));
        smiley.addEventListener('contextmenu', (evt) => { evt.preventDefault(); });
    }

    function initializeMenu() {
        const menus = [
            {
                'name': '<u>G</u>ame',
                'children': [
                    {
                        'type': 'submenu',
                        'name': 'New',
                        'action': () => {
                            newGame();
                        }
                    },
                    {
                        'type': 'hr',
                        'name': '',
                        'action': null
                    },
                    {
                        'type': 'submenu',
                        'name': 'Baby',
                        'action': () => {
                            setDifficulty('baby');
                        }
                    },
                    {
                        'type': 'submenu',
                        'name': 'Beginner',
                        'action': () => {
                            setDifficulty('beginner');
                        }
                    },
                    {
                        'type': 'submenu',
                        'name': 'Novice',
                        'action': () => {
                            setDifficulty('novice');
                        }
                    },
                    {
                        'type': 'submenu',
                        'name': 'Intermediate',
                        'action': () => {
                            setDifficulty('intermediate');
                        }
                    },
                    {
                        'type': 'submenu',
                        'name': 'Expert',
                        'action': () => {
                            setDifficulty('expert');
                        }
                    },
                    {
                        'type': 'submenu',
                        'name': 'Hard',
                        'action': () => {
                            setDifficulty('hard');
                        }
                    },
                    {
                        'type': 'submenu',
                        'name': 'Insane',
                        'action': () => {
                            setDifficulty('insane');
                        }
                    }
                ],
                'action': null
            },
            {
                'name': '<u>H</u>elp',
                'children': [
                    {
                        'type': 'submenu',
                        'name': 'Autoplay',
                        'action': () => {
                            autoplay();
                        }
                    }
                ],
                'action': null
            }
        ]
        menu.innerHTML = '';

        menus.forEach(it => {
            let thisItemDown = false;
            let opened = false;

            const element = document.createElement('div');
            element.classList.add('menu-item');

            const menuItem = document.createElement('div');
            menuItem.classList.add('menu-button');
            menuItem.innerHTML = it.name;

            menuItem.addEventListener('mousedown', (evt) => {
                evt.preventDefault();
                thisItemDown = true;
            });
            menuItem.addEventListener('pointerdown', (evt) => evt.preventDefault());
            menuItem.addEventListener('mouseenter', (evt) => evt.preventDefault());
            menuItem.addEventListener('pointerenter', (evt) => evt.preventDefault());
            menuItem.addEventListener('mouseleave', (evt) => {
                evt.preventDefault();
                thisItemDown = false;
            });
            menuItem.addEventListener('contextmenu', (evt) => evt.preventDefault());

            element.appendChild(menuItem);

            if (it.children && it.children.length > 0) {
                const div = document.createElement('div');
                div.classList.add('context-menu');
                div.classList.add('embossed-small');

                const ul = document.createElement('ul');
                it.children.forEach(child => {
                    if (child.type === 'submenu') {
                        const li = document.createElement('li');
                        li.innerHTML = child.name;
                        if (child.action) {
                            /*
                            li.addEventListener('mouseup', (evt) => {
                                evt.preventDefault();
                                child.action(evt);
                                closeAllMenuContext();
                            });
                            */
                            li.addEventListener('pointerup', (evt) => {
                                evt.preventDefault();
                                child.action(evt);
                                closeAllMenuContext();
                            });
                        }
                        ul.appendChild(li);
                    } else {
                        const hr = document.createElement('hr');
                        ul.appendChild(hr);
                    }
                });
                div.append(ul);
                element.appendChild(div);

                const action = (evt) => {
                    evt.preventDefault();
                    const backup = opened;
                    closeAllMenuContext(element);

                    opened = backup;

                    if (it.action) {
                        it.action(evt);
                    }

                    if (opened) {
                        element.classList.remove('debossed-small');
                        div.removeAttribute('style');
                    } else {
                        element.classList.add('debossed-small');
                        div.setAttribute('style', 'display: block;');
                    }
                    opened = !opened;

                    thisItemDown = false;
                };

                menuCloser.push((exclude) => {
                    if (exclude === element) return;
                    element.classList.remove('debossed-small');
                    div.removeAttribute('style');
                    opened = false;
                });

                menuItem.addEventListener('mouseup', action);
                menuItem.addEventListener('pointerup', action);
            } else {
                if (it.action) {
                    menuItem.addEventListener('mouseup', it.action);
                    menuItem.addEventListener('pointerup', it.action);
                } else {
                    menuItem.addEventListener('mouseup', (evt) => evt.preventDefault());
                    menuItem.addEventListener('pointerup', (evt) => evt.preventDefault());
                }
            }

            menu.appendChild(element);
        });
    }

    function autoplay() {
        if (gameover) return;

        function stopAutoplay() {
            if (autoplayTimer !== null) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
            render();
            saveState();
        }

        function step() {
            if (gameover || checkWin()) {
                stopAutoplay();
            }

            let changed = false;

            for (let j = 0; j < y; ++j) {
                for (let i = 0; i < x; ++i) {
                    // click surrounded
                    if (map[j][i] > 1 && map[j][i] < ITEM_MINE) {
                        const surroundedMines = getSurroundedMines(i, j);
                        const surroundedConfirms = getSurroundedConfirms(i, j);
                        if (surroundedMines === surroundedConfirms) {
                            for (let a = 0; a < 3; ++a) {
                                for (let b = 0; b < 3; ++b) {
                                    if (!(a === 1 && b === 1)) {
                                        if (clickItem(i + a - 1, j + b - 1, true)) {
                                            changed = true;
                                            startTime -= 3000;
                                        }
                                    }
                                }
                            }
                            if (changed) {
                                break;
                            }
                        }
                    }

                    // make a flag
                    if (map[j][i] > 1 && map[j][i] < ITEM_MINE && getSurroundedItems(i, j, [0, ITEM_MINE, ITEM_FLAG, ITEM_FLAG_WITH_MINE]) === map[j][i] - 1) {
                        for (let a = 0; a < 3; ++a) {
                            for (let b = 0; b < 3; ++b) {
                                if (!(a === 1 && b === 1)) {
                                    let c = i + a - 1;
                                    let d = j + b - 1;
                                    if ((c >= 0 && c < x && d >= 0 && d < y)) {
                                        if (map[d][c] === ITEM_MINE) {
                                            map[d][c] = ITEM_FLAG_WITH_MINE;
                                            --leftMinesUserThinks;
                                            changed = true;
                                            startTime -= 1000;
                                        } else if (map[d][c] === 0) {
                                            map[d][c] = ITEM_FLAG;
                                            --leftMinesUserThinks;
                                            changed = true;
                                            startTime -= 3000;
                                        } else {
                                            continue;
                                        }
                                        // render();
                                    }
                                }
                            }
                        }
                    }
                }   
                if (changed) break;
            }

            if (!changed) {
                if (leftMinesUserThinks > 0) {
                    let candidates = [];
                    for (let j = 0; j < y; ++j) {
                        for (let i = 0; i < x; ++i) {
                            if ([0, ITEM_MINE, ITEM_QUESTION, ITEM_QUESTION_WITH_MINE].includes(map[j][i])) {
                                candidates.push([i, j]);
                            }
                        }
                    }
                    candidates.sort((a, b) => Math.random() - 0.5);
                    let [a, b] = candidates.pop();
                    clickItem(a, b);
                }
            }

            render();
            saveState();

            if (!changed) {
                stopAutoplay();
            }
        }

        if (autoplayTimer !== null) {
            stopAutoplay();
            return;
        }

        autoplayTimer = setInterval(step, 200);        
    }

    function setDifficulty(newValue) {
        if (difficulty === newValue) {
            return;
        }
        difficulty = newValue;
        let settings = { x: 9, y: 9, mines: 10 };
        switch (difficulty) {
            case 'baby':
                settings = { x: 5, y: 5, mines: 6 };
                break;
            case 'beginner':
                settings = { x: 9, y: 9, mines: 10 };
                break;
            case 'novice':
                settings = { x: 9, y: 9, mines: 15 };
                break;
            case 'intermediate':
                settings = { x: 16, y: 16, mines: 40 };
                break;
            case 'expert':
                settings = { x: 16, y: 30, mines: 99 };
                break;
            case 'hard':
                settings = { x: 16, y: 40, mines: 135 };
                break;
            case 'insane':
                settings = { x: 20, y: 27, mines: 120 };
                break;
            default:
                break;
        }
        x = settings.x;
        y = settings.y;
        mines = settings.mines;

        initMap();
        createBoard();
        render();

        saveState();
    }

    function closeAllMenuContext(exclude) {
        menuCloser.forEach(it => it(exclude));
    }

    function resetGame() {
        if (gameover) {
            newGame();
            return true;
        } else {
            return false;
        }
    }

    function newGame() {
        initMap();
        render();
        startTimeIndicator();
        saveState();
    }

    function clickItem(i, j, prevent) {
        let changed = false;

        if (!(i >= 0 && i < x && j >= 0 && j < y)) {
            return false;
        }
        if (map[j][i] === 0 || map[j][i] === ITEM_QUESTION) {
            // clear
            const num = getSurroundedMines(i, j);
            map[j][i] = num + 1;
            ++openedItems;
            --notClicked;
            changed = true;
            if (num == 0) {
                for (let a = 0; a < 3; ++a) {
                    for (let b = 0; b < 3; ++b) {
                        if (!(a === 1 && b === 1)) {
                            changed = checkAndClick(i + a - 1, j + b - 1) || changed;
                        }
                    }
                }
            }
        } else if (map[j][i] === ITEM_MINE || map[j][i] === ITEM_QUESTION_WITH_MINE) {
            // mine
            if (openedItems === 0) {
                // guarantee first click is clear
                let candidates = [];
                for (let j = 0; j < y; ++j) {
                    for (let i = 0; i < x; ++i) {
                        if (map[j][i] === 0) {
                            candidates.push([i, j]);
                        }
                    }
                }
                candidates.sort(_ => Math.random() - 0.5);
                let [a, b] = candidates.pop();
                map[j][i] = 0;
                map[b][a] = ITEM_MINE;
                clickItem(i, j);
                return;
            }
            map[j][i] = ITEM_BOMBED_MINE;
            gameover = true;
            changed = true;
            endTimeIndicator();
        } else if (map[j][i] > 0 && map[j][i] < ITEM_MINE) {
            // surrounded opening
            if (prevent) return false;
            const surroundedMines = getSurroundedMines(i, j);
            const surroundedConfirms = getSurroundedConfirms(i, j);
            if (surroundedMines === surroundedConfirms) {
                for (let a = 0; a < 3; ++a) {
                    for (let b = 0; b < 3; ++b) {
                        if (!(a === 1 && b === 1)) {
                            changed = clickItem(i + a - 1, j + b - 1, true) || changed;
                        }
                    }
                }
            }
        }
        render();
        return changed;
    }

    function checkAndClick(i, j) {
        let changed = false;
        if (i >= 0 && i < x && j >= 0 && j < y) {
            if (map[j][i] === 0) {
                changed = clickItem(i, j) || changed;
            }
        }
        return changed;
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
        setItems();
        setSmiley();
        setLeft();
        setTime();
    }

    function setItems() {
        for (let j = 0; j < y; ++j) {
            for (let i = 0; i < x; ++i) {
                if (map[j][i] === ITEM_BOMBED_MINE || (gameover && (map[j][i] === ITEM_MINE || map[j][i] === ITEM_QUESTION_WITH_MINE))) {
                    items[j][i].classList.remove('red');
                    items[j][i].classList.remove('flag');
                    items[j][i].classList.remove('question');
                    items[j][i].classList.remove('no-mine');
                    items[j][i].classList.add('mine');
                    if (map[j][i] === ITEM_BOMBED_MINE) {
                        items[j][i].classList.add('red');
                    }
                    items[j][i].classList.add('mousedown');
                } else if (map[j][i] > 0 && map[j][i] < ITEM_MINE) {
                    items[j][i].classList.remove('red');
                    items[j][i].classList.remove('mine');
                    items[j][i].classList.remove('flag');
                    items[j][i].classList.remove('question');
                    items[j][i].classList.remove('no-mine');
                    items[j][i].classList.add(`number-${map[j][i] - 1}`);
                    items[j][i].classList.add('mousedown');
                } else if (map[j][i] === 0 || map[j][i] === ITEM_MINE) {
                    items[j][i].classList.remove('red');
                    items[j][i].classList.remove('mine');
                    items[j][i].classList.remove('flag');
                    items[j][i].classList.remove('question');
                    items[j][i].classList.remove('no-mine');
                    items[j][i].classList.remove('mousedown');
                    for (let k = 1; k < 9; ++k) {
                        items[j][i].classList.remove(`number-${k}`);
                    }
                } else if (map[j][i] === ITEM_FLAG || map[j][i] === ITEM_FLAG_WITH_MINE) {
                    items[j][i].classList.remove('red');
                    items[j][i].classList.remove('question');
                    items[j][i].classList.add('flag');
                    items[j][i].classList.remove('mousedown');
                    if (gameover && map[j][i] === ITEM_FLAG) {
                        items[j][i].classList.add('no-mine');
                    } else {
                        items[j][i].classList.remove('no-mine');
                    }
                } else if (map[j][i] === ITEM_QUESTION || map[j][i] === ITEM_QUESTION_WITH_MINE) {
                    items[j][i].classList.remove('red');
                    items[j][i].classList.remove('flag');
                    items[j][i].classList.add('question');
                    items[j][i].classList.remove('no-mine');
                    items[j][i].classList.remove('mousedown');
                }
            }
        }
    }

    function setLeft() {
        const number = (leftMinesUserThinks < 0 ? 0 : leftMinesUserThinks);
        let text = number + '';
        const char = '<span class="ambient digital-red">8</span>';
        if (text.length < 3) {
            text = char.repeat(3 - text.length) + text;
        }
        left.innerHTML = text;
    }

    function setTime() {
        const elapsedTime = Math.floor((new Date().getTime() - startTime) / 1000.0);
        let text = elapsedTime + '';
        const char = '<span class="ambient digital-red">8</span>';
        if (text.length < 3) {
            text = char.repeat(3 - text.length) + text;
        } else {
            text = text.substring(text.length - 3, text.length);
        }
        time.innerHTML = text;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function getSurroundedMines(a, b) {
        const bombs = [ITEM_MINE, ITEM_BOMBED_MINE, ITEM_FLAG_WITH_MINE, ITEM_QUESTION_WITH_MINE];
        return getSurroundedItems(a, b, bombs);
    }

    function getSurroundedConfirms(a, b) {
        const confirms = [ITEM_FLAG, ITEM_FLAG_WITH_MINE];
        return getSurroundedItems(a, b, confirms);
    }

    function getSurroundedItems(a, b, types) {
        let result = 0;
        for (let j = 0; j < 3; ++j) {
            for (let i = 0; i < 3; ++i) {
                if (i === 1 && j === 1) continue;
                const c = a + i - 1;
                const d = b + j - 1;
                if (c >= 0 && c < x && d >= 0 && d < y) {
                    if (types.includes(map[d][c])) {
                        ++result;
                    }
                }
            }
        }
        return result;
    }

    function checkWin() {
        if (notClicked === mines) {
            endTimeIndicator();
            gameover = true;
            win = true;
            leftMinesUserThinks = 0;
            for (let j = 0; j < y; ++j) {
                for (let i = 0; i < x; ++i) {
                    if (map[j][i] === ITEM_MINE) {
                        map[j][i] = ITEM_FLAG_WITH_MINE;
                    }
                }
            }
            return true;
        }
        return false;
    }

    function startTimeIndicator() {
        if (!gameover) {
            endTimeIndicator();
            timeIndicator = setInterval(() => {
                setTime();
            }, 500);
        }
    }

    function endTimeIndicator() {
        if (timeIndicator !== null) {
            clearInterval(timeIndicator);
            timeIndicator = null;
        }
    }

    function initializeTheme() {
        const dataTheme = 'data-theme';
        document.documentElement.setAttribute(dataTheme, 'light');
        theme.innerHTML = '🌙';
        const mouseUpAction = () => {
            let newTheme = 'light';
            if (document.documentElement.getAttribute(dataTheme) === 'dark') {
                theme.innerHTML = '🌙';
                newTheme = 'light';
                document.documentElement.setAttribute(dataTheme, newTheme);
            } else {
                theme.innerHTML = '☀️';
                newTheme = 'dark';
                document.documentElement.setAttribute(dataTheme, newTheme);
            }
            localStorage.setItem(`${keyPrefix}/theme`, newTheme);
        };
        theme.addEventListener('mouseeup', mouseUpAction);
        theme.addEventListener('pointerup', mouseUpAction);
        detectColorScheme();
    }

    function detectColorScheme() {
        const dataTheme = 'data-theme';
        let theme = "light";

        if (localStorage.getItem(`${keyPrefix}/theme`)) {
            if (localStorage.getItem(`${keyPrefix}/theme`) === "dark") {
                theme = "dark";
            }
        } else if (!window.matchMedia) {
            return false;
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            theme = "dark";
        } else {
            theme = "light";
        }

        document.documentElement.setAttribute(dataTheme, theme);

        setThemeButtonState();
    }

    function setThemeButtonState() {
        const dataTheme = 'data-theme';
        if (document.documentElement.getAttribute(dataTheme) === 'dark') {
            theme.innerHTML = '☀️';
        } else {
            theme.innerHTML = '🌙';
        }
    }

    function saveState() {
        const data = {
            difficulty,
            x,
            y,
            mines, 
            map,
            mineCoords,
            gameover,
            win,
            score,
            notClicked,
            leftMinesUserThinks,
            startTime
        };

        const json = JSON.stringify(data);
        window.localStorage.setItem(`${keyPrefix}/data`, json);
    }

    function loadState() {
        const json = window.localStorage.getItem(`${keyPrefix}/data`);
        if (!json || json === '') return;
        try {
            const data = JSON.parse(json);

            difficulty = data.difficulty;
            x = data.x;
            y = data.y;
            mines = data.mines;
            map = data.map;
            mineCoords = data.mineCoords;
            gameover = data.gameover;
            win = data.win;
            score = data.score;
            notClicked = data.notClicked;
            leftMinesUserThinks = data.leftMinesUserThinks;
            startTime = data.startTime;
        } catch {
            window.localStorage.removeItem(`${keyPrefix}/data`);
        }
    }
};
