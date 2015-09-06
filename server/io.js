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
        function userUpdate() {
            if (socket.session.user == undefined)
                return;
            store.set(socket.sid, socket.session);
            db.User.update({email: socket.player.email}, socket.player, function (er, res) {
            });
        }

        socket.on('getRooms', function () {
            var send = {};
            send.rooms = [];
            send.highest = highest;
            send.best = best;
            Object.keys(game).forEach(function (roomId) {
                if (players[roomId].length == 0) {
                    gameEnd(roomId);
                    return;
                }
                send.rooms.push({roomId: roomId, players: players[roomId].length, name: game[roomId].name});
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
                var names = ["2009로스트 메모리즈", "4발가락", "YMCA야구단", "2424", "H", "공공의적", "결혼은 미친짓이다", "긴급조치 19호", "가문의 영광", "굳세어라 금순아", "광복절 특사", "나쁜남자", "낙타들", "남자 태어나다", "뚫어야 산다", "둘 하나 섹스", "도둑맞곤 못살아", "동접", "라이터를 켜라", "로드 무비", "라이브 라인", "마리이야기", "몽중인", "미워도 다시한번", "묻지마 패밀리", "마고", "미션 바라바", "마법의 성", "몽정기", "밀애", "버스", "복수는 나의 것", "보스 상륙 작전", "싸울아비", "새는 폐곡선을 그리다", "스물넷", "생활의 발견", "서프라이즈", "쓰리", "성냥팔이소녀의 재림", "사자성어", "색즉시공", "아프리카", "이소룡을 찾아랏", "이것은 서태지가 아니다", "아이언 팜", "울랄라 씨스터즈", "일단 뛰어", "오버 더 레인보우", "예스터데이", "아유레디", "오아시스", "우렁각시", "연애소설", "유아독존", "정글쥬스", "집으로", "재밌는영화", "좋은사람있으면 소개시켜줘", "중독", "죽어도 좋아", "취화선", "챔피언", "철없는 아내와 파란만장한 남편", "턴 잇 업", "피도 눈물도 없이", "폰", "패밀리", "피아노 치는 대통령", "품행제로", "해피데이"];
                if (game[vid] != undefined)
                    return;
                game[vid] = g.newGame();
                game[vid].name = names[parseInt(Math.random() * names.length)];
                players[vid] = [];
            }
        });

        function send() {
            var send = {};
            send.blocks = game[socket.roomId].blocks;
            send.name = game[socket.roomId].name;
            send.discovered = game[socket.roomId].discovered;
            send.id = socket.id;
            send.reset = true;
            send.players = players[socket.roomId];
            updatePlayers();
            socket.emit('game', send);
        }

        function sendToAll(reset) {
            var send = {};
            send.blocks = game[socket.roomId].blocks;
            send.discovered = game[socket.roomId].discovered;
            send.players = players[socket.roomId];
            send.reset = reset;
            updatePlayers();
            io.to(socket.roomId).emit('game', send);
        }

        socket.on('get', function () {
            send();
        });

        socket.on('check', function (selects) {
            if (new Date() - socket.last < 1500) {
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
            socket.emit('done', done);
            if (!done) {
                updatePlayers(-2);
                return;
            }
            game[socket.roomId] = g.newGame();
            updatePlayers(3);
            sendToAll(true);
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
                    if (socket.player.email == player.email)
                        return;
                    sum += player.score;
                });
                socket.player.score = socket.player.score + val + Math.min(10, parseInt(sum * 0.2) / 10);
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
                for (var i = 0; i < highest.length; i++) {
                    if (highest[i].id == p.id)
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

    });
    function Message(message, fail) {
        this.message = message;
        this.fail = fail;
    }
};