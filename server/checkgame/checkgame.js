var Game = require('./game.js');
var game = {};
var players = {};
var best = {score: 0};
var highest = [];
var random = require('./../utils/random.js');


module.exports = function (io, socket, store, db, Message) {
    function userUpdate(socket) {
        if (!socket.session.user)
            return;
        store.set(socket.sid, socket.session);
        if (!socket.session.user.email)
            return;
        db.User.update({email: socket.player.email}, socket.player, function (er, res) {
        });
    }

    db.Record.findOne({type: 'best'}, function (err, result) {
        if (!err && result != undefined)
            best = result.record;
    });

    db.Record.findOne({type: 'highest'}, function (err, result) {
        if (!err && result != undefined)
            highest = result.record;
    });

    socket.on('checkgame.hide', function (hide) {
        if (!socket.roomId)
            return;
        if (!game[socket.roomId])
            return;
        if (players[socket.roomId][0].sid != socket.player.sid)
            return;
        game[socket.roomId].hide = hide;
    });

    socket.on('checkgame.getRooms', function () {
        var send = {};
        send.rooms = getRooms();
        send.highest = highest;
        send.best = best;
        socket.emit('checkgame.rooms', send);
    });

    socket.on('checkgame.move', function () {
        moveToOtherRoom();
    });

    function moveToOtherRoom() {
        var rooms = getRooms(socket.roomId);
        if (rooms == undefined || rooms.length == 0) {
            socket.emit('checkgame.move', random.key(10));
            return;
        }
        socket.emit('checkgame.move', getRooms(socket.roomId)[0].roomId);
    }

    function getRooms(val) {
        var rooms = [];
        Object.keys(game).forEach(function (roomId) {
            if (players[roomId].length == 0) {
                gameEnd(roomId);
                return;
            }
            if (val == roomId)
                return;
            if (game[roomId].hide)
                return;
            rooms.push({roomId: roomId, players: players[roomId].length, name: game[roomId].name});
        });
        return rooms;
    }

    socket.on('checkgame.join', function (id) {
        if (socket.roomId != undefined) {
            socket.leave(socket.roomId);
            if (players[socket.roomId] != undefined)
                players[socket.roomId].remove(socket.player);
            updatePlayers();
        }
        gameStart(id);
        socket.roomId = id;
        if (players[id].length > 10) {
            socket.emit('alert', new Message('방에 사람이 너무 많네요. 딴방갑니다.'));
            moveToOtherRoom();
            return;
        }
        socket.join(id);
        players[socket.roomId].push(socket.player);

        send();
        updatePlayers();

        function send() {
            var send = sendPack();
            send.reset = true;
            socket.emit('checkgame.game', send);
        }

        function gameStart(vid) {
            if (game[vid] != undefined) {
                return;
            }
            game[vid] = new Game();
            players[vid] = [];
        }
    });

    function sendPack() {
        var send = {};
        send.blocks = game[socket.roomId].blocks;
        send.name = game[socket.roomId].name;
        send.discovered = game[socket.roomId].discovered;
        send.players = players[socket.roomId];
        return send;
    }


    function sendToAll(reset) {
        var send = sendPack();
        send.reset = reset;
        io.to(socket.roomId).emit('checkgame.game', send);
    }

    socket.on('checkgame.check', function (selects) {
        if (new Date() - socket.last < 1500) {
            return;
        }
        socket.last = new Date();
        if (game[socket.roomId] == undefined)
            return;
        var done = game[socket.roomId].check(selects);
        if (!done) {
            updatePlayers(-1);
            userUpdate(socket);
            return;
        }
        socket.last = new Date() + 1500;
        updatePlayers(1);
        userUpdate(socket);
        sendToAll();
    });


    socket.on('checkgame.done', function () {
        if (new Date() - socket.last < 1500) {
            return;
        }
        socket.last = new Date();
        var done = game[socket.roomId].done();
        if (!done) {
            updatePlayers(-2);
            userUpdate(socket);
            return;
        }
        game[socket.roomId] = g.newGame();
        updatePlayers(3);
        userUpdate(socket);
        sendToAll(true);
    });

    function updatePlayers(val) {
        if (socket.player.booster)
            val = socket.player.booster * val;
        if (!val) {
            io.to(socket.roomId).emit('checkgame.players', players[socket.roomId]);
            return;
        }
        var type = "결";
        if (Math.abs(val) == 1)
            type = "합";
        if (val > 0) {
            var sum = 0;
            players[socket.roomId].forEach(function (player) {
                if (socket.player == player)
                    return;
                sum += player.score;
            });
            var bonus = Math.round(Math.log(sum));
            if (bonus < 1)
                bonus = 1;
            val = val * bonus;
            socket.player.score = socket.player.score + val;
            io.to(socket.roomId).emit("alert", new Message(socket.player.name + "님 " + type + " 성공! +" + val + "점"));
            io.to(socket.roomId).emit('checkgame.players', players[socket.roomId]);
            updateHighest(socket.player);
        }
        else {
            io.to(socket.roomId).emit("alert", new Message(socket.player.name + "님 " + type + " 실패! " + val + "점", true));
            socket.player.score = socket.player.score + val;
            if (socket.player.score < 0)
                socket.player.score = 0;
            io.to(socket.roomId).emit('checkgame.players', players[socket.roomId]);
        }
    }

    function updateHighest(p) {
        if (best.score < p.score) {
            best.score = p.score;
            best.name = p.name;
            io.sockets.emit('alert', new Message(game[socket.roomId].name + "방의 " + p.name + "님 " + p.score + "점으로 최고 기록을 경신하셨습니다."));
            db.Record.update({type: 'best'}, {record: best}, {upsert: true}, function (e, r) {
            });
        }

        if (p.email == undefined)
            return;
        for (var i = 0; i < highest.length; i++) {
            if (highest[i].email == p.email) {
                highest[i] = p;
                db.Record.update({type: 'highest'}, {record: highest}, {upsert: true}, function (e, r) {
                });
                return;
            }
        }
        for (var j = 0; j < 10; j++) {
            if (highest[j] == undefined) {
                highest[j] = p;
                db.Record.update({type: 'highest'}, {record: highest}, {upsert: true}, function (e, r) {
                });
                io.sockets.emit('alert', new Message(game[socket.roomId].name + "방의 " + p.name + "님 " + p.score + "점으로 통합 10위에 진입하셨습니다."));
                return;
            }
            if (highest[j].score < p.score) {
                highest[j] = p;
                db.Record.update({type: 'highest'}, {record: highest}, {upsert: true}, function (e, r) {
                });
                io.sockets.emit('alert', new Message(game[socket.roomId].name + "방의 " + p.name + "님 " + p.score + "점으로 통합 10위에 진입하셨습니다."));
                return;
            }
        }

    }


    socket.on('checkgame.chat', function (message) {
        if (new Date() - socket.last < 1500) {
            return;
        }
        socket.last = new Date();
        io.to(socket.roomId).emit('checkgame.chat', {message: message, from: socket.player.name});
    });


    socket.on('leave', function () {
        socket.leave(socket.roomId);
        leaveGame();
    });


    function leaveGame() {
        if (players[socket.roomId] == undefined)
            return;
        players[socket.roomId].remove(socket.player);
        if (players[socket.roomId].length == 0)
            gameEnd(socket.roomId);
        socket.roomId = undefined;
        updatePlayers();

    }

    socket.on('disconnect', function () {
        leaveGame();
    });

    function gameEnd(vid) {
        if (game[vid] == undefined)
            return;
        game[vid] = undefined;
        delete game[vid];
        players[vid] = undefined;
        delete players[vid];
    }

    socket.on('checkgame.steampack', function (i) {
        var steam = [{point: 15, booster: 2, timeout: 30000, name: "헉헉"}, {
            point: 30,
            booster: 4,
            timeout: 30000,
            name: "하악하악"
        }, {
            point: 150,
            booster: 10,
            timeout: 60000, name: "부와아악"
        }];
        if (socket.player.booster)
            return;
        if (socket.player.score < steam[i].point)
            return;
        io.to(socket.roomId).emit('alert', new Message(socket.player.name + "님이 " + steam[i].name + "을 사용했습니다.", true));
        socket.emit('checkgame.steamstart', i);
        socket.player.score = socket.player.score - steam[i].point;
        socket.player.booster = steam[i].booster;
        updatePlayers();
        userUpdate(socket);
        setTimeout(function () {
            socket.player.booster = undefined;
            socket.emit('checkgame.steamend', i);
            userUpdate(socket);
            updatePlayers();
        }, steam[i].timeout);
    });


};