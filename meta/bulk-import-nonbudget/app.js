var mongoose = require('../../node_modules/mongoose');
var mongourl = require('../../shared/mongourl');
var rest = require('../../shared/rest');
var provider = require('./provider').provider;
var funcs = require('../../shared/funcs');
var arguments = process.argv.splice(2);
var provider = new provider();

var hostname = 'budzet.pej.st';
var db = arguments[0];
var kp = arguments[1];

(arguments.length < 2 ) ? ( console.log('\nPravilna upotreba: node app <ime-baze> <kontniplan-stari|kontniplan> \n'), process.kill()) : null;

mongourl.generate(function(url) { mongoose.connect(url); }, db);

var options = {
    host: hostname,
    port: 80,
    path: '/materijali/get?sta=' + kp,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

rest.getJSON(options, function(statusCode, result){
    params = result.results;
    provider.importKontniPlan(params, kp, function(msg){
        (msg == 'error')? (console.log(msg + '\n'), process.kill()) : console.log(msg);
    }) 
});
