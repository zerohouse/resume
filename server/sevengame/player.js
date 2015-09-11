Player = function (socket, game) {
    this.setSocket(socket);
    this.score = socket.player.score;
    this.name = socket.player.name;
    this.sid = socket.player.sid;
    socket.session.player = this;
    this.cards = [0, 1, 2, 3, 4, 5, 6, 7, 'e', 'x'];
    var self = this;
    this.game = game;
    this.save();
};

Player.prototype.start = function () {
    this.cards = [0, 1, 2, 3, 4, 5, 6, 7, 'e', 'x'];
};

Player.prototype.setSocket = function (socket) {
    this.disconnect = false;
    this.socket = socket;
    var self = this;
    socket.on('sevengame.in', function (val) {
        self.setIn(val);
    });
    socket.on('submit', function (i) {
        self.submit(i);
    });
};

Player.prototype.submitPoint = function () {
    this.score--;
    if (this.score < 0)
        this.score = 0;
    this.game.point++;
    this.save();
};

Player.prototype.getInfo = function (submitted) {
    var player = {};
    player.name = this.name;
    player.score = this.score;
    player.sid = this.sid;
    player.cards = this.cards;
    player.in = this.in;
    if (!this.game.turnEnded) {
        if (player.submitted)
            player.submitted = true;
    }
    else
        player.submitted = this.submitted;
    return player;
};


Player.prototype.alert = function (message, fail, duration) {
    if (this.disconnect)
        return;
    this.socket.emit('sevengame.alert', new Message(message, fail, duration));
};

Player.prototype.setIn = function (val) {
    if (this.game.ing)
        return;
    this.in = val;
    this.game.startCheck();
    this.game.sync();
    this.save();
};

Player.prototype.submit = function (index) {
    if (!this.game.ing)
        return;
    if (this.submitted) {
        this.changeSubmitted(index);
        return;
    }
    this.submitted = this.cards.splice(index, 1)[0];
    this.game.turnEndCheck();
    this.game.sync();
    this.save();
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
        if (!this.eCard) {
            this.eCard = this.cards.splice(index, 1)[0];
            this.game.eCardCheck();
            this.game.sync();
            return;
        }
        tmp = this.eCard;
        this.eCard = this.cards[index];
        this.cards[index] = tmp;
        this.game.eCardCheck();
        this.game.sync();
        return;
    }
    this.alert("턴이 끝났습니다.");
    this.save();
};

Player.prototype.win = function () {
    this.game.alert(this.name + "님이 " + this.submitted + "으로 승리하셨습니다.");
    if (this.submitted < 4) {
        this.game.alert("추가 칩을 가져갑니다.");
        this.game.inPlayers.forEach(function (player) {
            player.submitPoint();
        });
    }
    this.score += this.game.point;
    this.game.point = 0;
    this.game.sync();
    this.save();
};

Player.prototype.save = function () {
    this.game.store.set(this.sid, this.socket.session);
};


function Message(message, fail, duration) {
    this.message = message;
    this.fail = fail;
    this.duration = duration;
}

module.exports = Player;