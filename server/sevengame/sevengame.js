var Game = require('./game.js');
var games = {};
var players = {};

module.exports = function (io, socket, store, db, Message) {

    socket.on('sevengame.join', function (id) {
        if (socket.roomId != undefined) {
            socket.leave(socket.roomId);
            if (games[socket.roomId] != undefined)
                games[socket.roomId].removePlayer(socket);
            updatePlayers();
        }
        socket.roomId = id;
        gameStart(id);
        if (games[id].getPlayerSize() > 10) {
            socket.emit('alert', new Message('방에 사람이 너무 많네요. 딴방갑니다.'));
            //moveToOtherRoom();
            return;
        }
        socket.join(id);
        games[socket.roomId].addPlayer(socket);
        updatePlayers();

        function gameStart(vid) {
            if (games[vid] != undefined) {
                return;
            }
            games[vid] = new Game(io);
        }
    });

    socket.on('leave', function () {
        socket.leave(socket.roomId);
        leaveGame();
    });


    function leaveGame() {
        if (games[socket.roomId] == undefined)
            return;
        games[socket.roomId].removePlayer(socket);
        if (games[socket.roomId].getPlayerSize() == 0)
            gameEnd(socket.roomId);
        socket.roomId = undefined;
        updatePlayers();
    }

    socket.on('disconnect', function () {
        leaveGame();
    });

    function gameEnd(vid) {
        if (games[vid] == undefined)
            return;
        games[vid] = undefined;
        delete games[vid];
    }


    function updatePlayers() {
        if (!games[socket.roomId])
            return;
        io.to(socket.roomId).emit('sevengame.players', games[socket.roomId].getPlayers());
    }
};