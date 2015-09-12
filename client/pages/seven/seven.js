app.controller('seven', function ($scope, socket, user, alert, $window, $timeout) {

    $scope.logs = [];

    var bluechips = $scope.bluechips = [];
    var blackchips = $scope.blackchips = [];

    $scope.$watch('game.point', function (point) {
        console.log($scope.game);
        $scope.compute(point);
    });

    $scope.setTo = function (p) {
        if (p.sid == $scope.player.sid)
            return;
        if (!$scope.message)
            $scope.message = {};
        $scope.message.to = p;
    };

    var messages = $scope.messages = [];
    $scope.send = function (message) {
        if (message.message == undefined || message.message == '')
            return;
        $scope.message = {};
        $scope.message.to = message.to;
        message.date = new Date();
        socket.emit('sevengame.chat', message);
        if (!message.to)
            return;
        message.from = message.to;
        message.fromme = true;
        messages.push(message);
        $timeout(function () {
            chat.scrollTop = chat.scrollHeight;
        });
    };

    var bp = 5;
    $scope.compute = function (point) {
        var chips = getPoint();
        if (point < chips) {
            bluechips = $scope.bluechips = [];
            blackchips = $scope.blackchips = [];
            chips = 0;
        }
        for (var i = chips; i < point; i++)
            bluechips.push(i);
        changeChips();
        function changeChips() {
            if (bluechips.length < 10)
                return;
            for (var i = 0; i < bp; i++)
                bluechips.splice(bluechips.length - 1, 1);
            blackchips.push(blackchips.length);
            changeChips();
        }

        function getPoint() {
            return bluechips.length + blackchips.length * bp;
        }
    };


    $scope.$watch('player.in', function (val) {
        if (val == undefined)
            return;
        socket.emit('sevengame.in', val);
    }, true);

    $scope.submit = function (i) {
        socket.emit('sevengame.submit', i);
    };

    function sortPlayers() {
        $scope.inPlayers = [];
        $scope.players.forEach(function (p) {
            if (p.sid == user.sid) {
                $scope.player = p;
                return;
            }
            if (p.playing) {
                $scope.inPlayers.push(p);
            }
        });
        $scope.inPlayers.forEach(function (p) {
            $scope.players.remove(p);
        });
        if ($scope.player.playing)
            $scope.players.remove($scope.player);
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

    $scope.open = function (p) {
        if (p.submitted === true) {
            alert('패건들지 말어 손모가지 날아가붕게');
            return;
        }
        p.open = !p.open;
    };

    function timerStart(val) {
        window.requestAnimationFrame(startTimer);
        var start;

        function startTimer(tick) {
            if (!start)
                start = val + tick;
            $scope.time = parseInt((start - tick) / 1000);
            $scope.$apply();
            if ($scope.time > 0)
                window.requestAnimationFrame(startTimer);
        }
    }


    var chat = document.querySelector('.chat-window');
    socket.on('sevengame.chat', function (message) {
        $scope.messages.push(message);
        $scope.$apply();
        $timeout(function () {
            chat.scrollTop = chat.scrollHeight;
        });
    });


    socket.on('sevengame.time', function (time) {
        timerStart(time);
    });


    socket.on('sevengame.players', function (players) {
        $scope.players = players;
        sortPlayers();
        $scope.$apply();
    });

    socket.on('sevengame.alert', function (message) {
        $scope.logs.unshift(message);
        alert(message.message);
        $scope.$apply();
        $timeout(function () {
            chat.scrollTop = chat.scrollHeight;
        });
    });

    socket.on('sevengame.sync', function (state) {
        $scope.players = state.players;
        sortPlayers();
        $scope.game = state.game;
        $scope.$apply();
        if (state.type != 'open')
            return;
        alert('준비됐어? 까보까? <br> 자 지금부터 확인들어 가것습니다이');
        var i = 0;

        open(i, 800);
        function open(I, delay) {
            if (i == $scope.inPlayers.length)
                return;
            $timeout(function () {
                $scope.inPlayers[i].open = true;
                i++;
                open(i, delay);
                $scope.$apply();
            }, delay);
        }
    });

});