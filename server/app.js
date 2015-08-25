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

app.use('/', express.static('dist'));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

module.exports = app;