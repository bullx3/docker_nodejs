"use strict";

var http = require('http');
var express = require('express');
var path = require('path');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var fileUpload = require('express-fileupload');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

// Schema
var Message = require('./schema/Message');
var User = require('./schema/User');

var app = express();

// MongoDBへのアクセス
// 認証なし
// 　"mongodb://<host>:<port>/<databse>"
// 認証あり
//   "mongodb://<mongo_user>:<mongo_password>@<host>:<port>/<databse>"
var mongo_host = process.env.MY_MONGO_HOST;
var mongo_port = process.env.MY_MONGO_PORT;
var mongo_db = process.env.MY_MONGO_DB_NAME;
var mongo_user = process.env.MY_MONGO_USER;
var mongo_pass = process.env.MY_MONGO_PASS;
var mongodb_url;
if (mongo_user && mongo_pass){
	mongodb_url = `mongodb://${mongo_user}:${mongo_pass}@${mongo_host}:${mongo_port}/${mongo_db}`
} else {
	mongodb_url = `mongodb://${mongo_host}:${mongo_port}/${mongo_db}`
}
console.log(mongodb_url);

mongoose.connect(mongodb_url,{ useNewUrlParser: true, useUnifiedTopology: true}, function(err){
	if(err){
		console.error(err);
	}else{
		console.log("successfully connected to MongoDB");
	}
});




app.use(bodyparser());

app.use(session({secret: 'HogeFuga'}));
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');
app.use("/image", express.static(path.join(__dirname, 'image')));


// アクセスされた場合すべて
app.all('/*', function(req, res, next){
	console.log(`route ${req.method} ${req.path}`);

	return next();
});

//セッションのシリアライズ
// Sessionに保存されるUser識別の情報を指定する
passport.serializeUser(function(user,done){
	console.log('do serializeUser');
	console.log(user);
	done(null, user._id);
});

// デシリアライズ. Sessionから渡されたデータでユーザーを検索して指定する。
passport.deserializeUser(function(id, done){
	console.log('do deserializeUser')
	console.log(id);
	User.findOne({_id: id}, function(err, user){
		if (err) { console.log(err); }
		done(err, user);
	});
});

passport.use(new LocalStrategy(function(username, password, done){
	console.log('LocalStrategy!')
	console.log(`username: ${username}, password: ${password}`)
	User.findOne({username: username},function(err, user){

		if (err) { 
			console.log('find error');
			return done(err);
		}
		// Userが登録されてるかチェック
		if (!user) {
			console.log('Incorrect username.');
			return done(null, false, {message: 'Incorrect username.'});
		}
		// パスワードが一致しているか？
		if(user.password !== password){
			console.log('Incorrect Password.');
			return done(null, false, {message: 'Incorrect Password.'});
		}
		console.log('success LocalStrategy');
		return done(null, user);
	});
}));


app.get("/", function(req,res,next){
	return res.render('index',{user: req.user});
});

app.all(['/chat','/chat/*'], function(req,res,next){
	console.log("access all /chat/*")
	if(!req.user){
		console.log('You need to login')
		return res.redirect('/')
	}
	return next();
});

app.get("/chat", function(req,res,next){
	console.log("access get /chat");
	Message.find({}, function(err, msgs){
		if(err) throw err;
		return res.render('chat/index', {messages: msgs});
	});
});

app.get("/chat/new", function(req,res,next){
	console.log("access get /chat/new");
	return res.render('chat/new');
});


app.post("/chat/update", fileUpload(),function(req,res,next){
	console.log("access post /chat/update");

	//ファイル名がかぶらないようにdocumentのidをファイルパスにする
	//idを取得する為、一旦ファイルパス以外は保存し、そのIDを持ってファイルの保存およびパスの追加を行う
	var newMessage = new Message({
		username: req.user.username, // セッションで確保されてるuser情報を使う
		message: req.body.message,
	});
	newMessage.save(function(err, doc){
		if(err) throw err;
		console.log(doc);

		if(req.files && req.files.image) {		// ファイル指定の有無チェック
			console.log("exist upload file");
			var id_string = doc.id  //String
			// ファイルをimageパスにコピー。ファイル名は追加したdocumentのid
			req.files.image.mv('./image/' + id_string, function(err){
				if(err) throw err;
				console.log("compolete file copy");
				// ファイルパスを追加して上書き
				Message.updateOne(
					{_id: doc.id},	//条件
					{$set: {image_path: id_string}}, // 変更内容
					function(err) {
						if (err) throw err;
						return res.redirect('/chat');
					});
			});
		}else{
			return res.redirect('/chat');
		}
	});
});

// ユーザ登録画面
app.get("/signin", function(req, res, next){
	return res.render('signin');
});

// ユーザー登録処理
app.post("/signin", function(req, res, next){
	var newUser = new User({
		username: req.body.username,
		password: req.body.password
	});
	newUser.save((err) =>{
		if(err) throw err;
		return res.redirect('/');
	});
});


app.get('/login', function(req, res, next){
	return res.render('login');
});

app.post('/login', passport.authenticate('local',{	successRedirect: '/',
													failureReirect:'/login',
												})
);

app.get('/logout', function(req, res){
	console.log(req.user)
	console.log(req.session)
	req.logout();
	console.log(req.user)
	console.log(req.session)
	return res.redirect('/')
})


console.log("Start Server")
var server = http.createServer(app);
server.listen('3000')


