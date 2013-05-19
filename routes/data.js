var rest = require('../shared/rest');
var budzetProvider = require('../meta/bulk-import-budget/provider').provider;
var kpProvider = require('../meta/bulk-import-nonbudget/provider').provider;
var dataProvider = require('../modules/data/provider').provider;
var budzetProvider = new budzetProvider();
var kpProvider = new kpProvider();
var dataProvider = new dataProvider();
var mongoose = require('mongoose');
var io = require('../app');
var socket = io.sockets.on('connection', function (s) { return s; });
var day = 86400;
/*
// da natjeram xhr-polling umjesto uobicajenog metoda
// medjutim, posto socket.io ima default fallback, ovo ne treba
// * neka stoji ovde u komentu
(process.env.VCAP_APP_PORT || '')?
    io.configure('development', function(){
      io.set('transports', ['xhr-polling']);
    }) : null;
*/
exports.update = function(req, res){
    var hostname = ( req.headers.host.match(/:/g) ) ? req.headers.host.slice( 0, req.headers.host.indexOf(":") ) : req.headers.host;
    
    var styles = '<link href="/css/sumo.css" rel="stylesheet" type="text/css" media="screen"/>';
    var scripts = '<script src="http://' + hostname + ((process.env.VCAP_APP_PORT || '')? '': ':3000') + '/socket.io/socket.io.js"></script>\
                  \n\t<script src="/js/oplib.js"></script>\n\
                  \n\t<script src="/js/renderers.js"></script>\
                  \n\t<script src="/js/update.js"></script>';
                  
    res.render('data/update', { 
            title: 'Podešavanja',
            style: styles, 
            script: scripts }); 
}

exports.postupdate = function(req, res){
    var params = req.body;

    dataProvider.updateElement(params, function(msg){
            if(msg.event == 'success')
                socket.emit('message', { event: msg.data });
            else
                socket.emit('message', { event: 'Neuspješno' });
            });

   res.jsonp(200, { event: 'Pretraga elementa...', sender: null })
}

exports.setup = function(req, res){
    var hostname = ( req.headers.host.match(/:/g) ) ? req.headers.host.slice( 0, req.headers.host.indexOf(":") ) : req.headers.host;
    
    var styles = '<link href="/css/sumo.css" rel="stylesheet" type="text/css" media="screen"/>'; //+ ':' + (process.env.VCAP_APP_PORT || '3000') 
    var scripts = '<script src="http://' + hostname + ((process.env.VCAP_APP_PORT || '')? '': ':3000') + '/socket.io/socket.io.js"></script>\
                  \n\t<script src="/js/renderers.js"></script>\
                  \n\t<script src="/js/settings.js"></script>';
    
    res.render('data/setup', { 
            title: 'Podešavanja',
            style: styles, 
            script: scripts }); 
}

// unos novih podataka
exports.bulkImportBudget = function(req, res){
    
    var kp;
    year = +req.param('date');
    
    (year > 2010)? kp = 'novi' : kp = 'stari';

    var options = {
        host: 'budzet.pej.st',
        port: 80,
        path: '/materijali/get?sta=budzet&godina=' + year,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    rest.getJSON(options, function(statusCode, result){
        params = result.results;
        
        if(params.error || params.missing){
            var error = { event: params.error || params.missing} 
            res.jsonp(500, error );
        }
        else {
            budzetProvider.importBudget(params, kp, function(msg){
                socket.emit('message', { event: msg });
            })

            res.jsonp(200, { event: 'Unos je pokrenut...', sender: 'budzets' })
        }
    });
}

exports.bulkImportNonBudget = function(req, res){

    var kp = req.param('kp');
    kp = kp.substr(0, kp.length -1);
    
    var options = {
        host: 'budzet.pej.st',
        port: 80,
        path: '/materijali/get?sta=' + kp,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    rest.getJSON(options, function(statusCode, result){
        params = result.results;
        
        if(params == {}){
            var error = { event: '!Problem sa servisom', sender: req.param('kp') } 
            res.jsonp(500, error );
        }
        else {
            kpProvider.importKontniPlan(params, kp, function(msg){
                socket.emit('message', { event: msg, sender: req.param('kp') });
            }) 
            
            res.jsonp(200, { event: 'Unos je pokrenut...' })
        }
    });
}

// poredjenje
exports.compare = function(req, res){
    
    dataProvider.all(function(err, elements){
        if(!err){
        
            if (!res.getHeader('Cache-Control')) 
                res.setHeader('Cache-Control', 'public, max-age=' + day); // vrati na day
                
            res.type('application/json');
            res.jsonp({ elements: elements })
        } else
            res.jsonp(500, err);
    });
}

// servisi iz jednogodisnjeg budzeta
exports.json = function(req, res){
    var year = req.param('year');
    
    dataProvider.findAll(year, function(err, elements){
        if(!err){
            
            if (!res.getHeader('Cache-Control')) 
                res.setHeader('Cache-Control', 'public, max-age=' + day); // vrati na day
        
            res.type('application/json');
            res.jsonp({ elements: elements[0] })
        } else
            res.jsonp(500, err);
    });
}

// brojaci
exports.counters = function(req, res){
    dataProvider.ping(req.param('id'), function(err, elements){
        if(!err){
            res.type('application/json');
            res.jsonp({ elements: elements })
        } else 
            res.jsonp(500, err);        
    })
}

// modeli
exports.models = function(req, res){
    dataProvider.models(req.param('id'), function(err, elements){
        if(!err){
            res.type('application/json');
            res.jsonp(elements)
        } else 
            res.jsonp(500, err);        
    })
}

// godine
exports.years = function(req, res){
    dataProvider.getYears(function(err, elements){
        if(!err){
            elements.sort(function(a, b){ return b.godina - a.godina; });
            
            // neka ucitava svaki put years zbog buducih unosa
            //if (!res.getHeader('Cache-Control')) 
                //res.setHeader('Cache-Control', 'public, max-age=' + day);
                
            res.type('application/json');
            res.jsonp({ elements: elements })
        } else 
            res.jsonp(500, err);    
    });
}

// eksport podataka
exports.exporters = function(req, res){
   
    var sender = req.body.sender;
    var obj = req.body.data;
    var ext;
    
    if(sender == 'export-svg')
        ext = '.svg';
    else {
        ext = '.json';
        
        obj = req.body.data;
        }
    var red = obj.substr(0,1).substr(sender.length, sender.length -1);
    var rand = Math.floor(Math.random()*11425);
    res.attachment(sender + '-' + rand + ext);
    
    res.send(200, obj);
}

// brisanje ...
exports.remove = function(req, res){
    var sender = req.param('what');
    if( sender == 'kontniplans' || sender == 'kontniplan-staris'){
        dataProvider.removeModel(sender, function(msg){
            if(msg == 'success'){
                res.type('application/json');
                res.jsonp({ event: 'Model ' + sender + ' izbrisan.', sender: sender })
            } else {
                res.type('application/json');
                res.jsonp(500, { event: 'Brisanje ' + sender + ' nije uspjelo.', sender: sender }); 
            }
        });
    } else {
        dataProvider.removeCollection(sender, function(msg){
            if(msg == 'success'){
                res.type('application/json');
                res.jsonp({ event: 'Kolekcija ' + sender + ' izbrisana.', sender: sender })
            } else {
                res.type('application/json');
                res.jsonp(500, { event: 'Brisanje ' + sender + ' nije uspjelo.', sender: sender }); 
            }
        });
    }  
}

