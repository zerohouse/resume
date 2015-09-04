var g = require('./game/game.js');

module.exports = function (http) {

    var io = require('socket.io')(http);

    var game = g.newGame();

    io.on('connection', function (socket) {
        console.log(1);
        console.log(game);
        socket.emit('game', game);



    });

};