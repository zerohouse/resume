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
            templateUrl: "/dist/pages/main/main.html",
            onEnter: leaveRoom
        })
        .state('list', {
            url: "/check",
            controller: "list",
            templateUrl: "/dist/pages/list/list.html",
            onEnter: leaveRoom
        })
        .state('check', {
            url: "/check/:id",
            controller: "check",
            templateUrl: "/dist/pages/check/check.html"
        })
        .state('profile', {
            url: "/profile",
            controller: "profile",
            templateUrl: "/dist/pages/profile/profile.html",
            onEnter: leaveRoom
        })
        .state('board', {
            url: "/board",
            controller: "board",
            templateUrl: "/dist/pages/board/board.html",
            onEnter: leaveRoom
        });

    function leaveRoom(socket) {
        socket.emit('leave');
    }

});
