Array.prototype.contains = function (item) {
    return this.indexOf(item) != -1;
};

Array.prototype.remove = function (val) {
    this.splice(this.indexOf(val), 1);
};

var game = {};
game.Block = function (color, shape, back) {
    this.color = color;
    this.shape = shape;
    this.back = back;
};
game.Block.random = function () {
    return new game.Block(ranInt(3), ranInt(3), ranInt(3));
    function ranInt(val) {
        return parseInt(Math.random() * val);
    }
};

game.Game = function () {
    this.results = [];
    this.blocks = [];
    this.discovered = [];
};

game.Game.prototype.done = function () {
    if (this.results.length == 0)
        return true;
    return false;
};

game.Game.prototype.check = function (selects) {
    if (selects == undefined) return false;
    if (selects.length != 3) return false;
    selects.sort();
    var result = selects.join("");
    if (this.results.contains(result)) {
        this.results.remove(result);
        this.discovered.push(result);
        return true;
    }
    return false;
};

game.Game.prototype.getAllResults = function () {
    if (this.blocks.length < 3)
        return;
    for (var i = 0; i < this.blocks.length - 2; i++) {
        for (var j = i + 1; j < this.blocks.length - 1; j++) {
            for (var k = j + 1; k < this.blocks.length; k++) {
                if (check(this.blocks[i], this.blocks[j], this.blocks[k]))
                    this.results.push(i + "" + j + "" + k);
            }
        }
    }

    function check(block1, block2, block3) {
        return allSameOrDiff(block1.shape, block2.shape, block3.shape) &&
            allSameOrDiff(block1.color, block2.color, block3.color) &&
            allSameOrDiff(block1.back, block2.back, block3.back);
        function allSameOrDiff(val1, val2, val3) {
            if (val1 == val2) {
                if (val2 == val3)
                    return true;
                return false;
            }
            if (val2 == val3)
                return false;
            if (val3 == val1)
                return false;
            return true;
        }
    }

}

game.newGame = function () {
    var size = 9;
    var result = new game.Game();
    for (var i = 0; i < size; i++) {
        result.blocks.push(game.Block.random());
    }
    result.getAllResults();
    return result;
};


module.exports = game;