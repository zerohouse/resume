app.controller('login', function ($scope, req, alert, popup, user, socket) {

    $scope.register = function () {
        req.post('/api/user', $scope.user).success(function (res) {
            if (res.error) {
                alert("이메일 형식이 맞지 않거나 이미 가입한 이메일입니다.");
                return;
            }
            alert("가입되었습니다.");
            popup('login');
        });
    };

    $scope.login = function () {
        req.post('/api/user/login', $scope.user).success(function (res) {
            if (res.error) {
                alert(res.error);
                return;
            }
            alert("로그인 되었습니다.");
            angular.copy(res, user);
            user.logged = true;
            location.reload();
        });
    };

});