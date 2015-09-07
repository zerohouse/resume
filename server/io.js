module.exports = function (http, store, db) {
    var io = require('socket.io')(http),
        checkgame = require('./checkgame/checkgame.js');
    io.use(require('./io.session.js')(store));
    io.on('connection', function (socket) {
        socket.emit('yo');
        checkgame(io, socket, store, db);
    });
};