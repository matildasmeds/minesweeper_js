describe('game.init.mineMap()', function() {
    before(function() {
        game(2,3,1);
        var cellClicked = new game.Cell(0,0);
        game.init.mineMap(cellClicked);
    });
    it('should create new minemap', function() {
        chai.expect(game.maps.mines.length).to.equal(2);
        chai.expect(game.maps.mines[0].length).to.equal(3);
    });
    it('should update mineCount', {
        chai.expect(game.status.mineCount).to.equal(5);
    });
    it('should update unopenedSafeCellsCount', {
        chai.expect(game.status.unopenedSafeCellsCount).to.equal(1);
    });
});
