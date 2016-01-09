/*jslint browser: true*/
/*jslint node: true */
// Start buttons call createGame at onClick event
'use strict';
// Game, references through window.game holds mine map and game state
function Game(width, height, seed) {
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
    this.width = width;
    this.height = height;
    this.seed = seed;
    this.mineMap = [];
    this.openedCellsMap = booleanCellsMap(width, height);
    this.markedCellsMap = booleanCellsMap(width, height);
    this.mineCount = null;
}
(function setupGameMethods() {
// Wrap the Board prototype setup methods in a function?
    Game.prototype.startGame = function (clickedCell) {
        this.createMines(clickedCell);
    };
    Game.prototype.gameStarted = function () {
        return this.mineMap.length > 0;
    };
    Game.prototype.isInside = function (x, y) {
        return (0 <= x && x < this.width && 0 <= y && y < this.height);
    };
    Game.prototype.neighbourCoords = function (x, y) {
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
    Game.prototype.Cell = function (x, y) {
        var query = 'span[data-x="' + x + '"][data-y="' + y + '"]';
        this.elt = document.querySelectorAll(query)[0];
        this.x = x;
        this.y = y;
    };
    Game.prototype.neighbourCellsFor = function (cell) {
        var ret = [],
            neighbours = window.game.neighbourCoords(cell.x, cell.y),
            i,
            x,
            y,
            retrieved_cell;
        for (i = 0; i < neighbours.length; i += 1) {
            x = neighbours[i][0];
            y = neighbours[i][1];
            retrieved_cell = new window.game.Cell(x, y);
            ret.push(retrieved_cell);
        }
        return ret;
    };
    Game.prototype.markOpened = function (cell) {
        this.openedCellsMap[cell.x][cell.y] = true;
    };
    Game.prototype.notOpened = function (cell) {
        return !this.openedCellsMap[cell.x][cell.y];
    };
    Game.prototype.cellsNotOpened = function () {
        var ret = [],
            x,
            y;
        for (x = 0; x < this.width; x += 1) {
            for (y = 0; y < this.height; y += 1) {
                if (!this.openedCellsMap[x][y]) {
                    ret.push(new this.Cell(x, y));
                }
            }
        }
        return ret;
    };
    Game.prototype.remainingCellsWithMines = function (cell) {
        var ret = [],
            x,
            y,
            new_cell;
        console.log(cell);
        for (x = 0; x < this.width; x += 1) {
            for (y = 0; y < this.height; y += 1) {
                // ignore the opened mine
                if (!(cell.x === x && cell.y === y)) {
                    new_cell = new this.Cell(x, y);
                    if (window.game.isMineCell(new_cell)) {
                        ret.push(new_cell);
                    }
                }
            }
        }
        return ret;
    };
    Game.prototype.markMarked = function (cell) {
        this.markedCellsMap[cell.x][cell.y] = true;
    };
    Game.prototype.notMarked = function (cell) {
        return !this.markedCellsMap[cell.x][cell.y];
    };
    Game.prototype.valueAt = function (cell) {
        return this.mineMap[cell.x][cell.y];
    };
    Game.prototype.isMineCell = function (cell) {
        return window.game.valueAt(cell) === 'X' ? true : false;
    };
    Game.prototype.createMines = function (cellClicked) {
        // private helper
        function mineMap(height, width, cellClicked) {
          // private helper
            function tallyNeighbourMines(map, mineCoords) {
                var p, x0, y0, coords, q, x, y;
                for (p = 0; p < mineCoords.length; p += 1) {
                    x0 = mineCoords[p][0];
                    y0 = mineCoords[p][1];
                    coords = window.game.neighbourCoords(x0, y0);
                    for (q = 0; q < coords.length; q += 1) {
                        x = coords[q][0];
                        y = coords[q][1];
                        if (window.game.isInside(x, y) && (map[x][y] !== 'X')) { map[x][y] += 1; }
                    }
                }
            }
            // private helpers
            function doCreateMine(x, y, cellClicked) {
                // do not put a mine in the first cell clicked
                return Math.random() < window.game.seed && !(cellClicked.x === x && cellClicked.y === y);
            }
            function createMine(map, x, y, mineCoords) {
                map[x][y] = 'X';
                mineCoords.push([x, y]);
            }
            function createEmpty(map, x, y) {
                map[x][y] = 0;
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
            tallyNeighbourMines(map, mineCoords);
            window.game.mineCount = mineCoords.length;
            return map;
        }
        // setup board
        this.mineMap = mineMap(this.height, this.width, cellClicked);
        console.log(this.mineMap);
    };
}());
// BoardElements are inserted inside #board div
// The basic units are rows and cells
// Cells have listeners mouseover, mousedown, and mouseout
// The game logic is described here and handlers attached to listeners
// Starting the game, ending the game, evaluating clicks happen here
function createBoardElements(width, height) {
    var board = document.getElementById('board');
    // clear previous board, if present
    (function clear() {
        while (board.firstChild) {
            board.removeChild(board.firstChild);
        }
    }());
    function setEventHandlersTo(elt) {

        function executeClickOpen(cell) {

            function loseGame(cell) {

                function setMineStyle(elt, modifier) {
                    elt.innerHTML = String.fromCharCode(164);
                    elt.className = 'row__cell ' + modifier;
                }

                function revealMines(cell) {
                    var cells = window.game.remainingCellsWithMines(cell),
                        i;
                    for (i = 0; i < cells.length; i += 1) {
                        setMineStyle(cells[i].elt, 'mine revealed');
                    }
                }

                revealMines(cell);
                elt = window.game.lib.removeListeners(cell);
                setMineStyle(elt, 'mine exploded');
                (function removeRemainingListeners() {
                    var cells = window.game.cellsNotOpened(),
                        i;
                    for (i = 0; i < cells.length; i += 1) {
                        window.game.lib.removeListeners(cells[i]);
                    }
                }());
            }

            function checkNeighbours(cell) {

                return window.game.valueAt(cell) === 0;
            }

            function examineNeighbours(cell) {
                var arr = window.game.neighbourCellsFor(cell),
                    i,
                    curr;
                for (i = 0; i < arr.length; i += 1) {
                    curr = arr[i];
                    if (window.game.lib.canBeOpened(curr)) {
                        window.game.lib.openThis(curr);
                        if (checkNeighbours(curr)) {
                            examineNeighbours(curr);
                        }
                    }
                }
            }

            if (window.game.isMineCell(cell)) {
                loseGame(cell);
            } else {
                window.game.lib.openThis(cell);
                if (checkNeighbours(cell)) {
                    examineNeighbours(cell);
                }
            }
        }

        function clickOpen(cell) {
            if (!window.game.gameStarted()) { window.game.startGame(cell); }
            executeClickOpen(cell);
        }

        function unMark(evt) {
            if (evt.which === 1) { return; }
            var cell = window.game.lib.getCellFrom(evt);
            elt = window.game.lib.removeListeners(cell);
            addListeners(elt); // how to refactor this to pass jslint?
            console.log(cell);
        }

        function markThis(cell) {
            window.game.markMarked(cell);
            elt = window.game.lib.removeListeners(cell);
            elt.addEventListener('mousedown', unMark);
            elt.className = 'row__cell marked';
            elt.innerHTML = 'X';
        }

        function clickNotMarked(evt) {
            var cell = window.game.lib.getCellFrom(evt);
            if (evt.which === 1) { // leftclick
                clickOpen(cell);
            } else { // middleclick & rightclick
                markThis(cell);
            }
        }

        // Event handler definitions
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
        function addListeners(elt) {
            elt.addEventListener('mousedown', clickNotMarked);
            elt.addEventListener('mouseover', mouseOverHandler);
            elt.addEventListener('mouseout', mouseOutHandler);
        }

        addListeners(elt);
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
// Will be bound to start buttons
function createGame(params) {
    createBoardElements(params.width, params.height);
    window.game = new Game(params.width, params.height, params.seed);
    // the ingame logic can be written more neatly, if I define more
    // of the methods as properties of game object
    var lib = {};
    lib.removeListeners = function (cell) {
        // this method is quirky, especially as it 1) has a return value,
        // and 2) it returns an element not a cell
        // apparently replacing child is a good way to remove listeners
        // that's the rationale for the quirkiness
        if (cell === 'undefined') { return; }
        var new_elt = cell.elt.cloneNode(true);
        cell.elt.parentNode.replaceChild(new_elt, cell.elt);
        return new_elt;
    };
    lib.getCellFrom = function (evt) {
        if (evt === 'undefined') { return; }
        var x = parseInt(evt.target.getAttribute('data-x'), 10),
            y = parseInt(evt.target.getAttribute('data-y'), 10);
        return new window.game.Cell(x, y);
    };
    lib.canBeOpened = function (cell) {
        if (cell === 'undefined') { return; }
        return (window.game.notOpened(cell) && !window.game.isMineCell(cell) && window.game.notMarked(cell));
    };
    lib.openThis = function (cell) {
        if (cell === 'undefined') { return; }
        (function setOpenedStyle() {
            var val = window.game.valueAt(cell),
                new_elt = cell.elt.cloneNode(true);
            new_elt.className = 'row__cell opened';
            new_elt.innerHTML = (val === 0 ? '' : val);
            cell.elt.parentNode.replaceChild(new_elt, cell.elt);
        }());
        window.game.markOpened(cell);
    };
    window.game.lib = lib;
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
    params = { width: 2, height: 4, seed: 1 };
    div.appendChild(createButton('Test1', 'test1', params));
    params = { width: 4, height: 2, seed: 1 };
    div.appendChild(createButton('Test2', 'test2', params));
    params = { width: 15, height: 15, seed: 0.19 };
    div.appendChild(createButton('Easy', 'easy', params));
    params = { width: 30, height: 20, seed: 0.14 };
    div.appendChild(createButton('Intermediate', 'intermediate', params));
    params = { width: 54, height: 30, seed: 0.19};
    div.appendChild(createButton('Hard', 'hard', params));
}
createStartButtons();
