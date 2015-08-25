var express = require('express'),
    app = express(),
    path = require('path');

var logger = require('./logger.js');
app.use(function (req, res, next) {
    res.charset = "utf-8";
    next();
});
require('./parse.js');
require('./upload.js')(app);
require('./session.js')(app);
require('./route.js')(app, logger);

module.exports = app;