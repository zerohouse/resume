app.controller('main', function ($scope) {

    $scope.name = "main";

    $scope.shapes = ['fa fa-bell', 'fa fa-heart-o', 'fa fa-circle-o'];
    $scope.colors = ['#FF0', '#F0F', '#0FF'];
    $scope.backs = ['#00F', '#0F0', '#F00'];

    $scope.selects = [];

    function Block(color, shape, back) {
        this.color = color;
        this.shape = shape;
        this.back = back;
    }

    Block.random = function () {
        return new Block(ranInt(3), ranInt(3), ranInt(3));
        function ranInt(val) {
            return parseInt(Math.random() * val);
        }
    };

    $scope.reset = function () {
        $scope.blocks = [];
        $scope.results = [];
        $scope.discovered = [];
        for (var i = 0; i < 9; i++) {
            $scope.blocks.push(Block.random());
        }

        getAll();

        function getAll() {
            for (var i = 0; i < 7; i++) {
                for (var j = i + 1; j < 8; j++) {
                    for (var k = j + 1; k < 9; k++) {
                        if (check($scope.blocks[i], $scope.blocks[j], $scope.blocks[k]))
                            $scope.results.push(i + "" + j + "" + k);
                    }
                }
            }
        }

    };

    $scope.style = function (block) {
        var style = {};
        style.color = $scope.colors[block.color];
        style['background-color'] = $scope.backs[block.back];
        return style;
    };

    $scope.reset();


    $scope.selectBlock = function (block) {
        $scope.selects.toggle(block);
        block.select = !block.select;
        if ($scope.selects.length > 3) {
            $scope.selects.splice(0, 1)[0].select = false;
        }
    };

    $scope.check = function () {
        if ($scope.selects.length != 3) {
            alert('3개 선택하세요');
            return;
        }
        var selects = [];
        $scope.selects.forEach(function (block) {
            selects.push($scope.blocks.indexOf(block));
        });
        selects.sort();
        var result = selects.join("");
        if ($scope.results.contains(result)) {
            $scope.results.remove(result);
            $scope.discovered.push(result);
            alert("합 성공");
            return;
        }
        if ($scope.discovered.contains(result)) {
            alert("합 실패 : 이미 찾은 합입니다.");
            return;
        }
        alert("합 실패");
        return;
    };

    $scope.done = function () {
        if ($scope.results.length == 0) {
            alert('결 성공!');
            return;
        }
        alert('결 실패!');
    };

    function check(block1, block2, block3) {
        return allSameOrDiff(block1.shape, block2.shape, block3.shape) &&
            allSameOrDiff(block1.color, block2.color, block3.color) &&
            allSameOrDiff(block1.back, block2.back, block3.back);

        function allSameOrDiff(val1, val2, val3) {
            if (val1 == val2) {
                if (val2 == val3)
                    return true;
                return false;
            }
            if (val2 == val3)
                return false;
            if (val3 == val1)
                return false;
            return true;
        }
    }


});