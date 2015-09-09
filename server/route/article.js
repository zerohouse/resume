module.exports = function (app, logger, store, db) {
    app.post('/api/article', function (req, res) {
        var article = new db.Article(req.passed);
        article.save(function (e, r) {
            res.send(r);
        });
    });

    app.get('/api/article', function (req, res) {
        var query = db.Article.find().sort({'date': -1}).limit(req.passed.limit).skip(req.passed.page * req.passed.limit);
        query.exec(function (e, r) {
            res.send(r);
        });
    });

    app.post('/api/article/delete', function (req, res) {
        console.log(req.passed);
        if (!req.session.user)
            return;
        if (req.passed.user != req.session.user.email)
            return;
        if (!req.passed._id)
            return;
        var query = {};
        query._id = req.passed._id;
        query['user.email'] = req.session.user.email;
        console.log(query);
        db.Article.remove(query).exec(function (e, r) {
            res.send(r);
        });
    });
};