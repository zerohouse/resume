app.directive('sevencard', function () {
    return {
        restrict: 'A',
        templateUrl: "/dist/pages/seven/sevencard.html",
        scope: {
            sevencard: '='
        },
        controller: function ($scope) {
            var icon = $scope.icon = {};
            icon.e = 'fa fa-eye';
            icon.x = 'fa fa-ban';
        }
    }

});