(function () {
    var scope;
    app.controller('alert', function ($scope, socket, alert) {
        scope = $scope;
        $scope.alerts = [];

    });

    app.factory('alert', function ($timeout) {
        var alert = function (message, success) {
            $timeout.cancel(this.hide);
            this.hide = $timeout(function () {
                scope.showing = false;
            }, 1500);
            var al = {alert: message, date: new Date(), success: success};
            scope.alerts.push(al);
            scope.alert = al;
            scope.showing = true;
            if (scope.alerts.length > 6)
                scope.alerts.remove(scope.alerts[0]);
            if (!scope.$$phase) {
                scope.$apply();
            }
        };

        alert.getAlerts = function () {
            return scope.alerts;
        };
        return alert;
    });
})();