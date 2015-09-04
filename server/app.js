var express = require('express'),
    app = express();

var logger = require('./utils/logger.js');
app.use(function (req, res, next) {
    res.charset = "utf-8";
    next();
});
require('./utils/parse.js');
require('./utils/upload.js')(app);
require('./utils/session.js')(app);
require('./route/route.js')(app, logger);

module.exports = app;