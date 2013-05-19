// oplib

// applyActions - cisto dodjeljivanje akcija UI elementima
// @param {Object} [sender] objekat koji poziva funkciju (*bice izbaceno u sljedecoj verziji)
function applyActions(sender){
    
    sender = sender || graph;
    
    $(this).resize(function(){ sender.resize(50, $(window).height() - 80); sender.step(process.load(serviceData, dataIndex, section)) });
    $(this).bind('orientationchange', function(){ sender.resize(50, $(window).height() - 80); sender.step(process.load(serviceData, dataIndex, section)) });
     
    $(".dropdown-menu#budget-elements li a").click(function() {
        sender.step(process.load(serviceData, dataIndex, this.id));
    });

    $(".korisnici-all").click(function(event) {
        var $input = $(".korisnici-search");
            $(".korisnici-search").focus();
            $input.val('*');
            $input.typeahead('lookup');
            $input.val('');
    });
    
    $("#sljedeci").click(function() {
        if(dataIndex < serviceData.elements[section].length -1  || dataIndex == 0 ){
            dataIndex++;
            sender.step(process.load(serviceData, dataIndex, section));
        }
        
    });
    
    $("#prethodni").click(function() {
        if(dataIndex > 0){
            dataIndex--;
            sender.step(process.load(serviceData, dataIndex, section));
        }
    });
    
    $(".exports").click(function(){
        var rt;
        var b = $(this);
        var sender = this.id;
        b.button('loading');
        
        (sender == 'export-svg')? rt = $('#data-view').html() : rt = JSON.stringify(expd);
        
        var k = rt.replace(/\\u([0-9A-F]{4})/ig, function (s, n) { return String.fromCharCode(parseInt(n, 16)); }, 'i');
        var inputs = "<input type='hidden' name='data' value='" + k + "' /><input type='hidden' name='sender' value='" + sender + "' />";
       
        $('<form action="/data/exporters" method="post" enctype="multipart/form-data">' + inputs + '</form>').appendTo('body').submit().remove();
        
        // cisto da zaustavim mahnito klikanje
        setTimeout(function() {
              b.button('reset');
        }, 2000);

    });
    
    $('#graph-compare').click(function(){

        if($(this).hasClass('active')){
            
            $("#datalove").fadeTo(150, 0.3, function(){
                    
                    $("#data-view").addClass("loader");
                    
                    d3.json("/data/objs/json/" + years[0], function(error, current) {
                        serviceData = current;
                        
                        if(!error) { 
                            $("#description").show();
                            
                            $("#godina").text(years[0]); 
                            sender.step(process.load(serviceData, dataIndex, section, true));
                            
                            $(".dd-year").text(years[0]);
                            
                            $(".years.btn.dropdown-toggle.btn-small.btn-inverse").removeClass('disabled'); 
                            if(section == "rashodiPoKorisniku") populateSubMenu(serviceData.elements[section], sender);
                            
                            $("rect.link").remove();
                            
                            $("#datalove").fadeTo(150, 1, function(){
                                $("#data-view").removeClass("loader");
                            }); 
                            
                        } else fail();
                        
                        
                    });
                });
         
        } else {
            $("#datalove").fadeTo(150, 0.3, function(){
                    
                    $("#data-view").addClass("loader");
                    
                    d3.json("/data/objs/all/", function(error, current) {
                        if(!error){
                            $("#description").hide();
                            
                            serviceData = current;
                            sender.step(process.load(serviceData, dataIndex, section, true));
                            
                            $(".dd-year").text('Sve');
                            
                            $(".years.btn.dropdown-toggle.btn-small.btn-inverse").addClass('disabled');
                            if(section == "rashodiPoKorisniku") populateSubMenu(serviceData.elements[section], sender);
                            
                            $("#datalove").fadeTo(150, 1, function(){
                                $("#data-view").removeClass("loader");
                            });
                            
                            
                        } else fail();
                    });
                    
                });
        }
    }); 

}

// popunjava pseudo-padajuci meni nazivima budzetskih potrosaca
// i omogucava direktnu pretragu kucanjem u polje za unos
// @param {array} [data] budzet odabrane godine
function populateSubMenu(data){
    korisnici = [];
    
    data.forEach(function(d, i) {
        korisnici[i] = data[i].budzetskiKorisnik[0].nazivPotrosackeJedinice;
    });
    
    $(".korisnici-search").typeahead({
        source: function(){ 
            return korisnici;  
        },
        matcher: function(item) {
            return true;
        },
        highlighter: function(item) {
            return "<div class='links'>" + item + "</div>"
        },
        items : korisnici.length,
        updater: function(item){
            dataIndex = korisnici.indexOf(item);
            graph.step(process.load(serviceData, dataIndex, section))
        }
    });
}

