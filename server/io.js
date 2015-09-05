var g = require('./game/game.js');


module.exports = function (http) {

    var io = require('socket.io')(http);

    var game = g.newGame();
    var players = [];

    function ranname() {

        var names = [
            "가마우지", "갈매기", "개개비", "거위", "고니", "곤줄박이", "기러기", "까마귀", "까치", "꼬리치레", "꾀꼬리", "꿩", "나무발발이", "논병아리", "느시", "닭", "독수리", "동고비", "두견", "두루미", "따오기", "딱따구리",
            "뜸부기", "마도요", "말똥가리", "매", "메추라기", "밀화부리", "발구지", "병아리", "부엉이", "비둘기", "뻐꾸기", "새홀리기", "솔개", "아비", "양진이", "어치", "오리", "오목눈이", "올빼미", "왜가리", "원앙", "제비", "조롱이", "종다리", "지빠귀", "직박구리", "찌르레기", "할미새사촌", "해오라기", "앵그리 버드"
        ];
        return names[parseInt(Math.random() * names.length)];
    }

    io.on('connection', function (socket) {

        socket.player = {score: 0, name: ranname()};
        players.push(socket.player);

        function send() {
            var send = {};
            send.blocks = game.blocks;
            send.discovered = game.discovered;
            updatePlayers();
            socket.emit('game', send);
        }

        function sendToAll() {
            var send = {};
            send.blocks = game.blocks;
            send.discovered = game.discovered;
            io.sockets.emit('game', send);
        }

        send();

        socket.on('check', function (selects) {
            var done = game.check(selects);
            socket.emit('check', done);
            if (!done) {
                updatePlayers(-1);
                return;
            }
            io.sockets.emit("alert", socket.player.name + "님 합 성공! +1점");
            updatePlayers(+1);
            sendToAll();
        });


        socket.on('done', function () {
            var done = game.done();
            socket.emit('done', done);
            if (!done) {
                updatePlayers(-2);
                return;
            }
            io.sockets.emit("alert", socket.player.name + "님 결 성공! +3점");
            game = g.newGame();
            updatePlayers(3);
            sendToAll();
        });

        function updatePlayers(val) {
            if (val)
                socket.player.score = socket.player.score + val;
            if (socket.player.score < 0)
                socket.player.score = 0;
            io.sockets.emit('players', players);
        }

        socket.on('player', function (name) {
            socket.player.name = name;
            updatePlayers();
        });

        socket.on('disconnect', function () {
            players.remove(socket.player);
            updatePlayers();
        });

    });

};