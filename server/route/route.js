module.exports = function (app, logger, store, db) {
    require('./user.js')(app, logger, store, db);
    require('./article.js')(app, logger, store, db);
    require('./mail.js')(app, logger, store, db);
};