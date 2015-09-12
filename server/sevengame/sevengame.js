var Game = require('./game.js');
var manager = require('./manager.js');
var logger = require('./../utils/logger.js');

module.exports = function (io, socket, store, db, Message) {
    socket.on('sevengame.join', function (id) {
        var on = socket.on.bind(socket);
        var events = {};

        socket.on = function (name, fn) {
            if (events[name]) {
                socket.removeListener(name, events[name]);
            }
            on(name, fn);
            events[name] = fn;
        };

        var game = manager.getPlayingGame(socket.sid);
        if (game) {
            if (manager.getByUrl(id) != game) {
                socket.emit('redirect', {state: 'seven', object: {id: game.id}, message: '진행중인 게임이 있습니다. 다시 연결합니다.'});
            }
            manager.register(game, socket.sid, id);
            game.reEnter(socket);
            return;
        }
        game = manager.getByUrl(id);
        if (game) {
            game.join(socket);
            manager.register(game, socket.sid);
            return;
        }
        game = new Game(store, db, id);
        game.join(socket);
        manager.register(game, socket.sid, id);

    });

    socket.on('sevengame.getRooms', function () {
        socket.emit('sevengame.rooms', manager.getRooms());
    });

    socket.on('leave', function () {
        logger.debug('send leave', socket.sid);
        manager.leave(socket.sid);
    });

    socket.on('disconnect', function () {
        logger.debug('disconnect', socket.sid);
        manager.leave(socket.sid);
    });
};