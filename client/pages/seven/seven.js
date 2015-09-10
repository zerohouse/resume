app.controller('seven', function ($scope, socket, user, alert) {

    $scope.logs = [];

    $scope.$watch('in', function (val) {
        if (val == undefined)
            return;
        socket.emit('sevengame.in', val);
    }, true);

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
        console.log(state);
        $scope.players = state.players;
        sortPlayers();
        $scope.game = state.game;
        $scope.$apply();
    });

    $scope.submit = function (i) {
        socket.emit('submit', i);
    };

    function sortPlayers() {
        $scope.inPlayers = [];
        $scope.players.forEach(function (p) {
            if (p.in) {
                $scope.inPlayers.push(p);
                return;
            }
            if (p.sid != user.sid)
                return;
            $scope.player = p;
        });
        $scope.inPlayers.forEach(function (p) {
            $scope.players.remove(p);
        });
    }


    $scope.steamstart = function (val) {
        document.querySelector('body').classList.add('steam');
        $scope.steam = true;

        var start;
        window.requestAnimationFrame(startTimer);
        function startTimer(tick) {
            if (!start)
                start = val + tick;
            $scope.time = parseInt((start - tick) / 100) / 10;
            $scope.$apply();
            if ($scope.time > 0 && $scope.steam)
                window.requestAnimationFrame(startTimer);
        }
    };


});