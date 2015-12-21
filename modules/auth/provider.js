var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var UserSchema = require('../../shared/schema').UserSchema;
var User = mongoose.model('User', UserSchema);

var provider = function(){};

var roles = { admins: 100, contribs: 50, users: 10 };

// Find all
provider.prototype.findAll = function(next) {
    User.find({}, function(err, users) {
        next(null, users);
    });
};

// Find one by name
provider.prototype.findByName = function(name, next) {

    User.find({ username: name }, function(err, user) {
        if(!err){
            next(null, user[0]);
        }
    });
};

// Find on by ID
provider.prototype.findById = function(id, next) {
    User.findById(id, function(err, users) {
        if(!err){
            next(null, users);
        }
    });
};

// Create
provider.prototype.save = function(params, next) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(params['password'], salt, function(err, hash) {   
            var role = roles[params['role']] || roles['users'];
            
            if(params['isNew']) role = roles['admins'];
            
            var user = new User({ 
                username: params['username'], 
                hash: hash, 
                email: params['email'], 
                dateCreated: new Date(), 
                isOnline: false, 
                lastLogin: new Date(), 
                role: role
            });
            
            user.save(function (err) {
                (!err) ? next() : next(err);
            });
         });   
    });
};

provider.prototype.update = function(params, next){
    var query = { username: params.username };
    var options = { };
    
    this.findByName(params.username, function(err, user) {
        bcrypt.genSalt(10, function(err, salt) {
            
            if(params.password){
                bcrypt.hash(params.password, salt, function(err, hash) {
                    User.update(query, { hash: hash, email: params.email, role: roles[params.role] }, options, function(err){ next(err); });
                })
            } else {
                User.update(query, { email: params.email, role: roles[params.role] }, options, function(err){ next(err); });
            } 
        })
    });
}

// Remove
provider.prototype.remove = function(id, next) {
    var user = User.findById(id, function(err, users) {
        if(!err){
            user.remove(function(err) {
                next();
            });
        }
    });
};


// Update
provider.prototype.registerLogin = function(id, callback) {
    User.findOne({ _id: id }, function (err, user){
        if(user){
            user.lastLogin = new Date();
            user.save(function (err) {
                callback(user);
            })
        } else 
            callback(err);
    });
};

exports.provider = provider;
