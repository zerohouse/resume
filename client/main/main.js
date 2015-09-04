
var socket = io('/', {path: '/socket.io'});

app.controller('main', function ($scope) {

    $scope.name = "main";

    $scope.shapes = ['fa fa-bell', 'fa fa-heart-o', 'fa fa-circle-o'];
    $scope.colors = ['#FF0', '#F0F', '#0FF'];
    $scope.backs = ['#00F', '#0F0', '#F00'];

    $scope.selects = [];


    socket.on('game', function (g) {
        console.log(1);
        console.log(g);
    });

});