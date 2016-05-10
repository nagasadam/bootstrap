// ---------------------------------------------------------
// ---  Generate aggregations needed for this symphony_data


var gtnpatient_data = d3.nest()
  .key(function(d)
  { return d.TC_NAME + "|" + d.SUB_TC_NAME + "|" + d.SGMNT + "|" + d.RX_FILL_YYYYQTR + "|" + d.MNFCTRR + "|" + d.DRUG_NAME  + "|" + d.GEO_STATE + "|" + d.GEO_CITY + "|" + d.PYR_NAME;
  })
  .rollup(function(v) {
    return {
      PYR_SLS_AMT: d3.sum(v, function(d) {
        return d.WAC_PER_UNIT > 0 ? d.PYR_SLS_AMT : 0.0;
      }),
      PYR_PAT_CNT: d3.sum(v, function(d) {
        return d.WAC_PER_UNIT > 0 ? d.PYR_PAT_CNT : 0.0;
      }),
      GTN: d3.sum(v, function(d) {
        return d.WAC_PER_UNIT > 0 ? (d.PYR_SLS_AMT - d.PYR_RBT_AMT ) : 0.0;
      })

    };
  })
  .map(symphony_data);

var dd = d3.entries(gtnpatient_data);


gtnpatient_data = dd.map(function(d) {
  var dims = d.key.split("|");
  return {
    TC_NAME: dims[0],
    SUB_TC_NAME: dims[1],
    SGMNT: dims[2],
    RX_FILL_YYYYQTR: dims[3],
    MNFCTRR: dims[4],
    DRUG_NAME: dims[5],
    GEO_STATE: dims[6],
    GEO_CITY: dims[7],
    PYR_NAME: dims[8],
    PYR_SLS_AMT: d.value.PYR_SLS_AMT,
    PYR_PAT_CNT: d.value.PYR_PAT_CNT,
    GTN: d.value.GTN };

});


// ------------------------------------------
// --- Global variables: BEGIN
var TC_NAME = "ALL";
var SUB_TC_NAME = "ALL";
var SGMNT = "ALL";
var MNFCTRR = "ALL";
var DRUG_NAME = "ALL";
var PYR_NAME;

var unique_SUBTC = ["ALL"];
var unique_TC = ["ALL"];
var unique_MNFCTRR = ["ALL"];
var unique_DRUG_NAME = ["ALL"];
var unique_SGMNT = ["ALL"];

var barwidth = 8;
var maxHeight = 100;

var chart_data;
var filtered_gtnpatient_data;
var svg;
var chart;
var tip;
var titles;

var vis;
var projection;

var xAxis, yAxis;
var payerline, payerline_all ;

var svgWidth = document.getElementById("gtnpatient").offsetWidth;

var svgHeight = 600;
var maxh = svgHeight * 0.7;
var maxw = svgWidth * 0.9;

var margin = {top: 75, right: 150, bottom: 30, left: 50},
  width = svgWidth - margin.left - margin.right,
  height = svgHeight - margin.top - margin.bottom;

var curFormat = d3.format("$,.2f");
var curFormat2 = d3.format("$,.0f");
var keyFn = function(d) {
  return d.key
};

var unique_payers = uniques(gtnpatient_data.map(function(d) {
  return d.PYR_NAME;
}));

unique_payers.sort();

var color = d3.scale.category10().domain(unique_payers);


var unique_dates = uniques(gtnpatient_data.map(function(d) {
  return d.RX_FILL_YYYYQTR;
}));

unique_dates.sort();

// --- Global variables: END
// ------------------------------------------

dropdowns();
init_gtnpatient();


