var Player = require('./player.js');

function Game(store, db, id) {
    var self = this;
    this.point = 0;
    this.players = [];
    this.turn = 0;
    this.e = [];
    this.store = store;
    this.db = db;
    this.id = id;
}

Game.prototype.restart = function () {
    this.turn = 0;
    this.ing = false;
    this.startCheck();
};

Game.prototype.join = function (socket) {
    this.players.push(new Player(socket, this));
    this.sync();
};

Game.prototype.reEnter = function (socket) {
    var player = this.getPlayer(socket.sid);
    if (player) {
        player.setSocket(socket);
        this.sync();
        return;
    }
    this.join(socket);
    this.sync();
};

Game.prototype.removePlayer = function (socket) {
    var self = this;
    this.players.forEach(function (player) {
        if (player.socket != socket)
            return;
        if (self.ing && player.in) {
            player.disconnect = true;
            return;
        }
        self.players.remove(player);
    });
};


Game.prototype.turnEndCheck = function () {
    var end = true;
    this.inPlayers.forEach(function (player) {
        if (player.submitted)
            return;
        end = false;
    });
    if (!end)
        return;
    this.calculate();
};


Game.prototype.eCardCheck = function () {
    var end = true;
    this.e.forEach(function (player) {
        if (player.eCard)
            return;
        end = false;
    });
    if (!end)
        return;
    this.e.forEach(function (player) {
        player.submitted = player.eCard;
    });
    this.calculate();
};

Game.prototype.calculateWinner = function () {
    var x;
    var e;
    var self = this;
    this.draw = false;
    this.inPlayers.forEach(function (player) {
        if (player.submitted === 'x') {
            x = true;
            return;
        }
        if (player.submitted === 'e') {
            e = true;
            self.e.push(player);
            return;
        }
        if (!self.winner) {
            self.winner = player;
            return;
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
    this.sync();
    return {x: x, e: e};
};

Game.prototype.zerosWin = function () {
    var zeros = [];
    var name = "";
    this.inPlayers.forEach(function (player) {
        if (player.submitted !== 0)
            return;
        zeros.push(player);
        name += player.name + ", ";
    });
    var length = zeros.length;
    if (length == 0)
        return;

    var point = parseInt(this.point / length);
    this.alert("플레이어 (" + name.substr(0, name.length - 2), ")가 0카드로 승리하여 " + point + "P를 얻습니다.");
    this.point = this.point % length;
    this.sync();
};


Game.prototype.calculate = function () {
    var result = this.calculateWinner();
    this.turnEnd();
    if (result.e) {
        this.waitForECards();
        return;
    }
    if (result.x) {
        this.turnStart();
        return;
    }
    if (this.draw) {
        this.zerosWin();
        this.turnStart();
        return;
    }
    this.winner.win();
    this.turnStart();
};


Game.prototype.turnEnd = function () {
    this.turnEnded = true;
};

Game.prototype.waitForECards = function () {
    this.e.forEach(function (player) {
        player.eCard = undefined;
        player.alert("카드를 제출해주세요.");
    });
};

Game.prototype.getPlayerSize = function () {
    return this.players.length;
};

Game.prototype.getPlayers = function () {
    var result = [];
    this.players.forEach(function (p) {
        result.push(p.socket.player);
    });
    return result;
};

Game.prototype.startCheck = function () {
    var inPlayers = 0;
    this.players.forEach(function (player) {
        if (player.in)
            inPlayers++;
    });

    if (inPlayers > 1) {
        this.alert("5초후에 게임을 시작합니다.");
        this.timer = setTimeout(this.start.bind(this), 100);
        return;
    }
    if (!this.timer)
        return;
    clearTimeout(this.timer);
    this.timer = false;
    this.alert("플레이어가 부족해 게임이 취소되었습니다.");

};

Game.prototype.alert = function (message, fail, duration) {
    this.players.forEach(function (player) {
        player.alert(message, fail, duration);
    });
};

Game.prototype.start = function () {
    this.ing = true;
    this.inPlayers = [];
    var self = this;
    self.players.forEach(function (player) {
        if (!player.in)
            return;
        self.inPlayers.push(player);
        player.start();
    });
    this.alert("게임을 시작합니다");
    this.turnStart();
};


Game.prototype.turnStart = function () {
    this.e = [];
    if (this.turn > 8) {
        this.restart();
        return;
    }
    this.turnEnded = false;
    this.turn++;
    var self = this;
    this.players.forEach(function (p) {
        if (p.in) {
            p.alert('[제 ' + (self.turn) + "라운드] 카드를 선택해주세요.");
            return;
        }
        p.alert('[제 ' + (self.turn) + "라운드]");
    });
    this.inPlayers.forEach(function (player) {
        player.submitted = undefined;
        player.eCard = undefined;
        player.submitPoint();
    });
    this.sync();
};

Game.prototype.sync = function () {
    var state = {};
    state.players = [];
    this.players.forEach(function (player) {
        state.players.push(player.getInfo());
    });
    var game = {};
    game.ing = this.ing;
    game.id = this.id;
    game.turn = this.turn;
    game.point = this.point;
    this.players.forEach(function (player) {
        if (player.disconnect)
            return;
        game.submitted = player.submitted;
        game.eCard = player.eCard;
        state.game = game;
        player.socket.emit('sevengame.sync', state);
    });
};

Game.prototype.getPlayer = function (sid) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].sid == sid)
            return this.players[i];
    }
};
Game.prototype.getInPlayer = function (sid) {
    for (var j = 0; j < this.inPlayers.length; j++) {
        if (this.inPlayers[j].sid == sid)
            return this.inPlayers[j];
    }
};

Game.prototype.isPlayingPlayer = function (sid) {
    if (!this.ing)
        return false;
    return this.getInPlayer(sid);
};

Game.prototype.isPlayingPlayerExist = function (sid) {
    if (!this.ing)
        return false;
    for (var i = 0; i < this.inPlayers.length; i++) {
        var player = this.inPlayers[i];
        if (!player.disconnect && player.sid != sid)
            return true;
    }
    return false;
};


Game.prototype.isEmpty = function () {
    if (!this.ing)
        return this.players.length == 0;
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if (!player.in)
            return false;
        if (player.in && !player.disconnect)
            return false;
    }
    return true;
};

Game.prototype.leave = function (sid) {
    var player = this.getPlayer(sid);
    if (!player)
        return;
    if (!this.ing) {
        this.players.remove(player);
        this.sync();
        return;
    }
    if (!player.in) {
        this.players.remove(player);
        this.sync();
        return;
    }
    player.disconnect = true;
};

module.exports = Game;