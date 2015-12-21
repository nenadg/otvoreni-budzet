var ejs = require('ejs-mate'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  methodOverride = require('method-override'),
  session = require('express-session'),
  bodyParser = global.bodyParser = require('body-parser'),
  multer = require('multer'),
  errorHandler = require('errorhandler');
    
module.exports = function(app, express){

  var roles = { 100: 'admins', 50: 'contribs', 10: 'users' },
    signs = { 100: '$', 50: '*', 10: '~' },
    sessionStuff = { name: '', online: '', role: '' },
    online = [];

  // all environments
  app.set('port', process.env.PORT || 3000);

  // layout
  app.engine('ejs', ejs);
  app.set('views',__dirname + '/../views');
  app.set('view engine', 'ejs');
  app.use(express.static(path.join(__dirname, '/../public')));

  // express stuff
  app.use(logger('dev'));
  app.use(methodOverride());
  app.use(session({ resave: true,
              saveUninitialized: true,
              secret: 'uwotm8' }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false /*true*/ }));
  app.use(multer());

  // app stuff
  app.use(function(req, res, next){
          
    if(req.session.user || '') {
      sessionStuff.name = req.session.user.name;
      sessionStuff.online = req.session.user.isOnline;
      sessionStuff.role = req.session.user.role;
      sessionStuff.time = Date.now() - (60 * 1000);
      
      online.push(sessionStuff.name);
    } else {
      sessionStuff.online = false;
    }

    res.locals = {
        style: '', 
        script: '', 
        username: sessionStuff.name,
        userstatus: sessionStuff.online,
        userrole: sessionStuff.role,
        usertime: sessionStuff.time,
        roles: roles,
        signs: signs,
        online: online
    };
    
    next();
  });
}