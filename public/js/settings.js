// socket.io part
var host = location.hostname;
var baze = [ 'kontniplans', 'budzets', 'kontniplan-staris' ];
var kontniplans = false;
var kontniplan_staris = false;
var socket = io.connect(host);
var disabled = 'disabled';

socket.on('message', function(data){
    check();
    $('.data-service-info-renderer').append(setup.success(data));
});

$(document).ready(function () {
    check();
});

function check(){
    // pobrisi ako je bilo sta ispisano
    $('.data-status-renderer').empty();

    // provjeri
    baze.forEach(function(x){
        $.getJSON("/data/objs/counters/" + x)
         .done(function(data) { done(data, x) })             
         .fail(function(data) { fail(data, x) })
         .always(function(data) { always(data, x) });
    });
}

// izvris kada kolekcija postoji
function done(data, x){
    switch(x){
        case("kontniplans"):
            kontniplans = true;

        break;
        case("kontniplan-staris"):
            kontniplan_staris = true;
            
        break;
        case("budzets"):
            (kontniplans && kontniplan_staris)? (disabled = 'enabled', removeLoading()) : disabled = 'disabled';
            $(".data-status-renderer").append(setup.button(data, x, disabled, true));
            $("#budzets").izgradi();
            
        break;
    }   
    $(".data-status-renderer").append(setup.consistent(data, x));
    setup.removers(data, x);
}

// izvrsi kada kolekcija ne postoji
function fail(data, x){
    // provjeri da li obe varijante true
    switch(x){ 
        case("budzets"):
            (kontniplans && kontniplan_staris)? disabled = 'enabled' : disabled = 'disabled';
            $(".data-status-renderer").append(setup.button(data, x, disabled, true));
            $("#" + x).izgradi();
            
            if(disabled == 'enabled')
                removeLoading();
        break;
        default:
             $(".data-status-renderer").append(setup.button(data, x, ''));
             $("#" + x).izgradi();
        break;
    }  
}

function always(data, x){
    // ako su obe verzije true, omoguci unos budzeta  
    if(kontniplans && kontniplan_staris)
        removeLoading();
}

function removeLoading(){
    $('#budzets').removeClass('disabled');
    $('#date').removeAttr('disabled');
    
}
 
