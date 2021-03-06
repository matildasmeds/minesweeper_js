'use strict';
// Game contains all game logic, knowledge of game parameters, status,
// handler methods, cell and map query and modification methods
function game(width, height, mineFrequency) {
    game.dimensions = {width: width, height: height};
    game.mineFrequency = mineFrequency;
    game.maps = {
        mines: [],
        openedCells: game.init.booleanMap(width, height, false),
        markedCells: game.init.booleanMap(width, height, false)
    };
}

game.init = {
    mineMap: function (cellClicked) {
        // Returns minemap with minecounts
        // Sets game.status.mineCount, usage: display mine count to user
        // Initializes game.status.unopenedSafeCellsCount, usage: when reached
        // zero, game is one, i.e. all safe cells have been opened
        var map = [],
            mineCoords = [],
            height = game.dimensions.height,
            width = game.dimensions.width,
            totalCells = height * width,
            x,
            y;
            for (x = 0; x < width; x += 1) {
                map[x] = [];
                for (y = 0; y < height; y += 1) {
                    if (game.init.shouldAddMine(x, y, cellClicked)) {
                        game.init.addMine(map, x, y, mineCoords);
                    } else {
                        game.init.addSafe(map, x, y);
                    }
                }
            }
        game.init.addMineCountsToMap(map, mineCoords);
        game.status.mineCount = mineCoords.length;
        game.status.unopenedSafeCellsCount = totalCells - game.status.mineCount;
        game.maps.mines = map;
    },
    shouldAddMine: function (x, y, cellClicked) {
        // do not put a mine in the first cell clicked
        return Math.random() < game.mineFrequency && !(cellClicked.x === x && cellClicked.y === y);
    },
    addMine: function (map, x, y, mineCoords) {
        map[x][y] = 'X';
        mineCoords.push([x, y]);
    },
    addSafe: function (map, x, y) {
        map[x][y] = 0;
    },
    addMineCountsToMap: function(map, mineCoords) {
        var p, x0, y0, coords, q, x, y;
        for (p = 0; p < mineCoords.length; p += 1) {
            x0 = mineCoords[p][0];
            y0 = mineCoords[p][1];
            coords = game.coords.getNeighbours(x0, y0);
            for (q = 0; q < coords.length; q += 1) {
                x = coords[q][0];
                y = coords[q][1];
                if (game.coords.isInside(x, y) && (map[x][y] !== 'X'))
                    { map[x][y] += 1; }
            }
        }
    },
    booleanMap: function(width, height, bool) {
        var map = [],
            x,
            y;
        for (x = 0; x < width; x += 1) {
            map[x] = [];
            for (y = 0; y < height; y += 1) {
                map[x][y] = bool;
            }
        }
        return map;
    }
};

game.status = {
    isStarted: function () {
        return game.maps.mines.length > 0;
    },
    showGameStatus: function (status) {
        var div = document.getElementById('game-status');
        div.innerHTML = status;
    },
    showMineCount: function (count) {
        var div = document.getElementById('mine-count');
        div.innerHTML = count;
    },
    clearDisplays: function () {
        game.status.showGameStatus('&nbsp;');
        game.status.showMineCount('&nbsp');
    }
};

game.statusChanges = {
    start: function (clickedCell) {
        game.init.mineMap(clickedCell);
        game.status.showMineCount(game.status.mineCount);
        game.status.showGameStatus('Playing...');
    },
    win: function (cell) {
        game.status.showGameStatus('You Win!');
        game.cells.update.showMines(cell);
        game.cells.update.removeListeners();
    },
    lose: function (cell) {
        game.status.showGameStatus('Game Over!');
        game.cells.update.showMines(cell);
        cell.update.setStyle('mine exploded');
        cell.elt.innerHTML = String.fromCharCode(164);
        game.cells.update.showIncorrectMines();
        game.cells.update.removeListeners();
    }
};

game.logic = {
    examineNeighbours: function(cell) {
        var arr = game.cells.get.neighbours(cell),
            i,
            var_cell;
        for (i = 0; i < arr.length; i += 1) {
            var_cell = arr[i];
            if (var_cell.query.canBeOpened()) {
                var_cell.update.open();
                // open all possible neighbours
                if (this.shouldExamineNeighbours(var_cell)) {
                    this.examineNeighbours(var_cell);
                }
            }
        }
    },
    shouldExamineNeighbours: function(cell) {
        return cell.query.value() === 0;
    },
    clickOpen: function(cell) {
        // start if not yet started
        if (!game.status.isStarted()) { game.statusChanges.start(cell); }
        // evaluate game status
        if (cell.query.isMineCell()) {
            game.statusChanges.lose(cell);
        } else { // continue game
            cell.update.open();
            if (game.logic.shouldExamineNeighbours(cell)) {
                game.logic.examineNeighbours(cell);
            }
        }
    }
};

