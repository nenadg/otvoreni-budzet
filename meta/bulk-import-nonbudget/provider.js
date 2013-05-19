var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var funcs = require('../../shared/funcs');
var ElementSchema = require('../../shared/schema').ElementSchema;

var provider = function(){ };
var model, start, delta;

/// unos kontnog plana
/// @params {Array} [params] json string
/// @kp {String} ime kolekcije u koju ce se snimati
/// @callback callback
provider.prototype.importKontniPlan = function(params, collection, callback){
    model = collection;
    start = new Date().getTime();
    delta = 0;
    
    next('Starting...', callback);
    //save(params[0], next);
}

function next(msg, callback) {

    param = params.shift();
    (msg || '') ? console.log('! ' + msg) : null;
    if(param || ''){
        save(param, next, callback);
        process.stdout.write('Ubacujem ' + param.brojKonta + '\r');
    } else {
        delta = new Date().getTime() - start;
        callback('Zavšeno za ' + delta + ' milisekundi.');
    }
}

function save(param, next, callback){
        var Element = mongoose.model(model, ElementSchema);
        
        var data = param['brojKonta'];
        var naziv = param['naziv'];
             
        var level = (data + '').length - 1;
        var dataDcr = (data + '').substring(0,level);
        
        if(level == 0){
            var root = new Element({
                    genericId       : data,
                    name            : naziv,
                    dateCreated     : new Date()
                });

            root.schema.add({  
                children        : [ElementSchema]
            });
            

            Element.findOne({ genericId: data }, function(err, doc) { 
                if (err) throw err;         
                if (!doc) root.save(function (err) { (!err) ? next(null, callback) : console.log(err) });
                else { next('already-in: ' + data, callback) }
            });
        } else {
            var query = {};
            var childStr = 'children.';
            var i = 0;
            
            // build query
            query[funcs.strRepeat(childStr, level-1) + 'genericId'] = (data + '').substring(0, level);
            
            var child = new Element({
                    genericId       : data,
                    name            : naziv,
                    dateCreated     : new Date()
                        });

            child.schema.add({  
                children        : [ElementSchema]
            });

            Element.findOne(query).exec( function(err, doc) {
                var i = 0;
                var j = 0;
                var k = 2;
                var root = doc;

                if(doc){
                    while(i == 0){
                        var doclen = (doc.genericId + '').length;
                        
                        if(doclen == level && dataDcr == doc.genericId){
                            var index = funcs.indexOfgenericId(doc.children, data, -1);
                            if(index || ''){
                                // already in nothing to do
                                next('already-in: ' + data, callback);
                                i = 1; 
                             } else {
                                doc.children.isNew;
                                doc.children.push(child);
                                root.save(function(err){(!err)? next(null, callback) : console.log(err) });
                                i = 1;
                            }
                        }
                        else {
                            dataDcr = (data + '').substring(0,k); k++; 
                            var index = funcs.indexOfgenericId(doc.children, dataDcr, j);
                            (j >= doc.children.length)? j = 0: j++;
                            (index || '')? (doc = doc.children.id(index), j++): j=0;
                        }
                    }
                } else { next('missing-root-element: ' + data, callback); }
           
        });
   }  
}

exports.provider = provider;
