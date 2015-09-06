app.controller('nav', function (user, $scope, req) {
    $scope.user = user;
    $scope.logout = function () {
        req.get('/api/logout').success(function () {
            location.reload();
        });
    }
});