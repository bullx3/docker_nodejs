# docker_nodejs

## Descrition

docker を使ってnode.js + express環境を起動する  
このコードは学習および雛形を作る為の環境です。  
基本的な処理しか記載していません。

docker-compose構成  

    node
    mongo
    mongo-express

主に以下の内容を実行  

    ・基本ルーティング
    ・pugを使ったテンプレート
    ・mongooseを使ったmongodbの使用
    ・mongodb driverを使ったmongodbの使用（お試し）
    ・画像アップロード
    ・passport(+ passport-local)を使ったローカル認証
    ・seesionにmongodb(mongoose)を使用
    ・sessionのオプション指定

## Demo

## VS. 

## Requirement

Docker Version

    Docker version 19.03.2, build 6a30dfc
    docker-compose version 1.24.1, build 4667896b


npm Version

    alert@1.0.0 assert@2.0.0
    body-parser@1.19.0
    connect-mongo@3.0.0
    express@4.17.1
    express-fileupload@1.1.6-alpha.5
    express-session@1.16.2
    mongodb@3.3.2
    mongoose@5.7.1
    passport@0.4.0
    passport-local@1.0.0
    pug@2.0.4

## Usage

dockerの起動

    $ docker-compose up -d

nodejsコンテナのbashを起動

    $ docker-compose exec web /bin/bash


expressの起動（nodejsコンテナのbashから）

    $ cd /mydata/src
    $ node app.js

## Install

ミドルウェアのインストール

バージョン指定

    $ npm install alert@1.0.0 assert@2.0.0 body-parser@1.19.0 connect-mongo@3.0.0 express@4.17.1 express-fileupload@1.1.6-alpha.5 express-session@1.16.2 mongodb@3.3.2 mongoose@5.7.1 passport@0.4.0 passport-local@1.0.0 pug@2.0.4

最新版

    $ npm install alert assert body-parser connect-mongo express express-fileupload express-session mongodb mongoose passport passport-local pug


## Contribution

## Licence

MIT

## Author

[bullx3](https://github.com/bullx3)