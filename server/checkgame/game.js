require('./../utils/util.js')();
var block = require('./block.js');
var namer = require('./../utils/namer.js');

var Game = function () {
    this.blocks = block.random();
    this.results = [];
    this.discovered = [];
    this.getAllResults();
    this.name = namer.movie();
};

Game.prototype.done = function () {
    return this.results.length == 0;
};

Game.prototype.check = function (selects) {
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

Game.prototype.getAllResults = function () {
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
                return val2 == val3;
            }
            if (val2 == val3)
                return false;
            return val3 != val1;
        }
    }
};

module.exports = Game;