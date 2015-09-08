Array.prototype.contains = function (item) {
    return this.indexOf(item) != -1;
};

Array.prototype.remove = function (val) {
    this.splice(this.indexOf(val), 1);
};
var game = {};
game.Block = function (color, shape, back) {
    this.color = color;
    this.shape = shape;
    this.back = back;
};
game.Block.random = function () {
    var result = [];
    for (var i = 0; i < 3; i++)
        for (var j = 0; j < 3; j++)
            for (var k = 0; k < 3; k++)
                result.push([i, j, k]);

    var blocks = [];
    for (var l = 0; l < 9; l++) {
        var ran = result.splice(parseInt(Math.random() * result.length), 1)[0];
        blocks.push(new game.Block(ran[0], ran[1], ran[2]));
    }
    return blocks;

    function ranInt(val) {
        return parseInt(Math.random() * val);
    }
};

game.Game = function () {
    this.blocks = [];
    this.discovered = [];
    this.results = [];
};

game.Game.prototype.done = function () {
    if (this.results.length == 0)
        return true;
    return false;
};

game.Game.prototype.check = function (selects) {
    if (selects == undefined) return false;
    if (selects.length != 3) return false;
    selects.sort();
    var result = selects.join("");
    if (this.results.contains(result)) {
        this.results.remove(result);
        this.discovered.push(result);
        return true;
    }
    return false;
};

game.Game.prototype.getAllResults = function () {
    if (this.blocks.length < 3)
        return;
    for (var i = 0; i < this.blocks.length - 2; i++) {
        for (var j = i + 1; j < this.blocks.length - 1; j++) {
            for (var k = j + 1; k < this.blocks.length; k++) {
                if (check(this.blocks[i], this.blocks[j], this.blocks[k]))
                    this.results.push(i + "" + j + "" + k);
            }
        }
    }

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

};

var logger = require('./../utils/logger.js');

game.newGame = function () {
    var names = ["2009로스트 메모리즈", "4발가락", "YMCA야구단", "2424", "H", "공공의적", "결혼은 미친짓이다", "긴급조치 19호", "가문의 영광", "굳세어라 금순아", "광복절 특사", "나쁜남자", "낙타들", "남자 태어나다", "뚫어야 산다", "둘 하나 섹스", "도둑맞곤 못살아", "동접", "라이터를 켜라", "로드 무비", "라이브 라인", "마리이야기", "몽중인", "미워도 다시한번", "묻지마 패밀리", "마고", "미션 바라바", "마법의 성", "몽정기", "밀애", "버스", "복수는 나의 것", "보스 상륙 작전", "싸울아비", "새는 폐곡선을 그리다", "스물넷", "생활의 발견", "서프라이즈", "쓰리", "성냥팔이소녀의 재림", "사자성어", "색즉시공", "아프리카", "이소룡을 찾아랏", "이것은 서태지가 아니다", "아이언 팜", "울랄라 씨스터즈", "일단 뛰어", "오버 더 레인보우", "예스터데이", "아유레디", "오아시스", "우렁각시", "연애소설", "유아독존", "정글쥬스", "집으로", "재밌는영화", "좋은사람있으면 소개시켜줘", "중독", "죽어도 좋아", "취화선", "챔피언", "철없는 아내와 파란만장한 남편", "턴 잇 업", "피도 눈물도 없이", "폰", "패밀리", "피아노 치는 대통령", "품행제로", "해피데이"];
    var size = 9;
    var result = new game.Game();
    result.blocks = game.Block.random();
    result.getAllResults();
    result.name = names[parseInt(Math.random() * names.length)];
    logger.debug(result);
    return result;
};


module.exports = game;