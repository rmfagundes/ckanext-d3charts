var dataset = null,
    resource_id = "",
    nesting_field = "Data do Acidente",
    parseTime = d3.timeParse("%Y-%m-%d"),
    url_csv = "http://localhost:5000/dataset/96fb8bbd-7d07-4419-bb0b-eaffaad9e744/resource/7f496ca0-3f08-4397-9e5a-bd4aa2a86949/download/cat.csv";

function getDivisor(ds) {
    return Math.max.apply(null, ds.values());
}

function getYrRange(ds) {
    var range = null;
    ds.keys().forEach(function(d, indx) {
        dArr = d.split(/\D/g);
        if (range == null) {
            range = [parseInt(dArr[2]), parseInt(dArr[2])];
        } else {
            if (parseInt(dArr[2]) < range[0]) range[0] = parseInt(dArr[2]);
            if (parseInt(dArr[2]) > range[1]) range[1] = parseInt(dArr[2]);
        }
    });
    return range;
}

$(function() {
    var plot = function(ds) {
        if (dataset == undefined) { 
            if (ds != undefined && ds != null) {
                dataset = ds;
            } else {
                alert("ERRO");
            }
        }
        
        var day = d3.timeFormat("%w"),
            week = d3.timeFormat("%U"),
            percent = d3.format(".1%"),
            format = d3.timeFormat("%Y-%m-%d");

        var color = d3.scaleQuantize()
                      .domain([.00, 1.00])
                      .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

        var divisor = getDivisor(dataset);
        var yrRange = getYrRange(dataset);

        $("#slider-range").slider({
            range: true,
            min: yrRange[0],
            max: yrRange[1],
            values: yrRange,
            slide: function( event, ui ) { }
        });
        
        if (yrRange[1] == yrRange[0]) {
            $("#slider-range").hide();
        } else {
            $("#slider-range").show();
        }

        var svg = d3.select($("#d3-calendar-cat")[0]).selectAll("svg");
        svg.remove();
    
        $("#d3-calendar-cat").html("");  
    
        //append a new one
        svg = d3.select($("#d3-calendar-cat")[0]).append("svg");
    
        var width = $("#d3-calendar-cat").innerWidth();
        var yearHeight = width / 60 * 8,
            height = yearHeight * ($("#slider-range").slider("values")[1] - $("#slider-range").slider("values")[0] + 1),
            cellSize = yearHeight / 8; // cell size

        svg.attr("width", width)
           .attr("height", height);
        
        var g = svg.selectAll(".yearG")
                .data(d3.range($("#slider-range").slider("values")[0], $("#slider-range").slider("values")[1] + 1))
                .enter().append("g").attr("class", "RdYlGn")
                                    .attr("transform", function(d, i) {
                                        return "translate(" + ((width - cellSize * 53) / 2) + "," + ((yearHeight - cellSize * 7 - 1) + (yearHeight * i)) + ")";
                                    });

        g.append("text").attr("class", "yrLbl")
                        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
         .style("text-anchor", "middle")
         .text(function(d) { return d; });

        var rect = g.selectAll(".day")
                    .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
                    .enter().append("rect").attr("class", "day")
                                        .attr("width", cellSize)
                                        .attr("height", cellSize)
                                        .attr("x", function(d) { return week(d) * cellSize; })
                                        .attr("y", function(d) { return day(d) * cellSize; })
                    .datum(format);

        rect.append("title")
            .text(function(d) { 
                dArr = d.split(/\D/g);
                dt = [dArr[2], dArr[1], dArr[0]].join("/");
                return dt; 
             });

        g.selectAll(".month")
         .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
         .enter().append("path").attr("class", "month")
                                .attr("d", function monthPath(t0) {
                                            var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                                                d0 = +day(t0), w0 = +week(t0),
                                                d1 = +day(t1), w1 = +week(t1);
                                            return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
                                                       + "H" + w0 * cellSize + "V" + 7 * cellSize
                                                       + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
                                                       + "H" + (w1 + 1) * cellSize + "V" + 0
                                                       + "H" + (w0 + 1) * cellSize + "Z"});
        
        g.selectAll(".day").filter(function(d) { dArr = d.split(/\D/g);
                                                 dt = [dArr[2], dArr[1], dArr[0]].join("/");
                                                 return $.inArray(dt, dataset.keys()) >= 0; })
                           .attr("class", function(d) {
                               dArr = d.split(/\D/g);
                               dt = [dArr[2], dArr[1], dArr[0]].join("/");
                               return "day " + color(1 - dataset["$"+dt] / divisor); 
                            })
                           .select("title")
                           .text(function(d) { 
                               dArr = d.split(/\D/g);
                               dt = [dArr[2], dArr[1], dArr[0]].join("/");
                               return dt + ": " + dataset["$"+dt];
                            });
    }

    // TODO [1] EXT
    d3.csv(url_csv,
           function(csv) {
                plot(d3.nest()
                       .key(function(d) { return d[nesting_field]; })
                       .rollup(function(leaves) { return leaves.length; })
                       .map(csv));
    });
    
    d3.select(window).on('resize', plot);
});