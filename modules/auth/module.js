// auth module
var bcrypt = require('bcrypt');
var provider = require('./provider').provider;
var provider = new provider();

exports.authenticate = function(req, res, next) {
    
    provider.findByName(req.body.username, function(error, user) {
        if(error) { return next('auth-failed') }
        
        if(user){
            bcrypt.compare(req.body.password, user.hash, function(err, result) {
                if(result){
                    provider.registerLogin(user._id, function(user) {
                        if(user){
                            req.session.user = {
                                 _id      : user._id,
                                 name     : user.username,
                                 isOnline : (user != undefined),
                                 lastLogin: user.lastLogin,
                                 success  : 'Authenticated as ' + user.username,
                                 role     : user.role
                            }

                            //if (req.body.rememberme == 'on')
                                // posalji neki cookie
                            
                            // colored session? wtf   
                            // req.session.secret = '#' + Math.floor(Math.random()*16777215).toString(16); // colored session secret
                            // req.session.cookie.maxAge = new Date(Date.now() + 3600000);
                            return next(null, user);    
                        } else {
                             return next('auth-failed') }
                    });
                } else {
                    return next('auth-failed') }
             });
        } else {
            return next('auth-failed');
        }
    });
}

exports.restrict = function(req, res, next) {
    // ovo je idiotski odradjeno, ali nisam imao vremena da se sa tim zezam sada
    // todo: implementirati logiku za ogranicenje pristupa kroz bazu
    if (req.session.user) {
        var limited = { '/data/setup': (req.session.user.role == 100)? true: false,
                        '/users': (req.session.user.role == 100)? true: false,
                        '/users/create': (req.session.user.role == 100)? true: false,
                        '/users/remove/:id': (req.session.user.role == 100)? true: false,
                        '/users/update/:name': (req.session.user.role == 100)? true: false,
                        '/data/build/budget': (req.session.user.role == 100)? true: false,
                        '/data/build/kp': (req.session.user.role == 100)? true: false,
                        '/data/update': (req.session.user.role >= 50)? true: false }
                    
    
        if(limited[req.route.path])
            next();
    
    } else {
        req.session.error = 'Access denied!';
        req.session.referer = req.url;
        res.redirect('/login');
    }
}

exports.serviceRestrict = function(req, res, next){
    if(req.session.user || req.cookies.rogn)
        next();
    else
        res.send(401, 'Unauthorized'); // <-- jako zanimljivo
}

exports.referer = function(req){
    var ret = (req.session.referer != undefined)? req.session.referer : "/";
    return ret;
}

