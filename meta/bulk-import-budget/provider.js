var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var funcs = require('../../shared/funcs');
var ElementSchema = require('../../shared/schema').ElementSchema;
var BudzetskiKorisnikSchema = require('../../shared/schema').BudzetskiKorisnikSchema;
var RashodiPoKorisnikuSchema = require('../../shared/schema').RashodiPoKorisnikuSchema;
var BudzetSchema = require('../../shared/schema').BudzetSchema;

var provider = function(){ };
var start;
var delta;

var budzet, budzetskiKorisnik, rashodiPoKorisniku;
var elements = { prihodi: '', rashodiTotal: '', rashodiPoKorisniku: '', rashodiOstalo: '', rashodiBudzeta: '' };
var elementsArrayModel = [ { brojKonta : '', opis : '', vrijednost : '' } ];
var updateModel = [ { genericId: '', proposed: '', value: '' } ];
var kontniplan;

/// unos u bazu budžeta
/// @param {Array} [params] json string
provider.prototype.importBudget = function(params, kp, callback){
    
    start = new Date().getTime();
    delta = 0;
    
    var Budzet = mongoose.model('Budzet', BudzetSchema);
    
    // Kontni plan koji ce se koristiti
    (kp == 'stari')? kontniplan = 'kontniplan-stari' : kontniplan = 'kontniplan';
    
    // Model budžeta je opisan u ../../shared/schema.js
    budzet = new Budzet({
            godina      : new Date(params.godina)
        });
    
    // Prvo unosimo jednostavne nizove (prihodi, ukupni rashodi i ostalo)
    // compareArrays(a, b, prop) vraća bulovu vrijednost i ako je istinit
    // funkcija next(msg, element) će započeti unos
    for(var element in elements){
        elements[element] = params[element];
        if(element != 'rashodiBudzeta' && funcs.compareArrays(params[element], elementsArrayModel, 'brojKonta'))
            next(null, element, callback);
    }
}

provider.prototype.updateElement = function(element, kp, callback){

    start = new Date().getTime();
    delta = 0;
    kontniplan = kp;
    
    var Budzet = mongoose.model('Budzet', BudzetSchema);
    
    budzet = new Budzet({
            godina      : new Date(element.godina)
        });
    
    for(var elem in elements){
        if(element[elem] !== undefined){
            elements[elem] = element[elem];
            if(funcs.compareArrays(element[elem], updateModel, 'genericId'))
                next(null, elem, callback, true);
        }
    }
}

function next(msg, element, callback, update) {
    var current = elements[element];
    
    if(msg != 'error'){
        var current = elements[element];
        
        (msg || '') ? ( console.log('! ' + msg), param = current.shift() ): null;
      
        param = current.shift();
        
        if(param || ''){
            process.stdout.write('Ubacujem ' + param.brojKonta + '\r');
            
            var genericId = param.genericId || param.brojKonta.replace(/0*$/, '');
            var proposed = param.proposed || param.opis;
            var value = param.value || param.vrijednost;
            
            findElement(genericId, proposed, value, element, next, callback, update);
        } else {
            delta = new Date().getTime() - start;
            if(!update)
                console.log('Zavšeno unos "' + element + '" za ' + delta + ' milisekundi.');
            else
                callback('Zavšeno unos "' + element + '" za ' + delta + ' milisekundi.');
                
            switch(element){
                case('rashodiTotal'):
                    complex(null, 'rashodiPoKorisniku', callback);
                break;
                case('rashodiBudzeta'):
                    rashodiPoKorisniku.budzetskiKorisnik.push(budzetskiKorisnik);
                    budzet['rashodiPoKorisniku'].push(rashodiPoKorisniku);
                    budzet.save();
                    complex(null, 'rashodiPoKorisniku', callback);
                break;
            }
           
        }
    } else {
        callback(msg) }

}

