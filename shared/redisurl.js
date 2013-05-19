exports.generate = function(redis, next){
    var env, obj;
    if(process.env.VCAP_SERVICES){
        env = JSON.parse(process.env.VCAP_SERVICES);
        obj = env['redis-2.2'][0]['credentials'];
    } else {
        obj = {
            "hostname":"localhost",
            "port":6379,
            "username":"",
            "password":"",
            "name":"",
            "prefix": 'ob-sess'
        }
    }

    obj.host = obj.host || 'localhost';
    obj.port = obj.port || 6379;
    obj.prefix = 'ob-sess:';

    next(redis.createClient(obj.port, obj.host, obj)); //obj.port || obj.socket
};
