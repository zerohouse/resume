var games = {};

games.getPlayingGame = function (sid) {
    if (!this[sid])
        return;
    if (!this[sid].ing)
        return;
    if (this[sid].getInPlayer(sid))
        return this[sid];
};


games.register = function (game, sid, id) {
    this[sid] = game;
    if (id !== undefined)
        this[id] = game;
};

games.leave = function (socket) {
    if (!this[socket.sid])
        return;
    this[socket.sid].leave(socket.sid);
    if (!this[socket.sid].isEmpty())
        return;
    this[socket.sid] = undefined;
    delete this[socket.sid];
};

module.exports = games;