var connected = {};
module.exports = function (http, store, db) {
    var io = require('socket.io')(http),
        checkgame = require('./checkgame/checkgame.js');
    io.use(require('./io.session.js')(store));
    io.on('connection', function (socket) {
        socket.emit('yo');
        preventMutiple(socket.sid);
        if (socket.session.user || socket.session.user.email)
            preventMutiple(socket.session.user.email);
        checkgame(io, socket, store, db, Message);
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

        function preventMutiple(key) {
            if (!connected[key])
                connected[key] = [];
            connected[key].push(socket);

            for (var i = 0; i < connected[key].length - 1; i++) {
                connected[key][i].emit('alert', new Message("다른곳에서 접속했어요.", true, 150000));
                connected[key][i].disconnect();
            }
            connected[key].splice(0, connected[key].length - 1);
        }


        function Message(message, fail, duration) {
            this.message = message;
            this.fail = fail;
            this.duration = duration;
        }
    });
};