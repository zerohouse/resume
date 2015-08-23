var http = require('http');
var createHandler = require('github-webhook-handler');
var handler = createHandler({path: '/update/deploy', secret: 'myhashsecret'});
var exec = require('sync-exec');
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: 'debug'
        }),
        new (winston.transports.File)({
            filename: 'commit.log'
        })
    ]
});

http.createServer(function (req, res) {
    handler(req, res, function (err) {
        res.statusCode = 404;
        res.end('no such location')
    })
}).listen(7777);

handler.on('error', function (err) {
    logger.warn('Error:', err.message);
});

handler.on('push', function (event) {
    logger.info('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref);
    logger.info(exec('git pull').stdout);
    logger.info(exec('npm install').stdout);
    logger.info(exec('grunt').stdout);
    serverRestart();

    logger.info(exec('sudo cp nginx.conf /etc/nginx/nginx.conf').stdout);
    logger.info(exec('sudo service nginx reload').stdout);
});

function serverRestart() {
    var serverPid = exec('ps -ef | grep app.js').stdout.split("  ")[1];
    exec('kill -9 ' + serverPid);
    exec('node app.js&');
    logger.info('server restart %s', new Date().toString());
}
