var serviceData, section,  expd, localYear, dataIndex, korisnici, uniqueIds, last, years;
dataIndex = 0, korisnici = [], uniqueIds = [], last = [], years = [];

var graph = (function(){

    var formatPercent = d3.format(",");
    var x, y, xAxis, yAxis, svg, div,  color, statx, staty,  margin;
    statx = 50, staty = $(this).height() - 80 || 600,  margin = { top: 5, right: 15, bottom: 25, left: 5 };
    
    function initialize(year, indexcomp){
        if(serviceData){
            
            section = 'rashodiPoKorisniku'; // default
            var sections = { rashodiTotal: 'Ukupni rashodi', rashodiOstalo: 'Ostali rashodi', prihodi: 'Prihodi', rashodiPoKorisniku: 'Rashodi po korisniku' };
            
            var current = ((indexcomp == undefined)? process.load(serviceData, dataIndex, section) : process.load(serviceData, dataIndex, section, true));
            
            preload(function(){
                create(current, function(){
                    step(current);
                    
                    populateSubMenu(serviceData.elements[section], graph);
                    $(".data-toggle.title").text(current.subject);
                    $("#section-title").text(sections[section]);
                })
            })
        } else fail();
    }

    function preload(next){
        x = d3.scale.linear().range([0, width(statx)]);
        y = d3.scale.ordinal().rangeRoundBands([0, height(staty)], .1, 1);
        
        xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(formatPercent);
        yAxis = d3.svg.axis().scale(y).orient("right");
        
        color = d3.scale.ordinal().range(["#3261AB", "#3DB680"]);
        
        next();
    }

    function create(data, next){
        
        svg = shape(d3.select("body .container #data-view").append("svg").attr("id", "datalove"));
        
        div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0).style("display", "none");
        
        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height(staty) + ")")
          .call(xAxis)
        .append("text")
          .attr("x", width(statx))
          .attr("dy", "-1em")
          .style("text-anchor", "end")
          .text(data.unique.nazivPotrosackeJedinice + ((data.years.length == 0)? ' (ukupno ' + formatPercent(data.summa) +' KM)' : ' ($)'))
          .attr("class", "naziv")
          .style("font-size", "14px")
          
        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .selectAll(".tick.major text")
          .data(data)
          .style("display", "block")
          .text(function(d, i){ return d.name })
          
          next();
    }

    function shape(element){
        return element.attr("width", width(statx) + margin.left + margin.right)
            .attr("height", height(staty) + margin.top + margin.bottom)
            .attr("xmlns", "http://www.w3.org/2000/svg").attr("version","1.1")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }

    function width(value){ return $('.container .row .span9').width() - value - margin.left - margin.right }

    function height(value){ return value - margin.top - margin.bottom }

    function resize(w, h){
        statx = w;
        staty = h;

        preload(function(){    
            shape(d3.select("svg")) })        
    }

    function step(data){
        if(dataIndex >= 0){
            var koliko = data.values.length;
            (koliko >= 35)? staty = koliko*24: staty = $(window).height() - 80 || 600;
            
            resize(statx, staty);
            
            //if (data.years.length >0) data.years.sort(function(a,b){ return b - a; });
            
            x.domain([0, d3.max(data.values, function(d, i ) { return d.value })]);
            y.domain(
                ((data.years.length == 0)
                ? (data.values.sort(function(a, b) { return (b.value - a.value); }))
                : (data.years))
                .map(function(d, i) { return i })).copy();
                /* iako bih volio da mogu sortirati ovaj dio, ne mogu */
                /*(data.years.length == 0) ? (function(a, b) { return (b.value - a.value); }) : (function(a, b) { return d3.ascending(a.name, b.name); }))*/
                //function(a, b) { return (b.value - a.value); })
                

            var transition = svg.transition().duration(450),
                delay = function(d, i) { return i * 10; };

            transition.select(".y.axis")
                .call(yAxis)
              .selectAll(".tick.major text")
                .style("display", "block")
                .text(function(d, i){ if(data.values[i] || "") return data.values[i].name  }) // + ((section == 'rashodiPoKorisniku')? data.years[i] || ' ' : ' ')
              .selectAll("g")
                .delay(delay)
            
            $(".data-toggle.title").text(data.subject);
            
            transition.select(".x.axis")
                .attr("transform", "translate(0," + height(staty) + ")")
                .call(xAxis)
              .select("text.naziv")
                .delay(delay)
                .attr("x", width(statx))
                .text(data.unique.nazivPotrosackeJedinice + ((data.years.length == 0)? ' (ukupno ' + formatPercent(data.summa) +' KM)' : ' '))
              .select("g")
                .delay(delay)
                
            svg.selectAll(".bar") 
              .data(data.values)
            .enter().append("rect")
              .style("fill", function(d, i){ return color(i %1) } )
              .attr("class", "bar")
              .style("opacity", ".9")
              .style("shape-rendering", "crispEdges")
              .attr("x", 0)
              .attr("width", 0) // function(d) { return x(d.value); } ) za instant prikaz, ovako ide polako od nule...
              .attr("y", function(d, i) { return y(i) })
              .attr("height", y.rangeBand())
                   
            transition.selectAll(".bar")
                .delay(delay)
                .attr("x", 0)
                .attr("width", function(d, i) { if(data.values[i] || "") return x(data.values[i].value); else return x(0); } )
                .attr("y", function(d, i) { return y(i) })
                .attr("height", y.rangeBand())
                
            svg.selectAll(".little")
              .data(data.values)
            .enter().append("rect")
              .attr("class", "little")
              .style("fill", "black")
              .style("opacity", ".5")
              .style("display", "block")
              .attr("x", function(d) { return x(d.value); }) 
              .attr("width", 0)
              .attr("y", function(d, i) { return y(i) })
              .attr("height", y.rangeBand())  

            transition.selectAll(".little")
                .attr("class", "little")
                .style("fill", "black")
                .attr("x", function(d, i) { if(data.values[i] || "")  return x(data.values[i].value); else return x(0); }) 
                .attr("width", function(d, i) { if(data.values[i] || "") return 5; else return 0; } )
                .attr("y", function(d, i) { return y(i) })
                .attr("height", y.rangeBand())
                .delay(delay);
                
            if(data.years.length > 0){
                
                svg.selectAll(".link")
                  .data(data.values)
                  .enter().append("rect")
                  .attr("class", "link")
                  .style("fill", "transparent")
                  .style("opacity", ".0")
                  .style("display", "block")
                  .attr("x", 0)
                  .attr("width", function(d, i) { if(data.values[i] || "") return x(data.values[i].value); else return x(0); } ) // -1
                  .attr("y", function(d, i) { return y(i) })
                  .attr("height", y.rangeBand())
                  .on("click", function(d,i){
                        $("#datalove").fadeTo(150, 0.3, function(){
                        
                            $("#data-view").addClass("loader");
                            
                            d3.json("/data/objs/json/" + data.years[i], function(error, current) {
                                serviceData = current;
                                
                                if(!error) { 
                                    $("#description").show();
                                    
                                    $("#godina").text(data.years[i]); 
                                    graph.step(process.load(serviceData, dataIndex, section, true));
                                    
                                    $(".dd-year").text(data.years[i]);
                                    
                                    $(".years.btn.dropdown-toggle.btn-small.btn-inverse").removeClass('disabled'); 
                                    if(section = "rashodiPoKorisniku") populateSubMenu(serviceData.elements[section]);
                                    
                                    $("rect.link").remove();
                                    
                                    $("#datalove").fadeTo(150, 1, function(){
                                        $("#data-view").removeClass("loader");
                                        $('#graph-compare').removeClass('active');
                                    }); 
                                    
                                } else fail();
                                
                                
                            });
                        });
                   });
                  
                  transition.selectAll(".link")
                    .delay(delay)
                    .attr("x", 0)
                    .attr("width", function(d, i) { if(data.values[i] || "") return x(data.values[i].value); else return x(0); } )
                    .attr("y", function(d, i) { return y(i) })
                    .attr("height", y.rangeBand());
                  
                  bubble(svg.selectAll(".link").data(data.values), data.years);
                  
             } 

            (dataIndex == 0) ? $("#prethodni").addClass("disabled") : $("#prethodni").removeClass("disabled");
            (dataIndex == serviceData.elements[section].length - 1) ? $("#sljedeci").addClass("disabled") : $("#sljedeci").removeClass("disabled");
                
            bubble(svg.selectAll("rect").data(data.values));
            bubble(svg.selectAll(".little").data(data.values));
        }
    }
    
    function bubble(selection, years){
        selection
        .on("mouseover", function(d) {      
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9)
                    .style("display", "block");      
                div .html("<strong>Iznos</strong><br/>"  
                        + formatPercent(d.value) + " KM" + "<br/><strong>Zvanični opis</strong><br/>" 
                        + d.proposed + "<br/>Ekonomski kod: " + d.genericId
                        + ((years !== undefined)? "<br/>(klik za prikaz godine)":""))
                    .style("display","block")
                    .style("left", (d3.event.pageX - 28) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px");    
                })                  
          .on("mouseout", function(d) {       
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);   
                })
    }
    
    return {
        init: initialize,
        step: step,
        resize: resize
    };
    
}(window));
