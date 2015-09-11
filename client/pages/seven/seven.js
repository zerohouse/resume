app.controller('seven', function ($scope, socket, user, alert, $window) {

    $scope.logs = [];

    var icon = $scope.icon = {};
    icon.e = 'fa fa-eye';
    icon.x = 'fa fa-ban';

    $scope.$watch('in', function (val) {
        if (val == undefined)
            return;
        socket.emit('sevengame.in', val);
    }, true);

    $scope.submit = function (i) {
        socket.emit('submit', i);
    };

    function sortPlayers() {
        $scope.inPlayers = [];
        $scope.players.forEach(function (p) {
            if (p.sid == user.sid)
                $scope.player = p;
            if (p.in) {
                $scope.inPlayers.push(p);
            }
        });
        $scope.inPlayers.forEach(function (p) {
            $scope.players.remove(p);
        });
    }


    var width = document.querySelector('.card-dek').offsetWidth;

    angular.element($window).bind('resize', function () {
        width = document.querySelector('.card-dek').offsetWidth;
        $scope.$apply();
    });

    $scope.cardStyle = function (index) {
        var result = {};
        var def = index / $scope.player.cards.length;
        result.left = width * def - 11;
        result.left += 'px';
        var degree = (30 * def - 13.5);
        result.transform = "rotate(" + degree + "deg)";
        var x = (width / 2) - (width * def - 11) - 58;


        result.top = getTanDeg(degree) * x * (-1);
        result.top += 'px';
        return result;

        function getTanDeg(deg) {
            var rad = deg * Math.PI / 180;
            return Math.tan(rad);
        }
    };


    socket.on('sevengame.players', function (players) {
        $scope.players = players;
        sortPlayers();
        $scope.$apply();
    });

    socket.on('sevengame.alert', function (message) {
        $scope.logs.unshift(message);
        alert(message.message);
        $scope.$apply();
    });


    socket.on('sevengame.sync', function (state) {
        $scope.players = state.players;
        sortPlayers();
        $scope.game = state.game;
        $scope.$apply();
    });

});