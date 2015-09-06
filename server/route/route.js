function Result(result) {
    this.result = result;
}

function Error(err) {
    this.error = err;
}

module.exports = function (app, logger, store, db) {
    app.post('/api/user', function (req, res) {
        var user = new db.User(req.passed);
        user.save(function (err, r) {
            if (err)
                res.send(new Error(err));
            res.send(new Result(r));
        });
    });

    app.post('/api/user/login', function (req, res) {
        db.User.findOne(req.passed, function (err, r) {
            if (r == null) {
                res.send(new Error("해당 정보 없습니다."));
                return;
            }
            r.password = undefined;
            req.session.user = r;
            req.session.save();
            res.send(new Result(r));
        });
    });

    app.get('/api/user/session', function (req, res) {
        if (req.session.user) {
            res.send({user: req.session.user});
            return;
        }
        res.send({});
    });

    app.get('/api/logout', function (req, res) {
        req.session.destroy();
        res.send({});
    });

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
        if (!req.session.user)
            return;
        if (req.passed.user != req.session.user.email)
            return;
        var query = {};
        query._id = req.passed._id;
        query['user.email'] = req.passed.email;

        db.Article.remove(query).exec(function (e, r) {
            res.send(r);
        });
    });
};