function init_gtnpatient() {


  svg = d3.select("#gtnpatient").append("svg").attr("width", svgWidth).attr("height", svgHeight)

  svg.append("svg:rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("stroke", "none")
    .attr("fill", "none")

  svg.append("svg:g")
    .attr("id", "linechart")
    .attr("transform", "translate(70,20)")

    update_gtnpatient() ;

};

function update_gtnpatient() {

  d3.selectAll("#goback").remove();
  d3.select('#allLegend').remove();
  d3.select('#svglegend').remove();
  d3.select("#geochart").remove();

  d3.selectAll("circle").remove();
  d3.selectAll(".circle-text").remove();
  d3.select("#payernametxt").remove();


  gtnpatient_legend();

  vis = d3.select("#linechart");

  vis.append("g")
        .attr("class", "x plotaxis")
        .attr("transform", "translate("+margin.left+"," + height + ")");

  vis.append("g")
        .attr("class", "y plotaxis")
        .attr("transform", "translate(0,0 )");


  set_chart_data();


    var maxSLS1 = d3.max(chart_data, function(d) {
      return d.SLS_PER_PATIENT;
    });

    var maxSLS2 = d3.max(chart_data, function(d) {
      return d.SLS_PER_PATIENT_ALL;
    });

    var maxSLS = (maxSLS1 > maxSLS2) ? maxSLS1 : maxSLS2;


    var minSLS1 = d3.min(chart_data, function(d) {
      return d.SLS_PER_PATIENT;
    });

    var minSLS2 = d3.min(chart_data, function(d) {
      return d.SLS_PER_PATIENT_ALL;
    });

    var minSLS = (minSLS1 < minSLS2) ? minSLS1 : minSLS2;


    var plot_dates = uniques(chart_data.map(function(d) {
      return d.RX_FILL_YYYYQTR;
    }));

    plot_dates.sort();


    var plot_payers = uniques(chart_data.map(function(d) {
      return d.PYR_NAME;
    }));



    datescale = d3.scale.ordinal()
      .domain(plot_dates.map(function(d) {
        return d;
      }))
      .rangePoints([margin.left, width], 0.05);

    var gtnscale = d3.scale.linear().domain([minSLS, maxSLS]).range([height,margin.bottom]);

    xAxis = d3.svg.axis()
    .scale(datescale)
    .orient("bottom");

    yAxis = d3.svg.axis()
    .scale(gtnscale)
    .orient("left")
    .ticks(6)
    .tickFormat( curFormat2 );

    payerline = d3.svg.line()
    .interpolate("monotone")
    .x(function(d) { return datescale(d.RX_FILL_YYYYQTR) ; })
    .y(function(d) { return gtnscale(d.SLS_PER_PATIENT); });


    payerline_all = d3.svg.line()
    .interpolate("monotone")
    .x(function(d) { return datescale(d.RX_FILL_YYYYQTR) ; })
    .y(function(d) { return gtnscale(d.SLS_PER_PATIENT_ALL); });

    payerline_payor_all = d3.svg.line()
    .interpolate("monotone")
    .x(function(d) { return datescale(d.RX_FILL_YYYYQTR) ; })
    .y(function(d) { return gtnscale(d.SLS_PER_PATIENT_PAYOR_ALL); });


  var payers = plot_payers.map(function(name) {
    return {
      key: name + "|"+ TC_NAME + "|" + SUB_TC_NAME + "|" + SGMNT+ "|" + MNFCTRR+ "|" + DRUG_NAME,
      name: name,
      values: chart_data.filter(function(d) { return d.PYR_NAME == name;} ).sort(function(a, b) {return d3.ascending(a.key, b.key)})
    }; });


    var payer_lines =   vis.selectAll(".payer").data(payers, function(d) { return d.key; });

      payer_lines
            .enter()
            .append("g")
            .attr("class", "payer");

            // .on( "mouseenter", function() {
            //
            //         var curr = d3.select(this);
            //         var AllLines = d3.selectAll("g.payer");
            //
            //         AllLines[0].forEach( function(m) {
            //
            //           m.children[0].setAttribute("opacity","0.0")
            //           m.children[1].setAttribute("opacity","0.0")
            //           m.children[2].setAttribute("opacity","0.0")
            //           m.children[3].setAttribute("opacity","0.0")
            //         })
            //
            //           curr[0][0].children[0].setAttribute("opacity", "0.8")
            //           curr[0][0].children[1].setAttribute("opacity", "0.8")
            //           curr[0][0].children[2].setAttribute("style", "fill: #ffffff; font-size: 12px; opacity: 1.0")
            //           curr[0][0].children[3].setAttribute("style", "fill: #ffffff; font-size: 12px; opacity: 1.0")
            //
            //      })
            //
            // .on("mouseleave",  function() {
            //
            //   var AllLines = d3.selectAll("g.payer");
            //
            //   AllLines[0].forEach( function(m) {
            //
            //       m.children[0].setAttribute("opacity","0.8")
            //       m.children[1].setAttribute("opacity","0.8")
            //       m.children[2].setAttribute("style", "fill: #ffffff; font-size: 12px; opacity: 0.0")
            //       m.children[3].setAttribute("style", "fill: #ffffff; font-size: 12px; opacity: 0.0")
            //
            //   })
            // });
        payer_lines
         .append("path")
         .attr("class", function (d) { return "payerline " + d.name.replace(" ", "")})
         .attr("d", function(d) {
               return payerline(d.values);
             })
          .style("stroke", function(d) { return color(d.name); })
          .style("stroke-width", "3px");

        payer_lines.append("path")

          .attr("class", function (d) { return "payerline " + d.name.replace(" ", "") })
          .attr("d", function(d) {
                return payerline_all(d.values);
              })

           .style("stroke", function(d) { return color(d.name); })
           .style("stroke-width", "3px")
           .style("stroke-dasharray", ("3, 3") )
          //.style("opacity", 1.0)

          payer_lines.append("path")

            .attr("class", function (d) { return " payerline payor_all"  })
            .attr("d", function(d) {
                  return payerline_payor_all(d.values);
                })

             .style("stroke", "#ffe600")
             .style("stroke-width", "3px")
             .style("stroke-dasharray", ("5, 5") )

          payer_lines.append("text")
           .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]};  })
           .attr("transform", function(d) { return "translate(" + (datescale(d.value.RX_FILL_YYYYQTR)  ) + "," + gtnscale(d.value.SLS_PER_PATIENT) + ")"; })
           .attr("x", 3)
           .attr("dy", ".35em")
           .attr("class", function (d) { return   "payerlinetext " + d.name.replace(" ", "") })
           .style("fill","white")
           .style("font-size","12px")
           .style("opacity",0.0)
           .text(function(d) { return  MNFCTRR; });

          payer_lines.append("text")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]};  })
            .attr("transform", function(d) { return "translate(" + (datescale(d.value.RX_FILL_YYYYQTR)  ) + "," + gtnscale(d.value.SLS_PER_PATIENT_ALL) + ")"; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .attr("class", function (d) { return  "payerlinetext " + d.name.replace(" ", "") })
            .style("fill","white")
            .style("font-size","12px")
            .style("opacity",0.0)
            .text(function(d) { return "All Biopharma"; });

          payer_lines.append("text")
              .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]};  })
              .attr("transform", function(d) { return "translate(" + (datescale(d.value.RX_FILL_YYYYQTR)  ) + "," + gtnscale(d.value.SLS_PER_PATIENT_PAYOR_ALL) + ")"; })
              .attr("x", 3)
              .attr("dy", ".35em")
              .attr("class", function (d) { return  "payerlinetext " + d.name.replace(" ", "") })
              .style("fill","white")
              .style("font-size","12px")
              .style("opacity",1.0)
              .text(function(d) { return "All Payors"; });


        payer_lines.exit().remove();

  d3.transition(vis)
    .select('.x.plotaxis')
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);


  d3.transition(vis)
    .select('.y.plotaxis')
    .call(yAxis)
    .append("text")
      .attr("transform", "translate(0," + margin.top + ")rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .text("Revenue/Patient");

}



