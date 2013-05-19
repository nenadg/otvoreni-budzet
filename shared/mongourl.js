// This code will generate url for both local mongodb an remote
// in this case - code provided applies for AppFog 

exports.generate = function(callback, collection){
    
    if(process.env.VCAP_SERVICES){
        var env = JSON.parse(process.env.VCAP_SERVICES);
        var obj = env['mongodb-1.8'][0]['credentials'];
    } else {
        var obj = {
            "hostname":"localhost",
            "port":27017,
            "username":"",
            "password":"",
            "name":"",
            "db": collection
        }
    }

    var url;
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'bulk-import-db');
    
    if(obj.username && obj.password){
        url = "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
        callback(url);
    } else {
        url = "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
        callback(url);
    }
};

