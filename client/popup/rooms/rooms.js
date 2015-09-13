app.controller('rooms', function (socket, $scope, $state, popup) {

    $scope.move = function (room) {
        $state.go('seven', {id: room});
        popup.hide();
    };
});
    