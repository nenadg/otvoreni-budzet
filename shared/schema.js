var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
/*
 * Kontni Plan i Analiticka klasifikacija vladinih funkcija
 */

// Shema elementa
var ElementSchema = new Schema({ 
            genericId       : { type: String },
            name            : { type: String },
            proposed        : { type: String },
            dateCreated     : { type: Date },
            value           : { type: String }
        });

ElementSchema.add({
            children        : [ElementSchema]
        });

/*
 * Korisnici sistema
 */

var UserSchema = new Schema({   
            username        : { type: String, unique: true },
            hash            : { type: String },
            email           : { type: String, unique: true },
            dateCreated     : { type: Date },
            lastLogin       : { type: Date },
            role            : { type: Number }
        });

/*
 * Budzetski korisnik
 */

var BudzetskiKorisnikSchema = new Schema({
            brojMinistarstva            : { type: String },
            brojBudzetskeOrganizacije   : { type: String },
            brojPotrosackeJedinice      : { type: String },
            nazivPotrosackeJedinice     : { type: String }
        });

/*
 * Rashodi po korisniku
 */

var RashodiPoKorisnikuSchema = new Schema({
            budzetskiKorisnik           : [BudzetskiKorisnikSchema],
            rashodiBudzeta              : [ElementSchema]
        });

/*
 * Budzet
 */

var BudzetSchema = new Schema({
            godina                          : { type: Date },
            prihodi                         : [ElementSchema],
            rashodiTotal                    : [ElementSchema],
            rashodiPoKorisniku              : [RashodiPoKorisnikuSchema],
            rashodiOstalo                   : [ElementSchema]
        });

exports.ElementSchema = ElementSchema;
exports.UserSchema = UserSchema;
exports.BudzetskiKorisnikSchema = BudzetskiKorisnikSchema;
exports.RashodiPoKorisnikuSchema = RashodiPoKorisnikuSchema;
exports.BudzetSchema = BudzetSchema;

