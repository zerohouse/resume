var express = require('express'),
    app = express();

var logger = require('./utils/logger.js');
app.use(function (req, res, next) {
    res.charset = "utf-8";
    next();
});
app.http = require('http').Server(app);
require('./utils/parse.js')(app);
require('./utils/upload.js')(app);
var store = require('./utils/session.js')(app);
var db = require('./db/db.js');
require('./route/route.js')(app, logger, store, db);
require('./io.js')(app.http, store, db);

module.exports = app;