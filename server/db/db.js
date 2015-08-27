var db = {},
    mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId();
mongoose.connect('mongodb://localhost:27017/resume');
db.abc = 'ab';


module.exports = db;