function complex(msg, element, callback) {
    if(element == 'rashodiPoKorisniku'){
        var RashodiPoKorisniku = mongoose.model('RashodiPoKorisniku', RashodiPoKorisnikuSchema);
        var BudzetskiKorisnik = mongoose.model('BudzetskiKorisnik', BudzetskiKorisnikSchema);
        var current = elements[element];
        
        (msg || '') ? ( console.log('! ' + msg), param = current.shift() ): null;
        
        param = current.shift();
        
         if(param || ''){
                process.stdout.write('\n\tUbacujem ' + param.korisnik.nazivPotrosackeJedinice  + '\r');
                
                budzetskiKorisnik = new BudzetskiKorisnik({
                        brojMinistarstva            : param.korisnik.brojMinistarstva,
                        brojBudzetskeOrganizacije   : param.korisnik.brojBudzetskeOrganizacije,
                        brojPotrosackeJedinice      : param.korisnik.brojPotrsackeJedinice,
                        nazivPotrosackeJedinice     : param.korisnik.nazivPotrosackeJedinice
                    });
                    
                rashodiPoKorisniku = new RashodiPoKorisniku({});
                
                elements.rashodiBudzeta = param.rashodiBudzeta;
               
                next(null, 'rashodiBudzeta', callback);
            } else {
                delta = new Date().getTime() - start;
                callback('Zavšeno unos "' + element + '" za ' + delta + ' milisekundi.(COMPLEX)');
                }
     } 
}

function findElement(genericId, proposed, value, element, next, callback, update){
    var Element = mongoose.model(kontniplan, ElementSchema);
    
    var level = (genericId + '').length - 1;
    var genericIdDcr = (genericId + '').substring(0,level);

    if(level == 0){
        Element.findOne({ genericId: genericId }, function(err, doc) { 
            if (err) throw err;         
            if (doc) {
                var child = new Element({
                    genericId       : genericId,
                    name            : doc.name,
                    proposed        : proposed,
                    dateCreated     : new Date(),
                    value           : value
                });
                
                if(update){
                    doc.proposed = proposed;
                    doc.value = value;
                    doc.save();
                    next(null, element, callback,true); 
                } else {
                    if(element == 'rashodiBudzeta'){
                        rashodiPoKorisniku.rashodiBudzeta.push(child);
                    } else {
                        budzet[element].push(child);
                        budzet.save();
                    }
                    next(null, element, callback); 
                }
                
            }
        });
    } else {
        var query = {};
        var childStr = 'children.';
        var i = 0;
        
        // build query
        query[funcs.strRepeat(childStr, level-1) + 'genericId'] = (genericId + '').substring(0, level);

        Element.findOne(query).exec( function(err, doc) {
            var i = 0;
            var j = 0;
            var k = 2;
            var root = doc;

            if(doc){
                while(i == 0){
                    var doclen = (doc.genericId + '').length;
                    
                    if(doclen == level && genericIdDcr == doc.genericId){
                        var index = funcs.indexOfgenericId(doc.children, genericId, -1);
                        
                        if(index || ''){
                            var child = new Element({
                                genericId       : genericId,
                                name            : doc.children.id(index).name,
                                proposed        : proposed,
                                dateCreated     : new Date(),
                                value           : value
                            });
                            
                            if(update){
                                doc.children.id(index).proposed = proposed;
                                doc.children.id(index).value = value;
                                doc.children.id(index).save();
                                console.log(doc.children.id(index));
                                next(null, element, callback, true);
                            } else {
                                if(element == 'rashodiBudzeta'){
                                    rashodiPoKorisniku.rashodiBudzeta.push(child);
                                } else {
                                    
                                    budzet[element].push(child);
                                    budzet.save();
                                }
                                next(null, element, callback);
                            }
                            
                            i = 1; 
                         } // todo: vrati error za nedostajuci kontni broj
                         
                    }
                    else {
                        genericIdDcr = (genericId + '').substring(0,k); k++; 
                        var index = funcs.indexOfgenericId(doc.children, genericIdDcr, j);
                        (j >= doc.children.length)? j = 0: j++;
                        (index || '')? (doc = doc.children.id(index), j++): j=0;
                    }
                }
            } else {
                // u slucaju budzetskih rezervi
                if(genericId == '999999'){
                    var child = new Element({
                        genericId       : genericId,
                        name            : 'Budzetske rezerve',
                        proposed        : proposed,
                        dateCreated     : new Date(),
                        value           : value
                    });
                    
                    if(element == 'rashodiBudzeta'){
                        rashodiPoKorisniku.rashodiBudzeta.push(child);
                    } else {
                        budzet[element].push(child);
                        budzet.save();
                    }
                    
                    next(null, element, callback);
                } else {
                    next('error', element, callback); 
                }
            }
    });
   }  
}


exports.provider = provider;
