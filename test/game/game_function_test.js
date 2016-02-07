describe('game()', function() {
    before(function() {
        game(2,7,1);
    });
    it('should initialize constants', function() {
        chai.expect(game.dimensions.width).to.equal(2);
        chai.expect(game.dimensions.height).to.equal(7);
        chai.expect(game.mineFrequency).to.equal(1);
    });
    it('should initialize openedCells map', function() {
        chai.expect(game.maps.openedCells.length).to.equal(2);
        chai.expect(game.maps.openedCells[0].length).to.equal(7);
    });
    it('should initialize markedCells map', function() {
        chai.expect(game.maps.markedCells.length).to.equal(2);
        chai.expect(game.maps.markedCells[0].length).to.equal(7);
    });
});
