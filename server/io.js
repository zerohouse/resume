var g = require('./game/game.js');


module.exports = function (http) {

    var io = require('socket.io')(http);

    var game = {};
    var players = {};
    var highest = {};

    function ranname() {
        var names = [
            "가마우지", "갈매기", "개개비", "거위", "고니", "곤줄박이", "기러기", "까마귀", "까치", "꼬리치레", "꾀꼬리", "꿩", "나무발발이", "논병아리", "느시", "닭", "독수리", "동고비", "두견", "두루미", "따오기", "딱따구리",
            "뜸부기", "마도요", "말똥가리", "매", "메추라기", "밀화부리", "발구지", "병아리", "부엉이", "비둘기", "뻐꾸기", "새홀리기", "솔개", "아비", "양진이", "어치", "오리", "오목눈이", "올빼미", "왜가리", "원앙", "제비", "조롱이", "종다리", "지빠귀", "직박구리", "찌르레기", "할미새사촌", "해오라기", "앵그리 버드"
        ];
        return names[parseInt(Math.random() * names.length)];
    }

    io.on('connection', function (socket) {
        socket.player = {score: 0, name: ranname(), id: socket.id};

        socket.on('getRooms', function () {
            var send = {};
            send.rooms = [];
            send.highest = highest;
            Object.keys(game).forEach(function (roomId) {
                if (players[roomId].length == 0) {
                    gameEnd(roomId);
                    return;
                }
                send.rooms.push({roomId: roomId, players: players[roomId].length});
            });
            socket.emit('rooms', send);
        });

        socket.on('join', function (id) {
            if (socket.roomId != undefined) {
                socket.leave(socket.roomId);
                if (players[socket.roomId] != undefined)
                    players[socket.roomId].remove(socket.player);
                updatePlayers();
            }
            gameStart(id);
            socket.join(id);
            socket.roomId = id;
            players[socket.roomId].push(socket.player);

            updatePlayers();

            function gameStart(vid) {
                if (game[vid] != undefined)
                    return;
                game[vid] = g.newGame();
                players[vid] = [];
                highest[vid] = {score: 0};
            }
        });

        function send() {
            var send = {};
            send.blocks = game[socket.roomId].blocks;
            send.discovered = game[socket.roomId].discovered;
            send.id = socket.id;
            send.players = players[socket.roomId];
            updatePlayers();
            socket.emit('game', send);
        }

        function sendToAll() {
            var send = {};
            send.blocks = game[socket.roomId].blocks;
            send.discovered = game[socket.roomId].discovered;
            send.players = players[socket.roomId];
            updatePlayers();
            io.to(socket.roomId).emit('game', send);
        }

        socket.on('get', function () {
            send();
            io.to(socket.roomId).emit('highest', highest[socket.roomId]);
        });

        socket.on('check', function (selects) {
            if (new Date() - socket.last < 500) {
                return;
            }
            socket.last = new Date();
            if (game[socket.roomId] == undefined)
                return;
            var done = game[socket.roomId].check(selects);
            socket.emit('check', done);
            if (!done) {
                updatePlayers(-1);
                return;
            }
            updatePlayers(1);
            sendToAll();
        });


        socket.on('done', function () {
            if (new Date() - socket.last < 500) {
                return;
            }
            socket.last = new Date();
            var done = game[socket.roomId].done();
            socket.emit('done', done);
            if (!done) {
                updatePlayers(-2);
                return;
            }
            game[socket.roomId] = g.newGame();
            updatePlayers(3);
            sendToAll();
        });

        function updatePlayers(val) {
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
                    if (socket.id == player.id)
                        return;
                    sum += player.score;
                });
                socket.player.score = socket.player.score + val + sum * 0.02;
                io.to(socket.roomId).emit("alert", new Message(socket.player.name + "님 " + type + " 성공! +" + val + "점"));
                io.to(socket.roomId).emit('players', players[socket.roomId]);
                if (highest[socket.roomId] != undefined && highest[socket.roomId].score > socket.player.score)
                    return;
                updateHighest(socket.player);
            }
            else {
                io.to(socket.roomId).emit("alert", new Message(socket.player.name + "님 " + type + " 실패! " + val + "점", true));
                socket.player.score = socket.player.score + val;
                if (socket.player.score < 0)
                    socket.player.score = 0;
                io.to(socket.roomId).emit('players', players[socket.roomId]);
            }

        }

        function updateHighest(player) {
            highest[socket.roomId] = player;
            io.to(socket.roomId).emit('highest', highest[socket.roomId]);
            io.to(socket.roomId).emit('players', players[socket.roomId]);
            io.to(socket.roomId).emit("alert", new Message(player.name + "님이 " + player.score + "점으로 최고기록을 경신했습니다."));
        }

        function Message(message, fail) {
            this.message = message;
            this.fail = fail;
        }


        socket.on('chat', function (message) {
            if (new Date() - socket.last < 500) {
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
            if (highest[vid].score == 0) {
                highest[vid] = undefined;
                delete players[vid];
            }
        }

    });

};