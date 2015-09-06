var db = {},
    mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/picks');

db.User = mongoose.model('user', mongoose.Schema({
    email: {type: String, index: true, unique: true},
    password: String,
    name: String,
    photo: String,
    score: Number
}));

db.User.schema.path('email').validate(function (value) {
    return /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(value);
}, 'Invalid email');


db.Record = mongoose.model('record', mongoose.Schema({
    type: {type: String, index: true, unique: true},
    record: Object
}));


module.exports = db;