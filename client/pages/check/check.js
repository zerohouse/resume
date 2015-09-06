(function () {
    var scope;
    var listScope;
    app.factory('socket', function (alert, user) {
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
            if (send.reset)
                scope.resetShapes();
            scope.name = send.name;
            scope.blocks = send.blocks;
            scope.discovered = send.discovered;
            scope.players = send.players;
            if (scope.id == undefined) {
                scope.id = send.id;
                scope.players.forEach(function (player) {
                    if (player.id == scope.id) {
                        alert("나는 " + player.name + " 입니다.");
                    }
                });
            }
            scope.selects = [];
            scope.$apply();

        });

        socket.on('rooms', function (send) {
            listScope.rooms = send.rooms;
            listScope.highest = send.highest;
            listScope.best = send.best;
            listScope.$apply();
        });

        socket.on('players', function (players) {
            scope.players = players;
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

    app.controller('list', function (socket, $scope, $state) {


        socket.emit('getRooms');
        listScope = $scope;

        function ranName(length) {
            var ran = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLNMOPQRSTUVWXYZ0123456789";
            var result = "";
            for (var i = 0; i < length; i++)
                result += ran[parseInt(Math.random() * ran.length)];
            return result;
        }

        $scope.newGame = function () {
            $state.go('check', {id: ranName(10)});
        };

        $scope.ranGame = function () {
            if ($scope.rooms.length == 0) {
                $scope.newGame();
                return;
            }
            $state.go('check', {id: $scope.rooms[parseInt($scope.rooms.length * Math.random())].roomId});
        };

    });

    app.controller('check', function ($scope, alert, socket, $stateParams, user) {
        $scope.id = user.email;
        $scope.roomId = $stateParams.id;

        $scope.$watch('orderedPlayers[0]', function (p) {
            if (p == undefined)
                return;
            if (p.score == 0)
                return;
            if (this.order != undefined && p.id == this.order.id)
                return;
            this.order = p;
            alert(p.name + "님이 " + p.score + "점으로 " + "방 1위에 올랐습니다.");
        });

        $scope.resetShapes = function () {
            $scope.shapes = [];
            var shapes = ['fa-umbrella', 'fa-heart', 'fa-phone', 'fa-plus', 'fa-bell', 'fa-star', 'fa-circle'];
            for (var i = 0; i < 3; i++) {
                $scope.shapes[i] = "fa " + shapes.splice(parseInt(Math.random() * shapes.length), 1);
            }
        };

        $scope.$watch(function () {
            return $stateParams.id
        }, function (id) {
            socket.emit('join', id);
        });

        scope = $scope;


        $scope.colors = ['#4337FD', '#FD3737', '#FDD237'];

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
            $scope.already = false;
            if ($scope.selects.length < 3)
                return;
            if ($scope.selects.length > 3) {
                $scope.selects.splice(0, 1)[0].select = false;
            }
            var se = $scope.format.selects($scope.selects);
            $scope.discovered.forEach(function (each) {
                if ($scope.format.discovered(each) == se) {
                    $scope.already = $scope.discovered.indexOf(each);
                }
            });
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
            if ($scope.already !== false)
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