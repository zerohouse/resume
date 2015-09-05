var g = require('./game/game.js');

module.exports = function (http) {

    var io = require('socket.io')(http);

    var game = g.newGame();
    var players = [];

    io.on('connection', function (socket) {

        socket.player = {score: 0};
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