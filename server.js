var app = require('./server/app.js');
var http = require('http').Server(app);
http.listen(3000, function () {
    console.log('listening on *:3000');
});