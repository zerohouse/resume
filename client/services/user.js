app.factory('user', function (req) {
    var user = {};
    req.get('/api/user/session').success(function (res) {
        if (res.user) {
            angular.copy(res.user, user);
            user.logged = true;
        }
    });
    return user;
});