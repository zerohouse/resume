module.exports = function (http, store, db) {
    var io = require('socket.io')(http),
        checkgame = require('./checkgame/checkgame.js');
    io.use(require('./io.session.js')(store));
    io.on('connection', function (socket) {
        socket.emit('yo');
        checkgame(io, socket, store, db);

        socket.on('update', function (user) {
            if (!socket.session.user)
                return;
            if (!socket.session.user.email)
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
};