game.handlers = {
    openOrMark: function(evt) {
        var cell = game.Cell.getFrom(evt);
        if (game.handlers.isLeftClick(evt)) {
            game.logic.clickOpen(cell);
        } else {
            game.handlers.mark(cell);
        }
    },
    isLeftClick: function(evt) {
        return (evt.which === 1);
    },
    mark: function(cell) {
        cell.update.mark();
        var elt = cell.update.removeListeners();
        elt.addEventListener('mousedown', game.handlers.unMark);
        elt.className = 'row__cell marked';
        elt.innerHTML = 'X';
    },
    unMark: function(evt) {
        if (game.handlers.isLeftClick(evt))
            { return; }
        var cell = game.Cell.getFrom(evt),
            elt;
        cell.update.unMark();
        elt = cell.update.removeListeners();
        game.handlers.addEventListeners(elt);
    },
    setHoverStyle: function(evt) {
        var elt = evt.target;
        elt.innerHTML = '?';
        elt.className += ' hover';
    },
    removeHoverStyle: function(evt) {
        var elt = evt.target;
        elt.innerHTML = '';
        elt.className = 'row__cell';
    },
    addEventListeners: function(elt) {
        elt.addEventListener('mousedown', this.openOrMark);
        elt.addEventListener('mouseover', this.setHoverStyle);
        elt.addEventListener('mouseout', this.removeHoverStyle);
    }
};

game.Cell = function (x, y) {
    var select = 'span[data-x="' + x + '"][data-y="' + y + '"]';
    this.elt = document.querySelectorAll(select)[0];
    this.x = x;
    this.y = y;

    this.query = {
        value: function () {
            return game.maps.mines[this.x][this.y];
        },
        notOpened: function () {
            return !game.maps.openedCells[this.x][this.y];
        },
        isMarked: function () {
            return game.maps.markedCells[this.x][this.y];
        },
        isMineCell: function () {
            return this.value() === 'X' ? true : false;
        },
        canBeOpened: function () {
           return (this.notOpened() && !this.isMineCell() && !this.isMarked());
        }
    };

    this.update = {
        open: function () {
            this.markOpened();
            this.updateMapsAndStatus();
            // evaluate game status
            if (game.status.unopenedSafeCellsCount === 0) {
                game.statusChanges.win(this.cell);
            }
        },
        markOpened: function () {
            var val = this.cell.query.value(),
                new_elt = this.removeListeners();
            new_elt.className = 'row__cell opened';
            new_elt.innerHTML = (val === 0 ? '' : val);
        },
        removeListeners: function () {
            // seek to replace this quirky, SO influenced structure
            var new_elt = this.elt.cloneNode(true);
            this.elt.parentNode.replaceChild(new_elt, this.elt);
            return new_elt;
        },
        updateMapsAndStatus: function () {
            game.maps.openedCells[this.x][this.y] = true;
            game.status.unopenedSafeCellsCount -= 1;
        },
        mark: function () {
            game.maps.markedCells[this.x][this.y] = true;
        },
        unMark: function () {
            game.maps.markedCells[this.x][this.y] = false;
        },
        setStyle: function (modifier) {
            this.elt.className = 'row__cell ' + modifier;
        }
    };

    // give necessary access query and update methods
    this.query.x = x;
    this.query.y = y;
    this.update.x = x;
    this.update.y = y;
    this.update.elt = this.elt;
    this.update.cell = this;
};

game.Cell.getFrom = function (evt) {
    var x = parseInt(evt.target.getAttribute('data-x'), 10),
        y = parseInt(evt.target.getAttribute('data-y'), 10);
    return new game.Cell(x, y);
};

game.coords = {
    isInside: function (x, y) {
        return (0 <= x && x < game.dimensions.width && 0 <= y && y < game.dimensions.height);
    },
    getNeighbours: function (x,y) {
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
            if (game.coords.isInside(x1, y1)) {
                ret.push(arr[i]);
            }
        }
        return ret;
    }
};

