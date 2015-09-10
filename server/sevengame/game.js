function Game(io, point) {
    var self = this;
    if (!point)
        point = 0;
    this.point = point;
    this.players = [];
    this.submitted = 0;
    this.turn = 0;
    this.e = [];
}

Game.prototype.addPlayer = function (socket) {
    this.players.push(new Player(socket, this));
};

Game.prototype.removePlayer = function (socket) {
    var self = this;
    this.players.forEach(function (player) {
        if (player.socket == socket)
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
        if (player.in)
            self.inPlayers.push(player);
    });
    this.alert("게임을 시작합니다");
    this.turnStart();
};

Game.prototype.turnStart = function () {
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
    game.turn = this.turn;
    game.point = this.point;
    this.players.forEach(function (player) {
        game.submitted = player.submitted;
        game.eCard = player.eCard;
        state.game = game;
        player.socket.emit('sevengame.sync', state);
    });
};


Player = function (socket, game) {
    this.socket = socket;
    this.cards = [1, 2, 3, 4, 5, 6, 7, 'e', 'x'];
    var self = this;
    this.game = game;
    socket.on('sevengame.in', function (val) {
        self.setIn(val);
    });
    socket.on('submit', function (i) {
        self.submit(i);
    });
};

Player.prototype.submitPoint = function () {
    this.socket.player.score--;
    if (this.socket.player.score < 0)
        this.socket.player.score = 0;
    this.game.point++;
};

Player.prototype.getInfo = function (submitted) {
    var player = {};
    player.name = this.socket.player.name;
    player.score = this.socket.player.score;
    player.sid = this.socket.player.sid;
    player.cards = this.cards;
    player.in = this.in;
    if (this.game.turnEnded)
        player.submitted = this.submitted;
    return player;
};


Player.prototype.alert = function (message, fail, duration) {
    this.socket.emit('sevengame.alert', new Message(message, fail, duration));
};

Player.prototype.setIn = function (val) {
    if (this.game.ing)
        return;
    this.in = val;
    this.game.startCheck();
};

Player.prototype.submit = function (index) {
    if (this.submitted) {
        this.changeSubmitted(index);
        return;
    }
    this.submitted = this.cards.splice(index, 1)[0];
    this.game.turnEndCheck();
    this.game.sync();
};


Player.prototype.changeSubmitted = function (index) {
    if (!this.game.turnEnded) {
        var tmp = this.submitted;
        this.submitted = this.cards[index];
        this.cards[index] = tmp;
        this.game.sync();
        return;
    }
    if (this.submitted == 'e') {
        if (this.eCard)
            return;
        this.eCard = this.cards.splice(index, 1)[0];
        this.game.eCardCheck();
        return;
    }
    this.alert("턴이 끝났습니다.");
};

Player.prototype.win = function () {
    this.game.alert(this.socket.player.name + "님이 " + this.submitted + "으로 승리하셨습니다.");
    this.socket.player.score += this.game.point;
    this.game.point = 0;
    this.game.sync();
};


function Message(message, fail, duration) {
    this.message = message;
    this.fail = fail;
    this.duration = duration;
}

module.exports = Game;