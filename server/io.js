var g = require('./game/game.js');


module.exports = function (http) {

    var io = require('socket.io')(http);

    var game = g.newGame();
    var players = [];
    var highest = {score: 0};
    var start = new Date();

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

        socket.on('get', function () {
            send();
            io.sockets.emit('highest', highest);
        });

        socket.on('check', function (selects) {
            var done = game.check(selects);
            socket.emit('check', done);
            if (!done) {
                updatePlayers(-1);
                return;
            }
            updatePlayers(1);
            sendToAll();
        });


        socket.on('done', function () {
            var done = game.done();
            socket.emit('done', done);
            if (!done) {
                updatePlayers(-2);
                return;
            }
            game = g.newGame();
            updatePlayers(3);
            sendToAll();
        });

        function updatePlayers(val) {
            if (!val) {
                io.sockets.emit('players', {me: players.indexOf(socket.player), players: players});
                return;
            }
            if (val > 0) {
                var type = "결";
                if (val == 1)
                    type = "합";
                val = calculateBonus(val);
                socket.player.score = socket.player.score + val;
                io.sockets.emit("alert", socket.player.name + "님 " + type + " 성공! +" + val + "점");
                io.sockets.emit('players', {me: players.indexOf(socket.player), players: players});
                if (highest.score > socket.player.score)
                    return;
                updateHighest(socket.player);
            }

            else {
                socket.player.score = socket.player.score + val;
                if (socket.player.score < 0)
                    socket.player.score = 0;
                io.sockets.emit('players', {me: players.indexOf(socket.player), players: players});
            }

            function calculateBonus(val) {
                var now = new Date();
                val = Math.min(5, val + parseInt((now - start) / 10000) / 10);
                start = now;
                return val;
            }
        }

        function updateHighest(player) {
            highest = player;
            io.sockets.emit('highest', highest);
            io.sockets.emit('players', {me: players.indexOf(socket.player), players: players});
            io.sockets.emit("alert", player.name + "님이 " + player.score + "점으로 최고기록을 경신했습니다.");
        }


        socket.on('disconnect', function () {
            players.remove(socket.player);
            updatePlayers();
        });

    });

};