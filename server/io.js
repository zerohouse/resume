var g = require('./game/game.js');

module.exports = function (http) {

    var io = require('socket.io')(http);

    var game = g.newGame();

    io.on('connection', function (socket) {
        function send() {
            var send = {};
            send.blocks = game.blocks;
            send.discovered = game.discovered;
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
            if (!done)
                return;
            sendToAll();
        });
        socket.on('done', function () {
            var done = game.done();
            socket.emit('done', done);
            if (!done)
                return;
            game = g.newGame();
            sendToAll();
        });

    });

};