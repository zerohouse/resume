(function () {

    var scope;


    app.factory('socket', function (alert) {
        var socket = io('/', {path: '/socket.io'});

        socket.on('check', function (success) {
            if (success) {
                return;
            }
        });

        socket.on('done', function (success) {
            if (success) {
                return;
            }
        });

        socket.on('game', function (send) {
            scope.blocks = send.blocks;
            scope.discovered = send.discovered;
            if (scope.id == undefined) {
                scope.id = send.id;
                scope.players.forEach(function (player) {
                    if (player.id == scope.id)
                        alert("나는 " + player.name + " 입니다.");
                });
            }
            scope.selects = [];
            scope.$apply();
        });

        socket.on('players', function (players) {
            scope.players = players;
            scope.$apply();
        });

        socket.on('alert', function (message) {
            alert(message.message, !message.fail);
        });

        socket.on('highest', function (highest) {
            scope.highest = highest;
            scope.$apply();
        });

        socket.on('chat', function (message) {
            message.date = new Date();
            scope.messages.push(message);
            if (scope.messages.length > 8)
                scope.messages.remove(scope.messages[0]);
            scope.$apply();
        });

        return socket;
    });

    app.controller('check', function ($scope, alert, socket) {
        scope = $scope;
        $scope.shapes = ['fa fa-bell', 'fa fa-star', 'fa fa-circle'];
        $scope.colors = ['#4337FD', '#FD3737', '#FDF737'];
        $scope.backs = ['#000', '#888', '#FFF'];

        $scope.selects = [];
        $scope.messages = [];

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

        $scope.$watch('blocks', function (blocks) {
            if (blocks == undefined)
                socket.emit('get');
        });

        $scope.send = function (message) {
            if (message == undefined)
                return;
            if (message == '') {
                return;
            }
            socket.emit('chat', message);
        };

        $scope.alerts = alert.getAlerts();

    });


})();