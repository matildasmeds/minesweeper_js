/*jslint browser: true*/
/*jslint node: true */
// Start buttons call createGame at onClick event
'use strict';
var MINESWEEPER; // minemap, game state, cell manipulation
function Game(width, height, seed) {
    // private helper
    function booleanCellsMap(width, height) {
        var map = [],
            x,
            y;
        for (x = 0; x < width; x += 1) {
            map[x] = [];
            for (y = 0; y < height; y += 1) {
                map[x][y] = false;
            }
        }
        return map;
    }

    var mineMap = [],
        openedCellsMap = booleanCellsMap(width, height),
        markedCellsMap = booleanCellsMap(width, height);

    this.mineCount = null;
    this.safeCellsCount = null;

    // cell value queries
    this.valueAt = function (cell) {
        return mineMap[cell.x][cell.y];
    };

    // check boolean queries
    this.isInside = function (x, y) {
        return (0 <= x && x < width && 0 <= y && y < height);
    };
    this.notOpened = function (cell) {
        return !openedCellsMap[cell.x][cell.y];
    };
    this.notMarked = function (cell) {
        return !markedCellsMap[cell.x][cell.y];
    };
    this.isMineCell = function (cell) {
        return this.valueAt(cell) === 'X' ? true : false;
    };
    this.canBeOpened = function (cell) {
        return (this.notOpened(cell) && !this.isMineCell(cell) && this.notMarked(cell));
    };

    // retrieve cell
    this.Cell = function (x, y) {
        var query = 'span[data-x="' + x + '"][data-y="' + y + '"]';
        this.elt = document.querySelectorAll(query)[0];
        this.x = x;
        this.y = y;
    };
    this.getCellFrom = function (evt) {
        var x = parseInt(evt.target.getAttribute('data-x'), 10),
            y = parseInt(evt.target.getAttribute('data-y'), 10);
        return new this.Cell(x, y);
    };

    // retrieve coords / cells
    this.neighbourCoords = function (x, y) {
        var arr = [[x - 1, y], [x + 1, y], [x, y - 1],
                  [x, y + 1], [x - 1, y - 1], [x - 1, y + 1],
                  [x + 1, y - 1], [x + 1, y + 1]],
            ret = [],
            i,
            x1,
            y1;
        for (i = 0; i < arr.length; i += 1) {
            x1 = arr[i][0];
            y1 = arr[i][1];
            if (this.isInside(x1, y1)) {
                ret.push(arr[i]);
            }
        }
        return ret;
    };
    this.neighbourCellsFor = function (cell) {
        var ret = [],
            neighbours = this.neighbourCoords(cell.x, cell.y),
            i,
            x,
            y,
            retrieved_cell;
        for (i = 0; i < neighbours.length; i += 1) {
            x = neighbours[i][0];
            y = neighbours[i][1];
            retrieved_cell = new this.Cell(x, y);
            ret.push(retrieved_cell);
        }
        return ret;
    };
    this.cellsNotOpened = function () {
        var ret = [],
            x,
            y;
        for (x = 0; x < width; x += 1) {
            for (y = 0; y < height; y += 1) {
                if (!openedCellsMap[x][y]) {
                    ret.push(new this.Cell(x, y));
                }
            }
        }
        return ret;
    };
    this.remainingCellsWithMines = function (cell) {
        var ret = [],
            x,
            y,
            new_cell;
        for (x = 0; x < width; x += 1) {
            for (y = 0; y < height; y += 1) {
                // ignore the opened mine
                if (!(cell.x === x && cell.y === y)) {
                    new_cell = new this.Cell(x, y);
                    if (this.isMineCell(new_cell)) {
                        ret.push(new_cell);
                    }
                }
            }
        }
        return ret;
    };

    // modify cell
    this.markOpened = function (cell) {
        openedCellsMap[cell.x][cell.y] = true;
        this.safeCellsCount -= 1;
    };
    this.markMarked = function (cell) {
        markedCellsMap[cell.x][cell.y] = true;
    };
    this.unMark = function (cell) {
        markedCellsMap[cell.x][cell.y] = false;
    };
    this.removeListeners = function (cell) {
        // this method is quirky, especially as it 1) has a return value,
        // and 2) it returns an element not a cell
        // apparently replacing child is a good way to remove listeners
        // that's the rationale for the quirkiness
        var new_elt = cell.elt.cloneNode(true);
        cell.elt.parentNode.replaceChild(new_elt, cell.elt);
        return new_elt;
    };
    this.openThis = function (cell) {
        var val = this.valueAt(cell),
            new_elt = this.removeListeners(cell);
        (function setOpenedCellStyle() {
            new_elt.className = 'row__cell opened';
            new_elt.innerHTML = (val === 0 ? '' : val);
        }());
        this.markOpened(cell);
        if (this.safeCellsCount === 0) {
            this.gameCompleted(cell);
        }
    };
    this.setMineStyle = function (elt, modifier) {
        elt.className = 'row__cell ' + modifier;
    };

    // modify multiple cells
    this.removeRemainingListeners = function () {
        var cells = this.cellsNotOpened(),
            i;
        for (i = 0; i < cells.length; i += 1) {
            this.removeListeners(cells[i]);
        }
    };
    this.revealMines = function (cell) {
        var cells = this.remainingCellsWithMines(cell),
            i,
            curr;
        for (i = 0; i < cells.length; i += 1) {
            curr = cells[i];
            if (this.notMarked(curr)) {
                curr.elt.innerHTML = String.fromCharCode(164);
                this.setMineStyle(curr.elt, 'mine revealed');
            } else {
                this.setMineStyle(curr.elt, 'mine correct');
                markedCellsMap[curr.x][curr.y] = false;
            }
        }
    };
    this.revealIncorrectMines = function () {
        var x, y, cell;
        for (x = 0; x < width; x += 1) {
            for (y = 0; y < height; y += 1) {
                if (markedCellsMap[x][y]) {
                    cell = new this.Cell(x, y);
                    this.setMineStyle(cell.elt, 'mine incorrect');
                }
            }
        }
    };

    // game creation and start methods
    this.createMines = function (cellClicked) {
        // private helper
        var game = this;
        function populateMineMap(height, width, cellClicked, game) {
          // private helper
            function tallyNeighbourMines(map, mineCoords, game) {
                var p, x0, y0, coords, q, x, y;
                for (p = 0; p < mineCoords.length; p += 1) {
                    x0 = mineCoords[p][0];
                    y0 = mineCoords[p][1];
                    coords = game.neighbourCoords(x0, y0);
                    for (q = 0; q < coords.length; q += 1) {
                        x = coords[q][0];
                        y = coords[q][1];
                        if (game.isInside(x, y) && (map[x][y] !== 'X')) { map[x][y] += 1; }
                    }
                }
            }
            // private helpers
            function doCreateMine(x, y, cellClicked) {
                // do not put a mine in the first cell clicked
                return Math.random() < seed && !(cellClicked.x === x && cellClicked.y === y);
            }
            function createMine(map, x, y, mineCoords) {
                map[x][y] = 'X';
                mineCoords.push([x, y]);
                game.mineCount += 1;
            }
            function createEmpty(map, x, y) {
                map[x][y] = 0;
                game.safeCellsCount += 1;
            }
            // create mines main method
            var mineCoords = [],
                map = [],
                x,
                y;
            for (x = 0; x < width; x += 1) {
                map[x] = [];
                for (y = 0; y < height; y += 1) {
                    if (doCreateMine(x, y, cellClicked)) {
                        createMine(map, x, y, mineCoords);
                    } else {
                        createEmpty(map, x, y);
                    }
                }
            }
            // setup board
            tallyNeighbourMines(map, mineCoords, game);
            return map;
        }
        // setup board
        mineMap = populateMineMap(height, width, cellClicked, game);
    };

    this.gameStarted = function () {
        return mineMap.length > 0;
    };
    this.startGame = function (clickedCell) {
        this.createMines(clickedCell);
        this.showMineCount(this.mineCount);
        this.showGameStatus('Playing...');

    };
    this.gameCompleted = function (cell) {
        this.showGameStatus('You Win!');
        this.revealMines(cell);
        this.removeRemainingListeners();
    };
    this.gameOver = function (cell) {
        this.showGameStatus('Game Over!');
        this.revealMines(cell);
        this.setMineStyle(cell.elt, 'mine exploded');
        cell.elt.innerHTML = String.fromCharCode(164);
        this.revealIncorrectMines();
        this.removeRemainingListeners();
    };

    // game information display methods
    this.showGameStatus = function (status) {
        var div = document.getElementById('game-status');
        div.innerHTML = status;
    };
    this.showMineCount = function (count) {
        var div = document.getElementById('mine-count');
        div.innerHTML = count;
    };
    this.clearDisplays = function () {
        MINESWEEPER.showGameStatus('&nbsp;');
        MINESWEEPER.showMineCount('&nbsp');
    };
}

