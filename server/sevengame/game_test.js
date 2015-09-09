var chai = require('chai');
var expect = chai.expect;
var Game = require('./sevengame.js');

describe('newGame', function () {
    var players = [];
    for (var i = 0; i < 5; i++)
        players.push(new Game.Player(5));

    var g = new Game(players, 0);

    players[0].submit(1);
    players[1].submit(2);
    players[2].submit(3);
    players[3].submit(4);
    players[4].submit(5);
    players[4].submit(5);
    players[4].submit(5);
    players[4].submit(5);
    players[4].submit(5);
    players[4].submit(5);

    it('gameStart', function () {
        console.log(g);
    });

});