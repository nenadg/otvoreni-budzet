// datalove <3
// dependencies
var http = require('http'),
	express = require('express'),
	app = express(),
	mongoose = require('mongoose'),
	mongourl = require('./shared/mongourl').generate(function(url) { 
		mongoose.connect(url) }, 'otvoreni-budzet'),
	config = require('./shared/config')(app, express),
	server = http.createServer(app),
	io = global.io = require('socket.io').listen(server, {
		origins: 'localhost:* http://localhost:* http://statick.org:*', 
		transports: ['websocket'],
		log: false}),
	router = require('./shared/router')(app);

server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});