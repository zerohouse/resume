app.config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('main', {
            url: "/",
            controller: "main",
            templateUrl: "/dist/main/main.html"
        })
        .state('list', {
            url: "/check",
            controller: "list",
            templateUrl: "/dist/list/list.html"
        })
        .state('check', {
            url: "/check/:id",
            controller: "check",
            templateUrl: "/dist/check/check.html"
        });

});