game.cells = {
    get: {
        neighbours: function (cell) {
            var ret = [],
                neighbours = game.coords.getNeighbours(cell.x, cell.y),
                i,
                x,
                y,
                retrieved_cell;
            for (i = 0; i < neighbours.length; i += 1) {
                x = neighbours[i][0];
                y = neighbours[i][1];
                retrieved_cell = new game.Cell(x, y);
                ret.push(retrieved_cell);
            }
            return ret;
        },
        notOpened: function () {
            var ret = [],
                x,
                y;
            for (x = 0; x < game.dimensions.width; x += 1) {
                for (y = 0; y < game.dimensions.height; y += 1) {
                    if (!game.maps.openedCells[x][y]) {
                        ret.push(new game.Cell(x, y));
                    }
                }
            }
            return ret;
        },
        remainingMines: function (cell) {
            var ret = [],
                x,
                y,
                new_cell;
            for (x = 0; x < game.dimensions.width; x += 1) {
                for (y = 0; y < game.dimensions.height; y += 1) {
                    // ignore the opened mine
                    if (!(cell.x === x && cell.y === y)) {
                        new_cell = new game.Cell(x, y);
                        if (new_cell.query.isMineCell()) {
                            ret.push(new_cell);
                        }
                    }
                }
            }
            return ret;
        }
    },
    update: {
        removeListeners: function () {
            var cells = game.cells.get.notOpened(),
                i;
            for (i = 0; i < cells.length; i += 1) {
                cells[i].update.removeListeners();
            }
        },
        showMines: function (cell) {
            var cells = game.cells.get.remainingMines(cell),
                i,
                var_cell;
            for (i = 0; i < cells.length; i += 1) {
                var_cell = cells[i];
                if (var_cell.query.isMarked()) {
                    var_cell.update.setStyle('mine correct');
                    game.maps.markedCells[var_cell.x][var_cell.y] = false;
                } else {
                    var_cell.elt.innerHTML = String.fromCharCode(164);
                    var_cell.update.setStyle('mine revealed');
                }
            }
        },
        showIncorrectMines: function () {
            var x, y, cell;
            for (x = 0; x < game.dimensions.width; x += 1) {
                for (y = 0; y < game.dimensions.height; y += 1) {
                    if (game.maps.markedCells[x][y]) {
                        cell = new game.Cell(x, y);
                        cell.update.setStyle('mine incorrect');
                    }
                }
            }
        }
    },
};

game.setupDOM = {
    buildBoard: function () {
        game.setupDOM.board = document.getElementById('minesweeper');
        (function clear() {
            game.status.clearDisplays();
            while (game.setupDOM.board.firstChild) {
                game.setupDOM.board.removeChild(game.setupDOM.board.firstChild);
            }
        } ());
        (function disableContextMenu() { // SO: enables right click features
            game.setupDOM.board.oncontextmenu = function (evt) {
                (function stopEvent() {
                    if (evt.preventDefault !== undefined)
                        { evt.preventDefault(); }
                    if (evt.stopPropagation !== undefined)
                        { evt.stopPropagation(); }
                }());
            };
        }());
        var j;
        for (j = 0; j < game.dimensions.height; j += 1) {
            game.setupDOM.board.appendChild(game.setupDOM.createRow(j));
        }
    },
    createRow: function (j) {
        var row = document.createElement('div'), i;
        row.setAttribute('class', 'row');
        row.setAttribute('data-y', j);
        for (i = 0; i < game.dimensions.width; i += 1) {
            game.setupDOM.addCellToRow(row, i);
        }
        return row;
    },
    addCellToRow: function (row, i) {
        var elt = document.createElement('span');
        row.appendChild(elt);
        elt.setAttribute('class', 'row__cell');
        elt.setAttribute('data-x', i);
        elt.setAttribute('data-y', elt.parentNode.getAttribute('data-y'));
        game.handlers.addEventListeners(elt);
    },
    buildStartButtons: function () {
        var div = document.getElementById('start-buttons'),
            params;
        //For example, in unit tests
        if (!div) {
          return;
        }
        params = {width: 15, height: 15, mineFrequency: 0.083};
        div.appendChild(game.setupDOM.startButton('Easy', 'easy', params));
        params = {width: 30, height: 20, mineFrequency: 0.134};
        div.appendChild(game.setupDOM.startButton('Intermediate', 'intermediate', params));
        params = {width: 54, height: 30, mineFrequency: 0.15};
        div.appendChild(game.setupDOM.startButton('Hard', 'hard', params));
    },
    startButton: function (text, className, params) {
        var button = document.createElement('button');
        button.innerHTML = text;
        button.className = className;
        button.addEventListener('click', function () {
            game.new(params);
        });
        return button;
    }
};

game.new = function (params) {
    game(params.width, params.height, params.mineFrequency);
    game.setupDOM.buildBoard();
};

game.setupDOM.buildStartButtons();
