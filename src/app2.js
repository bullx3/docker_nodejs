"use strict";

var http = require('http');
var express = require('express');
var path = require('path');
var bodyparser = require('body-parser');
//var mongoose = require('mongoose');
var Mongodb = require('mongodb');
var assert = require('assert');
var Message = require('./schema/Message');
var app = express();

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');


//var mongodb_url = "mongodb://admonUser:admonSeacret@mongo_db:27017/admin"

var mongo_host = process.env.MY_MONGO_HOST;
var dbName = "nodejs";
var mongodb_url = "mongodb://" + mongo_host;
console.log(mongodb_url);


const MongoClient = Mongodb.MongoClient;
const client = new MongoClient(mongodb_url,{ useNewUrlParser: true, useUnifiedTopology: true});

var db; // class Db


client.connect(function(err){
	assert.equal(err, null); // エラーがあれば落とす

	console.log("successfully connected to MongoDB");
	db = client.db(dbName);
});

/*
mongoose.connect(mongodb_url,{}, function(err){
	if(err){
		console.error(err);
	}else{
		console.log("successfully connected to MongoDB");
	}
});
*/



app.use(bodyparser());

/*
// アクセスされた場合すべて
app.use(function(req, res, next){
	return res.send('Hello World')
});
*/
// http://host/ の呼び出し
app.get("/", function(req,res,next){
	return res.render('index',{title: 'Hello World'});
});
// http:/host/list/ の呼び出し
app.get("/list", function(req,res,next){
	return res.render('index',{title: 'List show'});
});

app.get("/chat", function(req,res,next){
	console.log("access get /chat");

	db.collection("messages",function(err, collection){
		collection.find().toArray()
			.then(function(msgs){
				return res.render('chat/index', {messages: msgs});
			})
			.catch(function(err){
				console.log(err);
			});
//		collection.find().toArray(function(err, msgs) {
//				assert.equal(err, null);
//				return res.render('chat/index', {messages: msgs});
//			});

	});
});

app.get("/chat/new", function(req,res,next){
	console.log("access get /chat/new")
	return res.render('chat/new');
});


app.post("/chat/update",function(req,res,next){
	console.log("access post /chat/update");
	console.log(req.body);

	var doc = req.body;
	doc["date"] = new Date();

	db.collection("messages",function(err, collection){
		collection.insertOne(doc)
			.then(function(result){
				return res.redirect('/chat');
			});
	});
});


console.log("Start Server")
var server = http.createServer(app);
server.listen('3000')


