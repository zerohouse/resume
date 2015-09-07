(function () {
    var scope;
    var listScope;
    var socket = io('/', {path: '/socket.io'});
    app.factory('socket', function (alert, user, $state) {
        socket.on('steamstart', function (i) {
            var val = 30000;
            if (i == 2)
                val = 60000;
            scope.steamstart(val);
        });

        socket.on('move', function (id) {
            $state.go('check', {id: id});
        });

        socket.on('steamend', function () {
            scope.steamend();
        });

        socket.on('game', function (send) {
            if (send.reset)
                scope.resetShapes();
            scope.name = send.name;
            scope.blocks = send.blocks;
            scope.discovered = send.discovered;
            scope.players = send.players;
            send.players.forEach(function (player) {
                if (player.email == user.email || player.id == user.id) {
                    scope.player = player;
                }
            });
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
            players.forEach(function (player) {
                if (player.email == user.email || player.id == user.id)
                    scope.player = player;
            });
            scope.$apply();
        });

        socket.on('chat', function (message) {
            message.date = new Date();
            scope.messages.push(message);
            if (scope.messages.length > 8)
                scope.messages.remove(scope.messages[0]);
            scope.$apply();
        });

        socket.on('alert', function (message) {
            alert(message.message, !message.fail);
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

    app.controller('check', function ($scope, alert, socket, $stateParams, user, $timeout) {

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

        $scope.steamend = function () {
            document.querySelector('body').classList.remove('steam');
            $scope.steam = false;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        $scope.steampack = function (i) {
            var require = [15, 30, 150];
            if (scope.steam)
                return;
            if (scope.player.score < require[i])
                return;
            var alerts = [
                "15포인트를 소모하여 30초간 증가/감소하는 점수가 2배가 됩니다.",
                "30포인트를 소모하여 30초간 증가/감소하는 점수가 4배가 됩니다.",
                "150포인트를 소모하여 60초간 증가/감소하는 점수가 10배가 됩니다."]
            if (!confirm(alerts[i]))
                return;
            socket.emit('steampack', i);
        };

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
            $timeout(function () {
                socket.emit('join', id);
                console.log('join', id);
            }, 3000)
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

        $scope.send = function (message) {
            if (message == undefined)
                return;
            if (message == '') {
                return;
            }
            socket.emit('chat', message);
        };

        $scope.alerts = alert.getAlerts();

        $scope.prompt = function (val) {
            window.prompt("URL", "http://picks.be/check/" + val);
        };

        $scope.move = function () {
            socket.emit('move');
        }

    });


})();