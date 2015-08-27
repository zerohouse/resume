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

### 로컬 개발환경에서 시작하기
    git clone
    npm install
    grunt run


### AWS에서 시작하기

#### nginx 설치
    nginx.conf에서 루트 디렉터리를 레파지토리의 dist로 지정.
    sudo mv nginx.conf /etc/nginx/
    chmod 755 /home/ec2-user/

#### node 설치
    sudo yum install nodejs npm --enablerepo=epel
    sudo npm install -g n
    sudo n stable
    sudo cp /usr/local/bin/node /usr/bin/node

#### Grunt 설치(npm)
#### PM2 설치(npm)
#### [mongodb 설치](http://docs.mongodb.org/ecosystem/platforms/amazon-ec2/)

#### git 설치
#### git clone
#### watch-git 실행
#### gitHub에서 webhook 등록
    
### 로컬개발환경
Grunt에서 Nodemon으로 실행.
dist를 Node가 serve