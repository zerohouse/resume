var express = require('express'),
    app = require('./server/app.js'),
    path = require('path'),
    http = require('http').Server(app);

app.use('/', express.static('dist'));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
