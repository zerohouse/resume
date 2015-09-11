app.factory('socket', function (user, $state, $timeout) {
    var socket = io('/', {path: '/socket.io', 'multiplex': false});
    var yo = false;
    socket.on('yo', function (id) {
        yo = true;
        user.sid = id;
    });
    yelling();

    function yelling() {
        if (yo)
            return;
        socket.disconnect();
        socket.connect();
        $timeout(yelling, 1000);
    }

    socket.on('redirect', function (send) {
        if (send.message)
            alert(send.message);
        $state.go(send.state, send.object);
    });

    var on = socket.on.bind(socket);
    var events = {};

    socket.on = function (name, fn) {
        if (events[name]) {
            socket.removeListener(name, events[name]);
        }
        on(name, fn);
        events[name] = fn;
    };

    return socket;
});