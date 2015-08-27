#init-node-ngin 0.0.1

### 서버
    Dev - NodeJS (grunt - nodemon)
    Prod - Nginx + Node APi Server
    Test - Mocha & chai
    
    /server/db // mongoose setting
    /server/route // route setting

### 클라이언트
    angular
    css - less
    Test - Karma & jasmine


    *.pre.js
    *.js
    *.post.js
    *_test.js // 클라이언트 테스트 - 카르마, 자스민기반   

### 시작하기
    git clone
    npm install
    grunt run


### 배포서버
nginx.conf에서 루트 디렉터리를 레파지토리의 dist로 지정.
Nginx + Nodejs ApiServer

### 로컬개발환경
Grunt에서 Nodemon으로 실행.
dist를 Node가 serve