module.exports = function (store) {
    var cookieParser = require('cookie-parser'),
        cookie = require('cookie'),
        COOKIE_SECRET = 'secret',
        COOKIE_NAME = 'sid';

    return function (socket, next) {
        try {
            var data = socket.handshake || socket.request;
            if (!data.headers.cookie) {
                return next(new Error('Missing cookie headers'));
            }
            var cookies = cookie.parse(data.headers.cookie);
            if (!cookies[COOKIE_NAME]) {
                return next(new Error('Missing cookie ' + COOKIE_NAME));
            }
            var sid = cookieParser.signedCookie(cookies[COOKIE_NAME], COOKIE_SECRET);
            if (!sid) {
                return next(new Error('Cookie signature is not valid'));
            }
            socket.sid = sid;
            store.get(sid, function (err, session) {
                if (err) return next(err);
                if (!session) return next(new Error('session not found'));
                socket.session = session;
                next();
            });
        } catch (err) {
            next(new Error('Internal server error'));
        }
    }
};