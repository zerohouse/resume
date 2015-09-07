var g = require('./game/game.js');
module.exports = function (http, store, db) {
    var io = require('socket.io')(http);
    io.use(require('./io.session.js')(store));

    var game = {};
    var players = {};
    var best = {score: 0};
    var highest = [];
    db.Record.findOne({type: 'best'}, function (err, result) {
        if (!err && result != undefined)
            best = result.record;
    });
    db.Record.findOne({type: 'highest'}, function (err, result) {
        if (!err && result != undefined)
            highest = result.record;
    });


    function ranname() {
        var names = [
            "가마우지", "갈매기", "개개비", "거위", "고니", "곤줄박이", "기러기", "까마귀", "까치", "꼬리치레", "꾀꼬리", "꿩", "나무발발이", "논병아리", "느시", "닭", "독수리", "동고비", "두견", "두루미", "따오기", "딱따구리",
            "뜸부기", "마도요", "말똥가리", "매", "메추라기", "밀화부리", "발구지", "병아리", "부엉이", "비둘기", "뻐꾸기", "새홀리기", "솔개", "아비", "양진이", "어치", "오리", "오목눈이", "올빼미", "왜가리", "원앙", "제비", "조롱이", "종다리", "지빠귀", "직박구리", "찌르레기", "할미새사촌", "해오라기", "앵그리 버드"
        ];
        return names[parseInt(Math.random() * names.length)];
    }

    io.on('connection', function (socket) {

        socket.emit('yo');

        function userUpdate() {
            if (socket.session.user == undefined)
                return;
            store.set(socket.sid, socket.session);
            db.User.update({email: socket.player.email}, socket.player, function (er, res) {
            });
        }

        socket.on('getRooms', function () {
            var send = {};
            send.rooms = getRooms();
            send.highest = highest;
            send.best = best;
            socket.emit('rooms', send);
        });

        socket.on('move', function () {
            moveToOtherRoom();
        });

        function moveToOtherRoom() {
            var rooms = getRooms(socket.roomId);
            if (rooms == undefined || rooms.length == 0) {
                socket.emit('move', ranRoom(10));
                return;
            }
            socket.emit('move', getRooms(socket.roomId)[0].roomId);
            function ranRoom(length) {
                var ran = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLNMOPQRSTUVWXYZ0123456789";
                var result = "";
                for (var i = 0; i < length; i++)
                    result += ran[parseInt(Math.random() * ran.length)];
                return result;
            }
        }

        function getRooms(val) {
            var rooms = [];
            Object.keys(game).forEach(function (roomId) {
                if (players[roomId].length == 0) {
                    gameEnd(roomId);
                    return;
                }
                if (val != roomId)
                    rooms.push({roomId: roomId, players: players[roomId].length, name: game[roomId].name});
            });
            return rooms;
        }

        socket.on('join', function (id) {
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
                var send = {};
                send.blocks = game[socket.roomId].blocks;
                send.name = game[socket.roomId].name;
                send.discovered = game[socket.roomId].discovered;
                send.reset = true;
                send.players = players[socket.roomId];
                socket.emit('game', send);
            }

            function gameStart(vid) {
                if (game[vid] != undefined) {
                    return;
                }
                game[vid] = g.newGame();
                players[vid] = [];
            }
        });


        function sendToAll(reset) {
            var send = {};
            send.blocks = game[socket.roomId].blocks;
            send.name = game[socket.roomId].name;
            send.discovered = game[socket.roomId].discovered;
            send.players = players[socket.roomId];
            send.reset = reset;
            updatePlayers();
            io.to(socket.roomId).emit('game', send);
        }

        socket.on('check', function (selects) {
            if (new Date() - socket.last < 1500) {
                return;
            }
            socket.last = new Date();
            if (game[socket.roomId] == undefined)
                return;
            var done = game[socket.roomId].check(selects);
            if (!done) {
                updatePlayers(-1);
                return;
            }
            socket.last = new Date() + 1500;
            updatePlayers(1);
            sendToAll();
        });


        socket.on('done', function () {
            if (new Date() - socket.last < 1500) {
                return;
            }
            socket.last = new Date();
            var done = game[socket.roomId].done();
            if (!done) {
                updatePlayers(-2);
                return;
            }
            game[socket.roomId] = g.newGame();
            updatePlayers(3);
            sendToAll(true);
        });

        function updatePlayers(val) {
            val = socket.player.booster * val;
            if (!val) {
                io.to(socket.roomId).emit('players', players[socket.roomId]);
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
                var bonus = Math.min(3, Math.ceil(sum * 0.01));
                if (bonus == 0)
                    bonus = 1;
                socket.player.score = socket.player.score + val * bonus;
                io.to(socket.roomId).emit("alert", new Message(socket.player.name + "님 " + type + " 성공! +" + val + "점"));
                io.to(socket.roomId).emit('players', players[socket.roomId]);
                updateHighest(socket.player);
                userUpdate();
            }
            else {
                io.to(socket.roomId).emit("alert", new Message(socket.player.name + "님 " + type + " 실패! " + val + "점", true));
                socket.player.score = socket.player.score + val;
                if (socket.player.score < 0)
                    socket.player.score = 0;
                userUpdate();
                io.to(socket.roomId).emit('players', players[socket.roomId]);
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

            if (!changeIfHigh(p))
                return;
            io.sockets.emit('alert', new Message(game[socket.roomId].name + "방의 " + p.name + "님 " + p.score + "점으로 통합 10위에 진입하셨습니다."));
            db.Record.update({type: 'highest'}, {record: highest}, {upsert: true}, function (e, r) {
            });


            function changeIfHigh(p) {
                if (p.email == undefined)
                    return;
                for (var i = 0; i < highest.length; i++) {
                    if (highest[i].email == p.email)
                        return false;
                }
                for (var j = 0; j < 10; j++) {
                    if (highest[j] == undefined) {
                        highest[j] = p;
                        return true;
                    }
                    if (highest[j].score < p.score) {
                        highest[j] = p;
                        return true;
                    }
                }
                return false;
            }

        }


        socket.on('chat', function (message) {
            if (new Date() - socket.last < 1500) {
                return;
            }
            socket.last = new Date();
            io.to(socket.roomId).emit('chat', {message: message, from: socket.player.name});
        });

        socket.on('disconnect', function () {
            if (players[socket.roomId] == undefined)
                return;
            players[socket.roomId].remove(socket.player);
            updatePlayers();
            if (players[socket.roomId].length != 0)
                return;
            gameEnd(socket.roomId);
        });

        function gameEnd(vid) {
            if (game[vid] == undefined)
                return;
            game[vid] = undefined;
            delete game[vid];
            players[vid] = undefined;
            delete players[vid];
        }


        socket.on('update', function (user) {
            if (socket.session.user.email == undefined)
                return;
            if (socket.session.user.email != user.email)
                return;
            socket.session.user.name = user.name;
            store.set(socket.sid, socket.session);
            db.User.update({email: user.email}, user, {}, function (e, r) {
                socket.emit("alert", new Message('정보 변경되었습니다.'));
            });
        });

        socket.on('steampack', function (i) {
            var steam = [{point: 15, booster: 2, timeout: 30000}, {point: 30, booster: 4, timeout: 30000}, {
                point: 150,
                booster: 10,
                timeout: 60000
            }];
            if (socket.player.booster != 1)
                return;
            if (socket.player.score < steam[i].point)
                return;
            socket.emit('steamstart', i);
            socket.player.score = socket.player.score - steam[i].point;
            socket.player.booster = steam[i].booster;
            userUpdate();
            io.to(socket.roomId).emit('players', players[socket.roomId]);
            setTimeout(function () {
                socket.player.booster = 1;
                socket.emit('steamend', i);
            }, steam[i].timeout);
        });

    });
    function Message(message, fail) {
        this.message = message;
        this.fail = fail;
    }
};