function onclick(d) {

  //-----------------------------------------
  //--  First remove the current plot



  //vis.selectAll(".payor").remove();
  vis.selectAll(".x.plotaxis").remove();
  vis.selectAll(".y.plotaxis").remove();
  vis.selectAll(".payer").selectAll(".payerline").remove();
  vis.selectAll(".payer").selectAll(".payerlinetext").remove();
  d3.select('#allLegend').remove();
  d3.select('#svglegend').remove();

  vis
    .append("text")
    .text("Back to Payer View")
    .attr("id", "goback")
    .attr("x", 840)
    .attr("y", 17)
    .style("margin-top", "-300px")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .attr("fill", "white")
    .attr("cursor", "pointer")
    .on("click", update_gtnpatient );




    vis.append("svg:g")
      .attr("id", "geochart")

    geochart = d3.select("#geochart");

    // D3 Projection
    projection = d3.geo.albersUsa()
  				   .translate([svgWidth/2, svgHeight/2])    // translate to center of screen
  				   .scale([1000]);          // scale things down so see entire US

             // Define path generator
    var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
  		  	 .projection(projection);  // tell path generator to use albersUsa projection


    geochart.selectAll("path")
           	.data(states.features)
           	.enter()
           	.append("path")
           	.attr("d", path)
           	.style("stroke", "#fff")
           	.style("stroke-width", "1")
           	.style("fill", "#666");

      set_geo_chart_data();


      payernametxt = vis
        .append("text")
        .text(PYR_NAME)
        .attr("id", "payernametxt");

        payernametxt.attr("x", 0)
        .attr("y", 0)
        .style("opacity",0.6)
        .attr("font-family", "sans-serif")
        .attr("font-size", 90)
        .attr("fill", color(PYR_NAME));

    var offset_width = payernametxt.node().getBoundingClientRect().width /2;

    d3.select('#payernametxt').attr("transform", "translate(" + (svgWidth/2 - offset_width) +"," + (svgHeight/2 + 20) + ")");


      tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {

          tttext = "<p><center><span class='tip_txt_style'>" + TC_NAME + " - " + PYR_NAME + " - " + d.GEO_CITY + "</span></center></p>";
          tttext = tttext + "<p><center><span class='tip_txt_style0'>Biopharma Company: <span class='tip_txt_style'>" + MNFCTRR + "</span>";
          tttext = tttext + "   Product Name: <span class='tip_txt_style'>" + DRUG_NAME + "</span> </span></center></p>";
          tttext = tttext + "<p>Revenue / Patient (All Biopharma - All Payors):  <span class='tip_txt_style'>" + curFormat(d.SLS_PER_PATIENT_ALL) + "</span></p>";
          tttext = tttext + "<p>Revenue / Patient (All Biopharma - " + PYR_NAME + "):  <span class='tip_txt_style'>" + curFormat(d.SLS_PER_PATIENT_PAYOR_ALL) + "</span></p>";
          tttext = tttext + "<p>Revenue / Patient (" + MNFCTRR + " - " + PYR_NAME + "):  <span class='tip_txt_style'>" + curFormat(d.SLS_PER_PATIENT) + "</span></p>";

          //tttext = tttext + "<p>CoPay (Region): <span class='tip_txt_style'>" + curFormat(d.COPAY_ALL) + "</span></p>";
          // tttext = tttext + "<p>Delta CoPay (Region): <span class='tip_txt_style'>" + curFormat(d.DELTA_COPAY) + "</span></p>";
          return tttext;

        });

      var maxRevPatient = d3.max(chart_data, function(d) {
          return d.SLS_PER_PATIENT;
        });

        var minRevPatient = d3.min(chart_data, function(d) {
            return d.SLS_PER_PATIENT;
          });

      var bubbleScale_size = d3.scale.linear().domain([minRevPatient,maxRevPatient]).range([5,25]);

      circles = vis.selectAll("circle.circle-copay").data(chart_data, keyFn);
        //
        // update the bullets
        circles
          .enter()
          .append("svg:circle")
          .attr("class", "circle-copay")
          .attr("fill", color(PYR_NAME))
          .attr("opacity", "0.8");

        circles.exit().remove();


        circles
           .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
          .call(tip);



        circles
        .attr("cx", function(d) {
          return projection([d.lon, d.lat])[0];
        })
        .attr("cy", function(d) {
          return projection([d.lon, d.lat])[1];
        })
        .attr("r", function(d) {
          return bubbleScale_size(d.SLS_PER_PATIENT)
        } );


        circles_text = svg.selectAll("text.circle-text").data(chart_data, keyFn);

        circles_text
          .enter()
          .append("text")
          .attr("class", "circle-text")
          .attr("fill", "#fff")
          .attr("opacity", "1.0");

        circles_text.exit().remove();

        circles_text
        .attr("x", function(d) {
          return projection([d.lon, d.lat])[0] + 15;
        })
        .attr("y", function(d) {
          return projection([d.lon, d.lat])[1];
        })
        .style("fill", "white")
        .style("font-size", "12px")
        .text( function(d) {return d.GEO_CITY} );


}
