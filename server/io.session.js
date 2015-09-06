module.exports = function (store) {
    var cookieParser = require('cookie-parser'),
        cookie = require('cookie'),
        COOKIE_SECRET = 'secret',
        COOKIE_NAME = 'sid';

    function ranname() {
        var names = [
            "가마우지", "갈매기", "개개비", "거위", "고니", "곤줄박이", "기러기", "까마귀", "까치", "꼬리치레", "꾀꼬리", "꿩", "나무발발이", "논병아리", "느시", "닭", "독수리", "동고비", "두견", "두루미", "따오기", "딱따구리",
            "뜸부기", "마도요", "말똥가리", "매", "메추라기", "밀화부리", "발구지", "병아리", "부엉이", "비둘기", "뻐꾸기", "새홀리기", "솔개", "아비", "양진이", "어치", "오리", "오목눈이", "올빼미", "왜가리", "원앙", "제비", "조롱이", "종다리", "지빠귀", "직박구리", "찌르레기", "할미새사촌", "해오라기", "앵그리 버드"
        ];
        return names[parseInt(Math.random() * names.length)];
    }

    return function (socket, next) {
        try {
            var data = socket.handshake || socket.request;
            if (!data.headers.cookie) {
                return next(new Error('Missing cookie headers'));
            }
            var cookies = cookie.parse(data.headers.cookie);
            if (!cookies[COOKIE_NAME]) {
                return next(new Error('Missing cookie ' + COOKIE_NAME));
            }
            var sid = cookieParser.signedCookie(cookies[COOKIE_NAME], COOKIE_SECRET);
            if (!sid) {
                return next(new Error('Cookie signature is not valid'));
            }
            socket.sid = sid;
            store.get(sid, function (err, session) {
                if (err) return next(err);
                if (!session) return next(new Error('session not found'));
                socket.session = session;
                if (session.user == undefined) {
                    socket.player = session.user = {
                        score: 0,
                        name: ranname(),
                        id: socket.id
                    };
                    store.set(socket.sid, session);
                }
                else {
                    socket.player = session.user;
                    socket.player.id = session.user.email;
                    if (isNaN(socket.player.score))
                        socket.player.score = 0;
                    if (!socket.player.name)
                        socket.player.name = ranname();
                }
                next();
            });
        } catch (err) {
            next(new Error('Internal server error'));
        }
    }
};