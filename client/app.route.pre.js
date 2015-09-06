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
            templateUrl: "/dist/pages/main/main.html"
        })
        .state('list', {
            url: "/check",
            controller: "list",
            templateUrl: "/dist/pages/list/list.html"
        })
        .state('check', {
            url: "/check/:id",
            controller: "check",
            templateUrl: "/dist/pages/check/check.html"
        })
        .state('profile', {
            url: "/profile",
            controller: "profile",
            templateUrl: "/dist/pages/profile/profile.html"
        })
        .state('board', {
            url: "/board",
            controller: "board",
            templateUrl: "/dist/pages/board/board.html"
        });

});
