app.factory('socket', function (user, $state, $timeout) {
    var socket = io('/', {path: '/socket.io', 'multiplex': false});
    var yo = false;
    socket.on('yo', function () {
        yo = true;
    });
    yelling();

    function yelling() {
        if (yo)
            return;
        socket.disconnect();
        socket.connect();
        $timeout(yelling, 1000);
    }

    return socket;
});