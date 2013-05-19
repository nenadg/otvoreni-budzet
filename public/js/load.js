// ob v0.0.1

$(document).ready(function () {
    $("#description").hide();
    
    $.getJSON("/data/objs/years/")
        .done(function(data){ 
            data.elements.forEach(function(element, i){ 
                years.push(element.godina.substr(0,4));
                $(".dropdown-menu#years").append("<li><a href='#' id='" + years[i] + "_ddm'>" + years[i] + "</a></li>");
            });
            
            d3.json("/data/objs/json/" + years[0], function(error, current) {
                serviceData = current;
                
                if(!error) { graph.init(years[0]); $("#godina").text(years[0]); $("#data-view").removeClass("loader"); $("#description").show(); }
                else graph.init(0); });
                
                $(".dd-year").text(years[0]);
                
                $(".dropdown-menu#years li a").click(function(){
                    var year = this.id.split('_');
                    
                    $(".dd-year").text(year[0]);
                    
                    $("#data-view").addClass("loader");
                    $("#datalove").fadeOut(150, function(){
                        
                        d3.select("#datalove").remove();
                        
                    }).fadeIn(150, function(){
                        d3.json("/data/objs/json/" + year[0], function(error, current) {
                            serviceData = current;
                            
                            if(!error) { graph.init(year[0], true); $("#godina").text(year[0]); $("#data-view").removeClass("loader"); }
                            else graph.init(0) });
                    });   
                });
                
                applyActions();
        
        })             
        .fail(function(data){ fail(); })
        .always(function(){ $("#data-view").addClass("loader") });
        
        
});

function fail(){
    $("#content .span3").remove();
    $("#content .span9 #data-view").append("<h1>Sadržaj trenutno nije dostupan</h1><hr/><p>Probajte kasnije</p>") 
}
