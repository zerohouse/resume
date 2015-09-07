app.controller('list', function (socket, $scope, $state) {

    socket.emit('checkgame.getRooms');

    socket.on('checkgame.rooms', function (send) {
        $scope.rooms = send.rooms;
        $scope.highest = send.highest;
        $scope.best = send.best;
        $scope.$apply();
    });

    function ranName(length) {
        var ran = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLNMOPQRSTUVWXYZ0123456789";
        var result = "";
        for (var i = 0; i < length; i++)
            result += ran[parseInt(Math.random() * ran.length)];
        return result;
    }

    $scope.newGame = function () {
        $state.go('check', {id: ranName(10)});
    };

    $scope.ranGame = function () {
        if ($scope.rooms.length == 0) {
            $scope.newGame();
            return;
        }
        $state.go('check', {id: $scope.rooms[parseInt($scope.rooms.length * Math.random())].roomId});
    };

});