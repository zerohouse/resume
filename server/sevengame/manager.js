var manager = {};
var logger = require('./../utils/logger.js');
var rooms = {};
var sidRooms = {};

manager.getRooms = function () {
    return Object.keys(rooms);
};

manager.getPlayingGame = function (sid) {
    if (!sidRooms[sid])
        return;
    if (!sidRooms[sid].ing)
        return;
    if (sidRooms[sid].getInPlayer(sid))
        return sidRooms[sid];
};

manager.register = function (game, sid, id) {
    sidRooms[sid] = game;
    if (id === undefined)
        return;
    rooms[id] = game;
};

manager.getByUrl = function (url) {
    return rooms[url];
};

manager.leave = function (sid) {
    logger.debug('leave games');
    if (!sidRooms[sid])
        return;
    sidRooms[sid].leave(sid);
    if (!sidRooms[sid].isEmpty()) {
        return;
    }
    logger.debug('delete', sidRooms[sid].id);
    sidRooms[sid].delete();
    rooms[sidRooms[sid].id] = null;
    delete rooms[sidRooms[sid].id];
    delete sidRooms[sid];
};

module.exports = manager;