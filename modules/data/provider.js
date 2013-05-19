var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var ElementSchema = require('../../shared/schema').ElementSchema;
var BudzetSchema = require('../../shared/schema').BudzetSchema;
var Element = mongoose.model('Element', ElementSchema);
var Budzet = mongoose.model('Budzet', BudzetSchema);
var kp = mongoose.model('kontniplan', ElementSchema);

var provider = function(){};

// Find all
provider.prototype.findAll = function(year, callback) { 
    
    var dontshow = {
        '_id':0, '__v':0,
        'prihodi._id': 0, 'prihodi.dateCreated': 0, 'prihodi.children':0,
        'rashodiOstalo._id': 0, 'rashodiOstalo.dateCreated': 0, 'rashodiOstalo.children':0,
        'rashodiOstalo._id': 0, 'rashodiOstalo.dateCreated': 0, 'rashodiOstalo.children':0,
        'rashodiPoKorisniku._id': 0, 
        'rashodiPoKorisniku.rashodiBudzeta._id': 0,'rashodiPoKorisniku.rashodiBudzeta.dateCreated': 0,
        'rashodiPoKorisniku.rashodiBudzeta.children':0,
        'rashodiPoKorisniku.budzetskiKorisnik._id':0,
        'rashodiTotal._id': 0, 'rashodiTotal.dateCreated': 0, 'rashodiTotal.children':0
    }
    
    Budzet.find({ godina: { $gte : new Date(year, 0, 0), $lt : new Date(year, 1, 1)  } }, dontshow).exec(function(err, elements) {
        callback(null, elements);
    });
};

provider.prototype.all = function(next){
    var dontshow = {
        '_id':0, '__v':0,
        'prihodi._id': 0, 'prihodi.dateCreated': 0, 'prihodi.children':0,
        'rashodiOstalo._id': 0, 'rashodiOstalo.dateCreated': 0, 'rashodiOstalo.children':0,
        'rashodiOstalo._id': 0, 'rashodiOstalo.dateCreated': 0, 'rashodiOstalo.children':0,
        'rashodiPoKorisniku._id': 0, 
        'rashodiPoKorisniku.rashodiBudzeta._id': 0,'rashodiPoKorisniku.rashodiBudzeta.dateCreated': 0,
        'rashodiPoKorisniku.rashodiBudzeta.children':0,
        'rashodiPoKorisniku.budzetskiKorisnik._id':0,
        'rashodiTotal._id': 0, 'rashodiTotal.dateCreated': 0, 'rashodiTotal.children':0
    }
    
    var years = [], rashodiTotal = [], rashodiOstalo = [], prihodi = [], rashodiPoKorisniku = [];   
    var obj = { years : [], rashodiTotal : [], rashodiOstalo : [], prihodi : [], rashodiPoKorisniku : [] };
    var bo = { rashodiBudzeta : [], budzetskiKorisnik : [] };
    var xo = { rashodiBudzeta : [], budzetskiKorisnik : [] };
    
    var sindex = 0;
    var tmpkorisnik = [];
    var npj = '';
    
    Budzet.find({}, dontshow).sort('-godina').exec(function(err, elements) {
        if(!err){
            elements.forEach(function(e){
               
                obj.years.push(new Date(e.godina).getFullYear());
                rashodiTotal.push(e.rashodiTotal);
                rashodiOstalo.push(e.rashodiOstalo);
                prihodi.push(e.prihodi);
                rashodiPoKorisniku.push(e.rashodiPoKorisniku);
                
            });
            
            // prvo smjestim nazive u zaseban niz, posto su jedino oni unikatni
            var ins = [];
            rashodiPoKorisniku.forEach(function(r,i){
                r.forEach(function(rr, ia){
                    ins.push(rr.budzetskiKorisnik[0].nazivPotrosackeJedinice);
                });
            });
            
            // izbacujem duplikate da bih dobio jedinstvenu listu potrosaca u svim godinama
            var theAllTogether = ins.filter(function(elem, pos, self) {
                return self.indexOf(elem) == pos;
            });
            
            // rashodi se ponavljaju se onoliko puta koliko ima godina
            rashodiPoKorisniku.forEach(function(r,i){

                // za svaku godinu ..
                r.forEach(function(rr, ia){
                    var x = 0; // zbir
                    var index = 0; // indeks pozicije u zbirnoj listi theAllTogether
                    bo = { rashodiBudzeta : [], budzetskiKorisnik : [] }; // rezervni objekat koji ide u obj
                    
                    // i svaku stavku (rashodiBudzeta) - sumiranje stavki po korisniku
                    rr.rashodiBudzeta.forEach(function(rb, ib){
                        if(rb.genericId.length >= 4)
                            x += rb.value*1; 
                    });
                    
                    // trazim indeks imena u zbirnoj listi
                    index = theAllTogether.indexOf(rr.budzetskiKorisnik[0].nazivPotrosackeJedinice);
                    
                    // ako u objektu ne postoji pod tim indeksom ubaci ime i prvi zbir na tacno 
                    // tu lokaciju
                    if(obj.rashodiPoKorisniku[index] == undefined){
                        
                        bo.rashodiBudzeta.splice(index, 0, { "value": x,
                                        "proposed": obj.years[i],
                                        "name": "Ukupni rashodi " + obj.years[i],
                                        "genericId": "400000" });
                        
                        bo.budzetskiKorisnik = rr.budzetskiKorisnik;
                        
                        obj.rashodiPoKorisniku.push(bo);
                    } else 
                        // u ostalim slucajevima ubacuj zbirove za ostale godine
                        obj.rashodiPoKorisniku[index].rashodiBudzeta.splice(index, 0, { "value": x,
                                        "proposed": obj.years[i],
                                        "name": "Ukupni rashodi " + obj.years[i],
                                        "genericId": "400000" });   
                    
                });
            });
            
            
            rashodiTotal.forEach(function(r, i){
                var x = 0;
                r.forEach(function(rtt){
                    if(rtt.genericId.length >= 4)
                        x += rtt.value*1;
                    
                });
                obj.rashodiTotal[i] = { "value": x,
                        "proposed": "Ukupni rashodi "  + obj.years[i],
                        "name": "Ukupni rashodi "  + obj.years[i],
                        "genericId": "400000" };
            });
            
            rashodiOstalo.forEach(function(r, i){
                var x = 0;
                r.forEach(function(rtt){
                    if(rtt.genericId.length >= 4)
                        x += rtt.value*1;
                    
                });
                obj.rashodiOstalo[i] = { "value": x,
                        "proposed": "Ukupni rashodi (ostalo) "  + obj.years[i],
                        "name": "Ukupni rashodi (ostalo) "  + obj.years[i],
                        "genericId": "400000" };
            });
            
            // sortiraj kako se ne bi zlopatio sa prikazom na grafiku
            obj.rashodiPoKorisniku.forEach(function(d,i){
                d.rashodiBudzeta.sort(function(a,b){ return b.proposed-a.proposed; })
            });
            
            obj.prihodi.push({ sct: prihodi });

            next(null, obj);
        } 
        
    });
}

