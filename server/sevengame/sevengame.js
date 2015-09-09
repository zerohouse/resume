function Game(players, startPoint) {
    var self = this;
    this.point = startPoint;
    this.players = players;
    this.submitted = 0;
    this.turn = 0;
    this.e = [];

    players.forEach(function (player) {
        player.setGame(self);
    });
}


Game.prototype.calculateWinner = function () {
    var self = this;
    var x;
    var e;
    this.players.forEach(function (player) {
        if (!self.winner) {
            self.winner = player;
            return;
        }
        if (player.submitted == 'x') {
            x = true;
        }
        if (player.submitted == 'e') {
            e = true;
            self.e.push(player);
        }
        if (self.winner.submitted > player.submitted)
            return;
        if (self.winner.submitted == player.submitted) {
            self.draw = true;
            return;
        }
        self.winner = player;
        self.draw = false;
    });
    return {e: e, x: x};
};

Game.prototype.turnEndCheck = function () {
    var end = true;
    this.players.forEach(function (player) {
        if (player.submitted)
            return;
        end = false;
    });
    if (!end)
        return;
    this.calculate();
};

Game.prototype.calculate = function () {
    var result = this.calculateWinner();
    if (result.x) {
        this.turnEnd();
        return;
    }
    if (result.e) {
        this.waitForECards();
        return;
    }
    if (this.draw) {
        this.turnEnd();
    }
    this.winner.win(this.point);
    this.turnEnd();

};

Game.prototype.turnEnd = function () {

};

Game.prototype.waitForECards = function () {

};


Game.Player = function (point, game) {
    this.point = point;
    this.cards = [1, 2, 3, 4, 5, 6, 7, 'E', 'X'];
};

Game.Player.prototype.setGame = function (game) {
    this.game = game;
};

Game.Player.prototype.submit = function (index) {
    if (this.submitted) {
        this.changeSubmitted(index);
        return;
    }
    this.submitted = this.cards.splice(index, 1)[0];
    this.game.turnEndCheck();
};

Game.Player.prototype.changeSubmitted = function (index) {

};

Game.Player.prototype.win = function (point) {

};


module.exports = Game;