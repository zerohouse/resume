var db = require('./../db/db.js');
var highest = {};
db.Record.findOne({type: 'highest'}, function (err, result) {
    if (!err && result != undefined)
        highest.highest = result.record;
});


module.exports = highest;