// Will be bound to start buttons
function createGame(params) {
    MINESWEEPER = new Game(params.width, params.height, params.seed);
    // BoardElements are inserted inside #board div
    // The basic units are rows and cells
    // Cells have listeners mouseover, mousedown, and mouseout
    // The game logic is described here and handlers attached to listeners
    // Starting the game, ending the game, evaluating clicks happen here
    function createBoardElements(width, height) {
        var board = document.getElementById('board');
        // clear previous board, if present
        (function clear() {
            MINESWEEPER.clearDisplays();
            while (board.firstChild) {
                board.removeChild(board.firstChild);
            }
        }());
        function setEventHandlersTo(elt) {

            function executeClickOpen(cell) {

                function checkNeighbours(cell) {
                    return MINESWEEPER.valueAt(cell) === 0;
                }

                function examineNeighbours(cell) {
                    var arr = MINESWEEPER.neighbourCellsFor(cell),
                        i,
                        curr;
                    for (i = 0; i < arr.length; i += 1) {
                        curr = arr[i];
                        if (MINESWEEPER.canBeOpened(curr)) {
                            MINESWEEPER.openThis(curr);
                            if (checkNeighbours(curr)) {
                                examineNeighbours(curr);
                            }
                        }
                    }
                }

                if (MINESWEEPER.isMineCell(cell)) {
                    MINESWEEPER.gameOver(cell);
                } else {
                    MINESWEEPER.openThis(cell);
                    if (checkNeighbours(cell)) {
                        examineNeighbours(cell);
                    }
                }
            }

            function clickOpen(cell) {
                if (!MINESWEEPER.gameStarted()) { MINESWEEPER.startGame(cell); }
                executeClickOpen(cell);
            }

            function unMark(evt) {
                var cell = MINESWEEPER.getCellFrom(evt);
                MINESWEEPER.unMark(cell);
                elt = MINESWEEPER.removeListeners(cell);
                addDefaultListeners(elt); // how to refactor this to pass jslint?
            }

            function markThis(cell) {
                MINESWEEPER.markMarked(cell);
                elt = MINESWEEPER.removeListeners(cell);
                elt.addEventListener('mousedown', unMark);
                elt.className = 'row__cell marked';
                elt.innerHTML = 'X';
            }

            function addDefaultListeners(elt) {
                function clickNotMarked(evt) {
                    var cell = MINESWEEPER.getCellFrom(evt);
                    if (evt.which === 1) { // leftclick
                        clickOpen(cell);
                    } else { // middleclick & rightclick
                        markThis(cell);
                    }
                }
                function mouseOverHandler(evt) {
                    (function setHoverStyle() {
                        elt = evt.target;
                        elt.innerHTML = '?';
                        elt.className += ' hover';
                    }());
                }
                function mouseOutHandler(evt) {
                    (function resetHoverStyle() {
                        elt = evt.target;
                        elt.innerHTML = '';
                        elt.className = 'row__cell';
                    }());
                }
                elt.addEventListener('mousedown', clickNotMarked);
                elt.addEventListener('mouseover', mouseOverHandler);
                elt.addEventListener('mouseout', mouseOutHandler);
            }

            addDefaultListeners(elt);

        }

        (function disableContextMenu() { // from SO, enables right click features
            board.oncontextmenu = function (evt) {
                (function stopEvent() {
                    if (evt.preventDefault !== undefined) { evt.preventDefault(); }
                    if (evt.stopPropagation !== undefined) { evt.stopPropagation(); }
                }());
            };
        }());
        function addCellElementTo(row, i) {
            var elt = document.createElement('span');
            row.appendChild(elt);
            elt.setAttribute('class', 'row__cell');
            elt.setAttribute('data-x', i);
            elt.setAttribute('data-y', elt.parentNode.getAttribute('data-y'));
            setEventHandlersTo(elt);
        }
        function createRowElement(j) {
            var row = document.createElement('div'), i;
            row.setAttribute('class', 'row');
            row.setAttribute('data-y', j);
            for (i = 0; i < width; i += 1) {
                addCellElementTo(row, i);
            }
            return row;
        }
        function createRows(board) {
            var j;
            for (j = 0; j < height; j += 1) {
                board.appendChild(createRowElement(j));
            }
        }
        createRows(board);
    }
    createBoardElements(params.width, params.height);
}

// User creates a new game by pressing start buttons
function createStartButtons() {
    function createButton(text, className, params) {
        var button = document.createElement('button');
        button.innerHTML = text;
        button.className = className;
        button.addEventListener('click', function () {
            createGame(params);
        });
        return button;
    }
    var div = document.getElementById('start-buttons'),
        params;
    params = { width: 15, height: 15, seed: 0.083 };
    div.appendChild(createButton('Easy', 'easy', params));
    params = { width: 30, height: 20, seed: 0.134 };
    div.appendChild(createButton('Intermediate', 'intermediate', params));
    params = { width: 54, height: 30, seed: 0.15};
    div.appendChild(createButton('Hard', 'hard', params));
}

createStartButtons();
