app.controller('sevenrooms', function (socket, $scope, $state, popup) {
    socket.on('sevengame.rooms', function (rooms) {
        $scope.rooms = rooms;
        $scope.$apply();
    });

    $scope.getRooms = function () {
        socket.emit('sevengame.getRooms');
    };

    $scope.getRooms();

    $scope.move = function (room) {
        $state.go('seven', {id: room});
        popup.hide()
    };

});