provider.prototype.kontniplan = function(next){
    kp.find({}, function(err, elements){
        next(null, elements);
    });
}

provider.prototype.models = function(model, next){
    mongoose.connection.db.collection(model, function (err, collection) {
        if(!err){
            collection.find({}).toArray(function(err, results) {
                next(err, results);
            });
        } else
            next('Kolekcija ne postoji', null);
    });
}

provider.prototype.getYears = function(next){
    Budzet.find({}, { godina : 1, '_id': 0 }).exec(function(err, elements) {
        next(null, elements);
    });
}

provider.prototype.ping = function(model, next){
    mongoose.connection.db.collection(model, function (err, collection) {
        if(!err){
            var counter = { cols: 0, docs: 0, years: [] } 
     
            collection.find({}).toArray(function(err, results) {
                if(!err && results.length > 0){
                    results.forEach(function(d){
                        counter.docs++;
                        counter.cols += d.__v;
                        (d.godina || '')? counter.years.push(d.godina): null;
                    });
                    next(err, counter);
                } else
                    next('Kolekcija ne postoji', null);
            });
        } else
            next(err, null);
    });
}

provider.prototype.removeModel = function(model, next){
    mongoose.connection.db.collection(model).drop( function(err){
        if(!err) next('success'); else next('fail');
    });
}

provider.prototype.removeCollection = function(collection, next){
    var dontshow = { godina: 1 } 
    Budzet.find({ godina: { $gte : new Date(collection, 0, 0), $lt : new Date(collection, 1, 1)  } }, dontshow).remove(function(err) {
        if(!err) next('success'); else next('fail');
    });
}

provider.prototype.updateElement = function(elem, next){
    
    var year = elem.godina;
    var section = elem.section;
    
    Budzet.findOne({ godina: { $gte : new Date(year, 0, 0), $lt : new Date(year, 1, 1)  } }).exec(function(err, element){
        
        if(!err && !null) {
            if(section == 'rashodiPoKorisniku'){
                var index = 0;
                var ch = '';
                element.rashodiPoKorisniku.forEach(function(f,i){
                    
                    if(f.budzetskiKorisnik[0].nazivPotrosackeJedinice == elem.rashodiPoKorisniku[0].budzetskiKorisnik[0].nazivPotrosackeJedinice)
                        index = i;
                });
                
                element.rashodiPoKorisniku[index].rashodiBudzeta.forEach(function(f,i){
                    if(f.genericId == elem.rashodiPoKorisniku[0].rashodiBudzeta[0].genericId){
                        f.value = elem.rashodiPoKorisniku[0].rashodiBudzeta[0].value;
                        f.proposed = elem.rashodiPoKorisniku[0].rashodiBudzeta[0].proposed;
                        element.save();
                        ch = f.genericId + ' ' + f.proposed;
                        }
                });
            } else {
                element[section].forEach(function(f,i){
                    if(f.genericId == elem[section][0].genericId){
                        f.value = elem[section][0].value;
                        f.proposed = elem[section][0].proposed;
                        element.save();
                        ch = f.genericId + ' ' + f.proposed;
                    }    
                });
            }
            
            next({ event: 'success', data: ch });
        } else
            next({ event: 'failure' });
        
    })
}

exports.provider = provider;
