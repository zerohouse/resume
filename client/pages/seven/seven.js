app.controller('seven', function ($scope, socket, user, alert) {

    $scope.logs = [];

    $scope.$watch('in', function (val) {
        if (val == undefined)
            return;
        socket.emit('sevengame.in', val);
        console.log(1);
    }, true);

    socket.on('sevengame.players', function (players) {
        $scope.players = players;
        defineMe();
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
        $scope.turn = state.turn;
        $scope.point = state.point;
        $scope.ing = state.ing;
        defineMe();
        $scope.submitted = state.submitted;
        $scope.$apply();
    });

    $scope.submit = function (i) {
        socket.emit('submit', i);
    };

    function defineMe() {
        $scope.players.forEach(function (p) {
            if (p.sid != user.sid)
                return;
            $scope.player = p;
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