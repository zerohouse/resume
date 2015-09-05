(function () {
    var scope;
    app.controller('alert', function ($scope) {
        scope = $scope;
        $scope.alerts = [];
    });

    app.factory('alert', function () {
        var alert = function (message, success) {
            var al = {alert: message, date: new Date(), success: success};
            scope.alerts.push(al);
            scope.alert = al;
            scope.showing = true;
            if (scope.alerts.length > 6)
                scope.alerts.remove(scope.alerts[0]);
        };

        alert.getAlerts = function () {
            return scope.alerts;
        };
        return alert;
    });
})();