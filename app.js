// datalove <3
// dependencies
var http = require('http'),
	express = require('express'),
	app = express(),
	ejs = require('ejs-mate'),
	//ejs = require('ejs'),
	//expressLayouts = require('express-ejs-layouts'),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	methodOverride = require('method-override'),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	multer = require('multer'),
	errorHandler = require('errorhandler'),
	io = global.io = require('socket.io').listen(server, { log: false }),
	mongoose = require('mongoose'),
	mongourl = require('./shared/mongourl').generate(function(url) { mongoose.connect(url) }, 'otvoreni-budzet'),
	router = require('./shared/router')(app);

var roles = { 100: 'admins', 50: 'contribs', 10: 'users' };
var signs = { 100: '$', 50: '*', 10: '~' };
var sessionStuff = { name: '', online: '', role: '' };	

// all environments
app.set('port', process.env.PORT || 3000);

// layout

app.engine('ejs', ejs);
 
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, './public')));

/*app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('layout', 'layout');
app.set("views","./views");*/
//app.use(expressLayouts);



app.use(logger('dev'));
app.use(methodOverride());
app.use(session({ resave: true,
						saveUninitialized: true,
						secret: 'uwotm8' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false /*true*/ }));
app.use(multer());



app.use(function(req, res, next){
        
          if(req.session.user || '') {
            sessionStuff.name = req.session.user.name;
            sessionStuff.online = req.session.user.isOnline;
            sessionStuff.role = req.session.user.role;
            
            //redisdb.zadd('online', Date.now(), sessionStuff.name, next);
          } else
            next();
        });
      
      app.use(function(req, res, next){
          
          if(req.session.user || ''){
              var min = 60 * 1000;
              var ago = Date.now() - min;
              online = [];
              /*redisdb.zrevrangebyscore('online', '+inf', ago, function(err, users){
                    if (err) return next(err);
                    users.forEach(function(u){ online.push(u); });
                    next();
                });*/
                
          } else {
            sessionStuff.online = false;
            next();
            }
        });

      app.use(function (req, res, next) {
       
        res.locals({
            style: '', script: '', 
            username: sessionStuff.name,
            userstatus: sessionStuff.online,
            userrole: sessionStuff.role,
            roles: roles,
            signs: signs,
            online: online
            // e.g. session: req.session
        });
        
        next();
      });

app.use(express.static(path.join(__dirname, 'public')));

/*app.get('*', function(res, req, next){
	res.header('X-XSS-Protection' ,  '1; mode=block');
	//router = require('./shared/router')(app);
	next(); 
});*/

// error handling middleware should be loaded after the loading the routes
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

var server = http.createServer(app);

server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

// routing
//app.all('/*', router);

// server start
//server.listen(app.get('port'), app.get('host'));