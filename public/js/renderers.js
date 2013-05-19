var updater = function(){};

updater.prototype.step = function(data){
     $(".data-toggle.title").text(data.subject);
     $(".data-service-info-renderer").empty();
     $(".summa").text("Ukupno " + data.summa);
     
     data.values.forEach(function(v){
        $(".data-service-info-renderer").append("\
        <input type='text' class='input input-small smaller-text-big' id='"+ v.genericId + "_proposed' value='" + v.proposed + "'>" 
        +  "<input type='number' class='input input-small smaller-text' id='" + v.genericId + "_value' value='" + v.value + "'>" 
        + "</small><button id='" + v.genericId + "_edit' class='btn btn-small btn-info pull-right edit-updater'>Izmijeni</button></p>");
        
        $("#" + v.genericId + "_edit").izmijeni();
     });    
     
     (dataIndex == 0) ? $("#prethodni").addClass("disabled") : $("#prethodni").removeClass("disabled");
     (dataIndex == serviceData[section].length - 1) ? $("#sljedeci").addClass("disabled") : $("#sljedeci").removeClass("disabled");
}
updater.prototype.initialize = function(year, data){
    
    if(data.elements !== undefined){
        
        section = 'rashodiPoKorisniku'; // default
        serviceData = data.elements;
        localYear = year;
        
        var current = process.load(serviceData, dataIndex, section);
        
        
        populateSubMenu(serviceData[section], updater);
        $(".data-toggle.title").text(current.subject);
        
        this.step(current); 
       
    } else unavailable();
}

var setup = {
    success : function(data){
        return "<p><i class='icon-check'></i><small> (" + data.event  + ")</small></p>";
    },
    failure : function(data){
        return "<p><i class='icon-ban-circle'></i><small> Greška: " + data.event + "</small></p>";
    },
    reload : function(data){
        var id = $('#refresh-data').val();
        if(id === undefined)
            return "<p id='refresh-data'><i class='icon-retweet'></i><small><a href='#' onClick='check()'> Osvježi podatke</a></small></p>";
        else
            $('#refresh-data').remove();
            return this.reload(data);
    },
    consistent : function(data, element){
        var years = [];
        var deletes = "<button id='" + element + "_delete' class='btn btn-small btn-danger pull-right deletes'>Izbriši</button>";
        
        if(data.elements.years.length > 0){
            data.elements.years.forEach(function(d,i){ 
                years.push("<button id='" + d.substr(0,4) + "_delete' class='btn btn-small btn-danger deletes'>Izbriši " + d.substr(0,4) +"</button>");
            }) 
        }
   
        return "<p><i class='icon-check'></i><small> Kolekcija <b>" 
            + element + "</b> izlgeda konzistentno sa " + data.elements.docs + " dokumenata i " 
            + data.elements.cols + " unosa.</small>" + ( ( years.length > 0 ) ? "<p>" + years : deletes ) + "</p>";
            
            
    },
    button: function(data, target, disabled, input){
         if(data !== undefined){
            data = {};
            data.responseText = 'Novi unos';
            data.ban = 'icon-heart';
         } else data.ban = 'icon-ban-circle';
               
         var str = "<p><i class='" + data.ban + "'></i><small> " 
                + data.responseText + ' (' 
                + target + ")</small><button id='" + target + "' class='btn btn-primary pull-right " + disabled + "' data-loading-text=\"\
                <i class='icon-upload icon-white'></i>\">Izgradi</button>"
         
         var inp = "<input size='16' class='input-small pull-right'\
                    type='number' value='2012' id='date' name='date' " + disabled + "></p>";
         
         return (input)? str + inp + "<br/>"  : str + "</p><br/>";
    }, 
    removers: function(data, target){
        if(data.elements.years.length > 0){
            data.elements.years.forEach(function(d,i){ 
                $("#" + d.substr(0,4) + "_delete").izbrisi();
            });
        } else {
            $("#" + target + "_delete").izbrisi();
        }
    }
    
}
$.prototype.izmijeni = function(){
    //edit-updater
    this.click(function() {
        var parts = this.id.split('_');
        var obj = { };
        
        obj.godina = localYear;
        obj.section = section;
        
        if(section == 'rashodiPoKorisniku'){
            eval("obj." + section + " = [ { \"rashodiBudzeta\" : [] } ]");
            obj[section][0].budzetskiKorisnik = [ uniqueIds ]; 
            obj[section][0].rashodiBudzeta = [{ genericId: parts[0], proposed: $("#" + parts[0] + "_proposed").val(), value: $("#" + parts[0] + "_value").val() }];
        } else {
            eval("obj." + section + " = '' ");
            obj[section] = [{ genericId: parts[0], proposed: $("#" + parts[0] + "_proposed").val(), value: $("#" + parts[0] + "_value").val() }];
        }

        
        
        var jqxhr = $.post("/data/action/update", obj)
            .done(function(data) {
            
                $(".data-status-renderer").append(setup.success(data));  })
            .fail(function(data) { 
                //var obj = jQuery.parseJSON(data.responseText);
                
                $(".data-status-renderer").append(setup.failure(data)); 
             }); 
        
        
    });
}
$.prototype.izbrisi = function(){
    
    this.click(function() {
        $(this).button('loading');
        var parts = this.id.split('_');
        
        var jqxhr = $.get("/data/action/remove/" + parts[0])
            .done(function(data) {
            
                $("#" + data.sender + "_delete").remove();
                check();
                $(".data-service-info-renderer").append(setup.success(data));  })
            .fail(function(data) { 
                var obj = jQuery.parseJSON(data.responseText);
                $('#budzets').button('reset');
                $(".data-service-info-renderer").append(setup.failure(obj)); 
             }); 
        
        
    });
}

$.prototype.izgradi = function(){
    
    this.click(function() {
        $(this).button('loading');
        
        if(this.id == 'budzets'){
            var date = $("#date").val();
            var jqxhr = $.post("/data/build/budget/", { date: date })
                .done(function(data) {
                    $(this).button('reset');
                    $(".data-service-info-renderer").append(setup.success(data));  })
                .fail(function(data) { 
                    var obj = jQuery.parseJSON(data.responseText);
                    $('#budzets').button('reset');
                    $(".data-service-info-renderer").append(setup.failure(obj)); 
                 }); 
        } else {
            var jqxhr = $.post("/data/build/kp/", { kp: this.id })
                .done(function(data) { 
                        $(".data-service-info-renderer").append(setup.success(data));  })
                .fail(function(data) { 
                        var obj = jQuery.parseJSON(data.responseText);
                        $(".data-service-info-renderer").append(setup.failure(obj));
                        $("#" + obj.sender).button('reset');
                 })
        }
    });
}
