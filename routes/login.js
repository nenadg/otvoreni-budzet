var auth = require('../modules/auth/module');
var provider = require('../modules/auth/provider').provider;
var provider = new provider();
var authenticate = auth.authenticate;
var referer = auth.referer;
var backURL;

exports.login = function(req, res, next){
    switch(req.method){
        case('GET'):
            backURL = referer(req);
            provider.findAll(function(err, users){
                (users.length == 0) ? 
                res.render('auth/register', { title: 'Registruj se', isNew: true }) 
                : res.render('auth/login', { title: 'Uloguj se' });
            }); 
            break;
        case('POST'): 
            authenticate(req, res, function(err, user) { 
               
               
                if(user){
                    // stupid express and redirecting ...
                    // http://stackoverflow.com/questions/8240447/express-js-cant-redirect
                   
                    //req.method = 'GET'; 
                   
                    res.redirect('/')
                    
                } 
                else {
                    
                   res.redirect('/login')
                }

            });
            break;
    }
   
    
}

exports.logout = function(req, res){
  // linija ispod otvara novu sesiju u redisu, sto mi hosting ne dozvoljava za 0$
  // redisdb.zrem('online', req.session.user.name);
  provider.registerLogin(req.session.user._id, function(err){    
    req.session.destroy(function(){
        
        res.redirect('/');
    });
  });
}

