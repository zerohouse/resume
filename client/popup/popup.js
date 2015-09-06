(function () {
    var scope;
    var pop;
    app.factory('popup', function () {
        var popup = {};

        pop = function (val) {
            popup.show = true;
            popup.state = val;
            scope.$apply();
        };

        pop.isShow = function () {
            return popup.show;
        };

        pop.getState = function () {
            return popup.state;
        };

        pop.hide = function () {
            popup.show = false;
        };


        return pop;
    });

    app.directive('popup', function () {
        return {
            restrict: 'A',
            link: function (s, e, a) {
                e.bind('click', function () {
                    pop(a.popup);
                });
            }
        }
    });

    app.controller('popup', function ($scope, popup) {
        scope = $scope;
        $scope.url = {};
        $scope.url.login = '/dist/popup/login/login.html';
        $scope.url.register = '/dist/popup/login/register.html';

        $scope.classes = {};
        $scope.classes.login = $scope.classes.register = $scope.classes.license = 'window-s';
        $scope.popup = popup;
    });

})();