var process = (function(){

    // kopira iz jednog u drugi niz 
    // elemente dužine (size)
    // @param {Array} [from] originalni niz
    // @param {Array} [to] odredišni niz
    // @param {Number} [size] dužina elemenata odredišnog niza
    // @param {String} [oper] operator
    function copy(from, to, size, oper){
        from.forEach(function(d, i){
                d.value = +d.value;
                if(((oper == 'eq')?  d.genericId.length == size : d.genericId.length >= size) && d.value >0)
                    to.push(d);
            });
    }
    
    // briše slične elemente iz niza
    // @param {Array} [array] niz u kom se pojavljuju specificni elementi
    function remove(array){
        for (var i = 1; i < array.length;) {
            if ((array[i].genericId.indexOf(array[i-1].genericId) > -1) && (array[i].value == array[i-1].value)) { 
                array.splice(i -1, 1);
            } else
                i++;
        }
    }
    
    // izbacuje duplikate kada se ovi pojavljuju van reda
    // obicno kao prethodni ili sljedeci element (p, s == 0 || 1)
    // (*u slucajevima da su ponovljeni kao zbir drugih elemenata)
    // @param {Array} [array] niz u kom se pojavljuju specificni elementi
    // @param {Number} [p] 0 ili 1 provjeri prehodni clan
    // @param {Number} [s] 0 ili 1 provjeri sljedeci clan
    function removeSpecific(array, p, s){
     
        // google chrome ima problema sa stabilnim sortiranjem ovakvih nizova, tako da ovo pomaze
        Insertionsort.sort(array);

        for (var i = 1; i < array.length; i++){
            if((array[i-p].genericId == array[i-s].genericId) && (array[i-p].value < array[i-s].value)){
                array.splice(i-s, 1);
            }
        }
        
        if(p == 1){ removeSpecific(array, 0, 1); }
      
        return array;   
    }
    
    // prihodiCompare obradjuje podatke koje vraca /data/objs/all servis
    // posto dolaze u formatu specificnih godina sa cistim, nesabranim vrijednostima 
    // @param {Array} [data] niz potrebnih elementa dobijenih od servisa
    // @param {Array} [q] niz koji generise load funkcija
    function prihodiCompare(data, q){
        var newdata = [];

        q.years.forEach(function(y, i){
                
            prihodiParse(data[0].sct[i], q);
            newdata[i] = ({ "value": q.summa,
                        "proposed": "Ukupni prihodi " + y,
                        "name": "Ukupni prihodi " + y,
                        "genericId": "700000" });
        });

        q.values = newdata;
        
        return q;
        
    }
    
    // prihodiParse obradjuje podatke definisane u budzetskim prihodima
    // koji su specificni po tome sto kontni brojevi mogu biti razlicitih
    // duzina a ulaze u finalni zbir, jako komplikovano, mozda i bespotrebno...
    // @param {Array} [data] niz potrebnih elementa dobijenih od servisa
    // @param {Array} [q] niz koji generise load funkcija
    function prihodiParse(data, q){
        
        var t = [];
        var c = [];
        var p = [];
        
        // razdvoji elemente duzine tri, cetiri i vise od cetiri
        copy(data, t, 3, 'eq');
        copy(data, c, 4);
       
        // izbaci duplikate
        remove(t);
        remove(c);
        
        // izbaci specificne elemente (vrijednosti koje su suma vise vrijednosti
        // jer zagadjuju niz pa metod koji sabira vraca pogresan rezultat)
        removeSpecific(t, 0, 1);
        removeSpecific(c, 1, 0);        
        
        // uporedi elemente duzine 3 sa duzim od toga
        // i ako postoji slicnost zapamti indeks
        t.forEach(function(d, i){
            c.forEach(function(k){
                if(d.genericId == k.genericId.substr(0,3)){
                    p[i] = i;
                }    
            });
        });
        
        // undefined = clan niza koji nema slicnih u duzim
        // stoga ide u q / finalni niz
        t.forEach(function(f, i){
            if(p[i] === undefined)
                c.push(f);
        });
        
        q.summa = 0;        
        q.values = c;
        
        // ... zbir
        q.values.forEach(function(f){
            q.summa += f.value;
            
        });  
        
        return q;
    }
    
    // indexCompare se poziva kad se porede ili 
    // biraju elementi razlicitih godina
    // @param {Array} [data] niz potrebnih elementa dobijenih od servisa
    // @param {Number} [index] pozicija trenutnog elementa
    // @param {String} [sec] sekcija (jedna od 4 moguce budzetske stavke)
    function indexCompare(data, index, sec){
    
        // [1] je bivsi element
        if(last[1] !== undefined){
            var ni = -1;
            
            // [0] je trenutni element, i ako se ova dva razlikuju nesto nije u redu
            if(last[0].nazivPotrosackeJedinice != last[1].nazivPotrosackeJedinice){
                // iz niza elementa
                data.elements[section].forEach(function(d, i){
                    // pronadji onaj koji odgovara bivsem [1] elementu
                    if(d.budzetskiKorisnik[0].nazivPotrosackeJedinice == last[1].nazivPotrosackeJedinice)
                        // njegov indeks odgovara pisanoj vrijednosti trenutnog
                        ni = data.elements[section].indexOf(d);     
                });

                if(ni > -1){
                    // snimi trenutno stanje u niz last
                    last.splice(1,1, last[0]);
                    last.splice(0,1, data.elements[section][ni].budzetskiKorisnik[0]);  
                    
                    // vrati validan indeks
                    return ni;
                } 
            }
        } 
        
        // u slucaju da je [1] prazan ili da u nizu nema 
        // potrebnog elementa vrati trenutni indeks
        return index;
    }
    
    // load funkcija normalizuje niz dobijen od servisa
    // i pravi novi niz q sa kojim graph funkcija moze da barata
    // @param {Array} [data] niz potrebnih elementa dobijenih od servisa
    // @param {Number} [index] pozicija trenutnog elementa
    // @param {String} [sec] sekcija (jedna od 4 moguce budzetske stavke)
    // @param {Boolean} [compare] kada se pozove (true) naznacava da se radi o poredjenju
    function load(data, index, sec, compare){
        // globalna promjenjiva section se odredjuje na osnovu poziva...
        section = sec;
        
        var u = { nazivPotrosackeJedinice: '', brojPotrosackeJedinice: '', brojBudzetskeOrganizacije: '', brojMinistarstva: '' };
        var q = { values : [], subject : '', summa: 0, unique: u, years : data.elements.years || '' };
              
        var sections = { rashodiTotal: 'Ukupni rashodi', rashodiOstalo: 'Ostali rashodi', prihodi: 'Prihodi' };
        
        $("#section-title").text(sections[section]);
        // svaka od sekcija ima svoje specificnosti pa ih moram razdvojiti
        if(section === 'rashodiPoKorisniku'){
            var currentUser, currentExpenses;
            // ako je trentni element sa trenutnim indeksom nedefinisan, vrati sve na pocetak
            // (ovo se desava ako se iz poredjenja vraca na odredjenu godinu u kojoj je najvisi indeks < array.length)
            if(data.elements[section][index] == undefined){ compare = false; index = 0; dataIndex = 0; }
            
            // (objasnjeno u indexCompare funkciji)
            if(last[0] == undefined) 
                last.splice(0,1, data.elements[section][index].budzetskiKorisnik[0]);
            else {
                last.splice(1,1, last[0]);
                last.splice(0,1, data.elements[section][index].budzetskiKorisnik[0] || data.elements[section][0].budzetskiKorisnik[0]);
            }
            
            // ako se poredi pozovi indexCompare sa trenutnim vrijednostima da bismo 
            // provjerili da li pisana vrijednost trenutnog podatka odgovara bivsem
            if(compare) index = indexCompare(data, index, sec);
            
            currentUser = data.elements[section][index].budzetskiKorisnik[0];
            currentExpenses = data.elements[section][index].rashodiBudzeta; 
            
            $("#default-rel").fadeIn(250);
 
            q.subject = currentUser.nazivPotrosackeJedinice;
            
            q.unique.nazivPotrosackeJedinice = currentUser.nazivPotrosackeJedinice;
            q.unique.brojPotrosackeJedinice = currentUser.brojPotrosackeJedinice;
            q.unique.brojBudzetskeOrganizacije = currentUser.brojBudzetskeOrganizacije;
            q.unique.brojMinistarstva = currentUser.brojMinistarstva;
             
            uniqueIds = q.unique;
            
            // ... zbir vrijednosti za trenutni element
            currentExpenses.forEach(function(d) {
                    d.value = +d.value;
                    if(d.genericId.length >= 4 && d.value > 0){
                        q.values.push(d);
                        q.summa += d.value }
                });
                
        } else if(section == 'rashodiTotal' || section == 'rashodiOstalo') {
            q.subject = sections[section];
            var currentSection = data.elements[section];
            
            $("#default-rel").fadeOut(250);
            
            currentSection.forEach(function(d) {
                    d.value = +d.value;
                    if(d.genericId.length >= 4 && d.value > 0){
                        q.values.push(d);
                        q.summa += d.value;
                        }
                });
                
        } else if(section == 'prihodi'){
            q.subject = sections[section];
            var currentSection = data.elements[section];
            
            $("#default-rel").fadeOut(250);
            
            if(q.years.length == 0){
                prihodiParse(currentSection, q);
            } else
                prihodiCompare(currentSection, q);
        }

        expd = q;
        return q;
    }
    return {
        load: load
    };
    
})(window);

// Insertionsort.sort(array), objasnjenje potraziti na drugom mjestu
var Insertionsort = (function() {

    function sort(array) {

        for (var i = 1, j = array.length, position, item; i < j; i++) {
            item = array[i];

            position = i;

            while (position > 0 && array[position - 1].genericId > item.genericId) {
                array[position] = array[position - 1];
                position -= 1;
            }

            if(item !== undefined)
                array[position] = item;
        }

        return array;
    }

    return {
        sort: sort
    };

})();
