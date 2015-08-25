var app = require('./server/app.js');
var http = require('http').Server(app);
var path = require('path');

//app.use('/', express.static('dist'));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/style.css'));
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});
