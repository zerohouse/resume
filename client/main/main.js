var socket = io('/', {path: '/socket.io'});

app.controller('main', function ($scope, $timeout) {

    $scope.shapes = ['fa fa-bell', 'fa fa-star', 'fa fa-circle'];
    $scope.colors = ['#4337FD', '#FD3737', '#FDF737'];
    $scope.backs = ['#000', '#888', '#FFF'];

    $scope.selects = [];

    $scope.format = {};
    $scope.format.selects = function (selects) {
        var result = [];
        selects.forEach(function (block) {
            result.push($scope.blocks.indexOf(block) + 1);
        });
        result.sort();
        return result.join(", ");
    };
    $scope.format.discovered = function (string) {
        if (string == undefined)
            return;
        var result = [];
        result.push(parseInt(string[0]) + 1);
        result.push(parseInt(string[1]) + 1);
        result.push(parseInt(string[2]) + 1);
        return result.join(", ");
    };

    $scope.selectBlock = function (block) {
        $scope.selects.toggle(block);
        block.select = !block.select;
        if ($scope.selects.length > 3) {
            $scope.selects.splice(0, 1)[0].select = false;
        }
    };

    $scope.style = function (block) {
        var style = {};
        style.color = $scope.colors[block.color];
        style['background-color'] = $scope.backs[block.back];
        return style;
    };

    $scope.selects = [];

    $scope.check = function () {
        if ($scope.selects.length != 3)
            return;
        var selects = [];
        $scope.selects.forEach(function (block) {
            selects.push($scope.blocks.indexOf(block));
        });
        socket.emit('check', selects);
    };

    $scope.done = function () {
        socket.emit('done');
    };

    socket.on('check', function (success) {
        if (success) {
            return;
        }
        alert('합 실패 -1점');
    });

    socket.on('done', function (success) {
        if (success) {
            return;
        }
        alert('결 실패 -2점');
    });

    socket.on('game', function (send) {
        $scope.blocks = send.blocks;
        $scope.discovered = send.discovered;
        $scope.selects = [];
        $scope.$apply();
    });

    socket.on('players', function (players) {
        $scope.players = players;
        $scope.$apply();
    });

    $scope.alerts = [];

    function alert(alert, success) {
        var al = {alert: alert, date: new Date(), success: success};
        $scope.alerts.push(al);
        $scope.alert = al;
        $scope.showing = true;
        if ($scope.alerts.length > 6)
            $scope.alerts.remove($scope.alerts[0]);
    }

    socket.on('alert', function (message) {
        alert(message, true);
    });

});