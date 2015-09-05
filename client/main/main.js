var socket = io('/', {path: '/socket.io'});

app.controller('main', function ($scope) {

    $scope.name = "main";

    $scope.shapes = ['fa fa-bell', 'fa fa-heart-o', 'fa fa-circle-o'];
    $scope.colors = ['#FF0', '#F0F', '#0FF'];
    $scope.backs = ['#00F', '#0F0', '#F00'];

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
            alert('합 성공');
            return;
        }
        alert('합 실패');
    });

    socket.on('done', function (success) {
        if (success) {
            alert('결 성공');
            return;
        }
        alert('결 실패');
    });

    socket.on('game', function (send) {
        $scope.blocks = send.blocks;
        $scope.discovered = send.discovered;
        $scope.selects = [];
        $scope.$apply();
    });

    socket.on('player', function (player) {
        $scope.player = player;
    });


});