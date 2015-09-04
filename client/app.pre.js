Array.prototype.contains = function (item) {
    return this.indexOf(item) != -1;
};


Array.prototype.remove = function (val, con) {
    if (con)
        if (!confirm('삭제하시겠습니까?'))
            return;
    this.splice(this.indexOf(val), 1);
};

Array.prototype.toggle = function (item) {
    if (this.contains(item)) {
        this.remove(item);
        return;
    }
    this.push(item);
};

var socket = io('/api/socket');

var app = angular.module('resume', ['ui.router', 'ui.bootstrap']);