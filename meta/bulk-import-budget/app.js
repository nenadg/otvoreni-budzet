// 
var mongoose = require('../../node_modules/mongoose');
var mongourl = require('../../shared/mongourl');
var rest = require('../../shared/rest');
var provider = require('./provider').provider;

var arguments = process.argv.splice(2);
var provider = new provider();

var params; 
var hostname = 'budzet.pej.st';
var db = arguments[0];
var kp = arguments[1]
var year = arguments[2];

(arguments.length < 3 ) ? ( console.log('\nPravilna upotreba: node app <ime-baze> <kontniplan-verzija: stari|novi> <godina>\n'), process.kill()) : null;

mongourl.generate(function(url) { mongoose.connect(url); }, db);

var options = {
    host: hostname,
    port: 80,
    path: '/materijali/get?sta=budzet&godina=' + year,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

rest.getJSON(options, function(statusCode, result){
    params = result.results;
    provider.importBudget(params, kp, function(msg){
        (msg == 'error')? (console.log(msg + '\n'), process.kill()) : console.log(msg);
    }) 
});
