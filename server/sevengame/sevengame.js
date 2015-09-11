var Game = require('./game.js');
var games = require('./games.js');

module.exports = function (io, socket, store, db, Message) {
    socket.on('sevengame.join', function (id) {
        var game = games.getPlayingGame(socket.sid);
        if (game) {
            if (games[id] != game) {
                socket.emit('redirect', {state: 'seven', object: {id: game.id}, message: '진행중인 게임이 있습니다. 다시 연결합니다.'});
            }
            game.reEnter(socket);
            games.register(game, socket.sid, id);
            return;
        }
        game = games[id];
        if (game) {
            game.join(socket);
            games.register(game, socket.sid);
            return;
        }
        game = new Game(store, db, id);
        games.register(game, socket.sid, id);
        game.join(socket);
    });

    socket.on('leave', function () {
        games.leave(socket);
    });

    socket.on('disconnect', function () {
        games.leave(socket);
    });
};