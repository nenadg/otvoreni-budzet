var host = location.hostname;
var socket = io.connect(host);

var subject, serviceData, section, localYear, dataIndex, korisnici, godine, uniqueIds;
dataIndex = 0, korisnici = [], uniqueIds = {}, godine = [];

socket.on('message', function(data){
    $('.data-status-renderer').empty();
    $('.data-status-renderer').append(setup.success(data));
    $('.data-status-renderer').append(setup.reload());
});

$(document).ready(function () {
    updater = new updater();
    
    check();
});

function check(){
    // pobrisi ako je bilo sta ispisano
    $('.data-status-renderer').empty();
    $('.data-service-info-renderer').empty();
    
    $.getJSON("/data/objs/years/")
        .done(function(data){ done(data.elements) })             
        .fail(function(data){ fail(data.elements) })
        .always(function(){ });
}

function done(data){

    data.forEach(function(element, i){ 
        godine.push(element.godina.substr(0,4));
        $(".dropdown-menu#years").append("<li><a href='#' id='" + godine[i] + "'>" + godine[i] + "</a></li>");
    });
    
    $.getJSON("/data/objs/json/" + godine[0])
        .done(function(data) { updater.initialize(godine[0], data) })
        .fail(function(data) { unavailable() })
        .always(function(data) { });
    
    $(".dropdown-menu#years li a").click(function(){
        var _godina = this.id;
        $("#godina").text(_godina);
        
        $.getJSON("/data/objs/json/" + _godina)
            .done(function(data) { updater.initialize(_godina, data) })
            .fail(function(data) { })
            .always(function(data) { });
      
    });
    
    applyActions(updater);
}



