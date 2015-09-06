module.exports = function (app) {
    var session = require('express-session'),
        sessionStore = new session.MemoryStore(),
        cookieParser = require('cookie-parser'),
        COOKIE_SECRET = 'secret',
        COOKIE_NAME = 'sid';

    app.use(cookieParser(COOKIE_SECRET));
    app.use(session({
        name: COOKIE_NAME,
        store: sessionStore,
        secret: COOKIE_SECRET,
        saveUninitialized: true,
        resave: true,
        cookie: {
            path: '/',
            httpOnly: true,
            secure: false,
            maxAge: null
        }
    }));

    return sessionStore;
};
