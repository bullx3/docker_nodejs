var mongoose = require('mongoose');

var User = mongoose.Schema({
	username: String,
	password: String,
	date: {type: Date, default: new Date()}
});
module.exports = mongoose.model('User', User);
