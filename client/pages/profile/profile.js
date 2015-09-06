app.controller('profile', function (user, $scope, socket) {
    $scope.user = user;

    $scope.updateUser = function () {
        socket.emit('update', user);
    }

});