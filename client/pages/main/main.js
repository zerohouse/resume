app.controller('main', function ($scope, socket) {


    socket.on('highest', function (highest) {
        $scope.highest = highest;
        $scope.$apply();
    });

    socket.on('getGameList', function (gameList) {
        $scope.gameList = gameList;
        $scope.$apply();
    });

    $scope.skills = ['JAVA', 'Javascript', 'AngularJS', 'NodeJS', 'Spring MVC', 'Java WebServlet', 'MongoDB', 'Mysql', 'Redis', 'Less', 'Css3', 'Html5', 'SocketIO', 'NginX'];

});