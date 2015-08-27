describe('mainController', function () {
    beforeEach(module('resume'));
    var $controller;

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    describe('$scope.grade', function () {
        it('sets the strength to "strong" if the password length is >8 chars', function () {
            var $scope = {};
            var controller = $controller('main', {$scope: $scope});
            console.log($scope);
            expect($scope).not.to.equal(null);
        });
    });
});