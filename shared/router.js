var home = require('../routes/index');
var users = require('../routes/users');
var data = require('../routes/data');
var authenticate = require('../routes/login');
var restrict = require('../modules/auth/module').restrict;
var serviceRestrict = require('../modules/auth/module').serviceRestrict;
var urlencodedParser = global.bodyParser.urlencoded({ extended: false });
var jsonParser =  global.bodyParser.json()

module.exports = function(app) {
    app.get('*', function(res, req, next){
        
        next(); // http://expressjs.com/guide.html#passing-route control
    });

    app.use(function (req, res, next) {
        res.header('X-XSS-Protection' ,  '1; mode=block');
        res.header('X-Powered-By', '100Maraka');
        next();
    });
    
    app.get('/', home.index);
    app.get('/login', jsonParser, authenticate.login);
    app.post('/login', urlencodedParser, authenticate.login);
    app.get('/logout', authenticate.logout);
    app.get('/users',  jsonParser, restrict, users.list);
    
    app.get('/users/create', restrict, users.create);
    app.post('/users/create', restrict, users.create);
    app.get('/users/remove/:id', restrict, users.remove);
    app.post('/users/register', urlencodedParser, users.register);
    app.get('/users/update/:name', restrict, users.user);
    app.post('/users/update/', restrict, users.user);
    
    app.get('/data/update', restrict, data.update);
    
    app.post('/data/action/update', serviceRestrict, data.postupdate);
    app.get('/data/action/remove/:what', serviceRestrict, data.remove);
    
    app.get('/data/objs/json/:year', data.json);
    app.get('/data/objs/counters/:id', serviceRestrict, data.counters);
    app.get('/data/objs/models/:id', serviceRestrict, data.models);
    app.get('/data/objs/years', data.years);
    app.get('/data/objs/all', data.compare);
    
    
    app.get('/data/setup', restrict, data.setup);
    app.post('/data/build/budget', restrict, data.bulkImportBudget);
    app.post('/data/build/kp', restrict, data.bulkImportNonBudget);
    app.post('/data/exporters', data.exporters);
}
