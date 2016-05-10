// ---------------------------------------------------------
// ---  Generate aggregations needed for this symphony_data


var copayanalysis_data = d3.nest()
  .key(function(d)
  { return d.TC_NAME + "|" + d.SUB_TC_NAME + "|" + d.SGMNT + "|" + d.RX_FILL_YYYYQTR + "|" + d.MNFCTRR + "|" + d.DRUG_NAME  + "|" + d.GEO_STATE + "|" + d.GEO_CITY;
  })
  .rollup(function(v) {
    return {
      PYR_SLS_AMT: d3.sum(v, function(d) {
        return d.WAC_PER_UNIT > 0 ? d.PYR_SLS_AMT : 0.0;
      }),
      PYR_PAT_CNT: d3.sum(v, function(d) {
        return d.WAC_PER_UNIT > 0 ? d.PYR_PAT_CNT : 0.0;
      }),
      COPAY: d3.sum(v, function(d) {
        return d.WAC_PER_UNIT > 0 ? (d.PYR_SLS_AMT/d.WAC_PER_UNIT) * d.OOP_UNIT : 0.0;
      })

    };
  })
  .map(symphony_data);

var dd = d3.entries(copayanalysis_data);


copayanalysis_data = dd.map(function(d) {
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
    PYR_SLS_AMT: d.value.PYR_SLS_AMT,
    PYR_PAT_CNT: d.value.PYR_PAT_CNT,
    COPAY: d.value.COPAY };

});


// ------------------------------------------
// --- Global variables: BEGIN
var TC_NAME = "ALL";
var SUB_TC_NAME = "ALL";
var SGMNT = "ALL";
var MNFCTRR = "ALL";
var DRUG_NAME = "ALL";

var unique_SUBTC = ["ALL"];
var unique_TC = ["ALL"];
var unique_MNFCTRR = ["ALL"];
var unique_DRUG_NAME = ["ALL"];
var unique_SGMNT = ["ALL"];

var barwidth = 8;
var maxHeight = 100;

var chart_data;
var filtered_copayanalysis_data;
var svg;
var chart;
var tip;
var titles;

var vis;
var projection;


var svgWidth = document.getElementById("copayanalysis").offsetWidth;

var svgHeight = 500;
var maxh = svgHeight * 0.7;
var maxw = svgWidth * 0.9;

var curFormat = d3.format("$,.2f");
var keyFn = function(d) {
  return d.key
};


// --- Global variables: END
// ------------------------------------------



// ------------------------------------------
// --- DATE SLIDER:  BEGIN

var unique_dates = uniques(copayanalysis_data.map(function(d) {
  return d.RX_FILL_YYYYQTR;
}));

unique_dates.sort();

var sliderWidth = document.getElementById("dateslider").offsetWidth;

var RX_FILL_YYYYQTR_MIN = unique_dates[0];
var RX_FILL_YYYYQTR_MAX = unique_dates[ (unique_dates.length-1) ];

d3.select("#dateslider").call(d3.slider().axis(true).value([RX_FILL_YYYYQTR_MIN, RX_FILL_YYYYQTR_MAX]).tickValues(unique_dates).on("slideend", function(value)
{

    RX_FILL_YYYYQTR_MIN = value[ 0 ];
    RX_FILL_YYYYQTR_MAX =  value[ 1 ];

    update_copayanalysis();

}));

// --- DATE SLIDER:  END
// ------------------------------------------


// ------------------------------------------
// ---  THERAPUETIC CLASS DROP DOWN:  BEGIN

unique_TC = unique_TC.concat(uniques(copayanalysis_data.map(function(d) {
  return d.TC_NAME;
})));

var TC_select = d3.select("#dropDown_TC").append("select").attr("width", "20%").on("change", function() {
  TC_NAME = d3.select(this).property('value');

  SUB_TC_NAME = "ALL";
  MNFCTRR = "ALL";
  DRUG_NAME = "ALL";

  update_copayanalysis();

  unique_SUBTC = ["ALL"];

  if (TC_NAME != "ALL") {
    unique_SUBTC = unique_SUBTC.concat(uniques(filtered_copayanalysis_data.map(function(d) {
      return d.SUB_TC_NAME;
    })));
  };

  SUBTC_options = SUBTC_select.selectAll("option").data(unique_SUBTC, function(d) {
    return d;
  });

  SUBTC_options.enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  SUBTC_options.exit().remove();

  unique_MNFCTRR = ["ALL"];

  MNFCTRR_options =  MNFCTRR_select.selectAll("option").data(unique_MNFCTRR , function(d) {
    return d;
  });

  MNFCTRR_options.enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  MNFCTRR_options.exit().remove();


  unique_DRUG_NAME = ["ALL"];

  DRUG_NAME_options =  DRUG_NAME_select.selectAll("option").data(unique_DRUG_NAME, function(d) {
    return d;
  });

  DRUG_NAME_options.enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  DRUG_NAME_options.exit().remove();


});

var TC_options = TC_select.selectAll("option")
  .data(unique_TC, function(d) {
    return d;
  })
  .enter()
  .append("option")
  .text(function(d) {
    return d;
  })
  .attr("value", function(d) {
    return d;
  });

// ---  THERAPUETIC CLASS DROP DOWN:  END
// ------------------------------------------


// ------------------------------------------
// ---  THERAPUETIC SUB CLASS DROP DOWN:  BEGIN

var SUBTC_select = d3.select("#dropDown_SUBTC").append("select").attr("width", "20%").on("change", function() {
  SUB_TC_NAME = d3.select(this).property('value');
  MNFCTRR = "ALL";

  update_copayanalysis();


  unique_MNFCTRR = ["ALL"];

  if (SUB_TC_NAME != "ALL") {
    unique_MNFCTRR = unique_MNFCTRR.concat(uniques(filtered_copayanalysis_data.map(function(d) {
      return d.MNFCTRR ;
    })));
  };

  MNFCTRR_options =  MNFCTRR_select.selectAll("option").data(unique_MNFCTRR , function(d) {
    return d;
  });

  MNFCTRR_options.enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  MNFCTRR_options.exit().remove();

  unique_DRUG_NAME = ["ALL"];

  DRUG_NAME_options =  DRUG_NAME_select.selectAll("option").data(unique_DRUG_NAME, function(d) {
    return d;
  });

  DRUG_NAME_options.enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  DRUG_NAME_options.exit().remove();



});

var SUBTC_options = SUBTC_select.selectAll("option")
  .data(unique_SUBTC, function(d) {
    return d;
  })
  .enter()
  .append("option")
  .text(function(d) {
    return d;
  })
  .attr("value", function(d) {
    return d;
  });

// ---  THERAPUETIC SUB CLASS DROP DOWN:  END
// ------------------------------------------


// ------------------------------------------
// ---  SEGMENT DROP DOWN:  BEGIN

var unique_SGMNT = ["ALL"];
unique_SGMNT = unique_SGMNT.concat(uniques(copayanalysis_data.map(function(d) {
  return d.SGMNT;
})));

var SGMNT_select = d3.select("#dropDown_SEGMENT").append("select").attr("width", "20%").on("change", function() {
  SGMNT = d3.select(this).property('value');
  update_copayanalysis();
});

var SGMNT_options = SGMNT_select.selectAll("option")
  .data(unique_SGMNT, function(d) {
    return d;
  })
  .enter()
  .append("option")
  .text(function(d) {
    return d;
  })
  .attr("value", function(d) {
    return d;
  });


// ---  SEGMENT DROP DOWN:  END
// ------------------------------------------


// ------------------------------------------
// ---  MANUFACTURER DROP DOWN:  BEGIN

var MNFCTRR_select = d3.select("#dropDown_MANU").append("select").attr("width", "20%").on("change", function() {
  MNFCTRR = d3.select(this).property('value');
  DRUG_NAME = "ALL";

  update_copayanalysis();


  unique_DRUG_NAME = ["ALL"];

  if (MNFCTRR != "ALL") {
    unique_DRUG_NAME = unique_DRUG_NAME.concat(uniques(filtered_copayanalysis_data.map(function(d) {
      return d.DRUG_NAME ;
    })));
  };

  DRUG_NAME_options =  DRUG_NAME_select.selectAll("option").data(unique_DRUG_NAME , function(d) {
    return d;
  });

  DRUG_NAME_options.enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  DRUG_NAME_options.exit().remove();

});

var MNFCTRR_options = MNFCTRR_select.selectAll("option")
  .data(unique_MNFCTRR, function(d) {
    return d;
  })
  .enter()
  .append("option")
  .text(function(d) {
    return d;
  })
  .attr("value", function(d) {
    return d;
  });

// ---  MANUFACTURER DROP DOWN:  END
// ------------------------------------------

// ------------------------------------------
// ---  BRAND DROP DOWN:  BEGIN

var DRUG_NAME_select = d3.select("#dropDown_BRAND").append("select").attr("width", "20%").on("change", function() {
  DRUG_NAME = d3.select(this).property('value');
  update_copayanalysis();
});

var DRUG_NAME_options = DRUG_NAME_select.selectAll("option")
  .data(unique_DRUG_NAME, function(d) {
    return d;
  })
  .enter()
  .append("option")
  .text(function(d) {
    return d;
  })
  .attr("value", function(d) {
    return d;
  });

// ---  BRAND DROP DOWN:  END
// ------------------------------------------


function set_chart_data(datval, tc_name) {

  // Allow for an ALL option from the drop dropDown_SEGMENT

  var fields = ["TC_NAME", "SUB_TC_NAME", "SGMNT", "MNFCTRR", "DRUG_NAME"];
  var vals = [TC_NAME, SUB_TC_NAME, SGMNT, MNFCTRR, DRUG_NAME  ];
  var datafilter = "";
  vals.forEach(function(i, idx) {
    if (i != "ALL") {
      datafilter = datafilter + "d." + fields[idx] + " == " + fields[idx] + " && ";
    }
  });

  datafilter = datafilter + " d.RX_FILL_YYYYQTR >= RX_FILL_YYYYQTR_MIN && ";
  datafilter = datafilter + " d.RX_FILL_YYYYQTR <= RX_FILL_YYYYQTR_MAX  ";

  filtered_copayanalysis_data = copayanalysis_data.filter(function(d) {
    return eval(datafilter.slice());
  });

  var rollup_txt = "d3.nest().key(function(d) {return d.GEO_STATE + '|' + d.GEO_CITY;}).rollup(function(v) {return{";

  var measures = ["PYR_SLS_AMT", "PYR_PAT_CNT", "COPAY"];
  var aggs = ["sum", "mean", "sum"];

  measures.forEach(function(m,idx){
        rollup_txt = rollup_txt + m + ": d3." + aggs[idx] + "(v, function(d) { return d." + m + ";}), "
  })



  rollup_txt = rollup_txt.slice(0,-2) + "};}).map(filtered_copayanalysis_data);";

  var chart_data1 = eval(rollup_txt);

  chart_data1 = d3.entries(chart_data1).map(function(d, idx) {
    return {
      key: d.key,
      PYR_SLS_AMT: d.value.PYR_SLS_AMT,
      PYR_PAT_CNT: d.value.PYR_PAT_CNT,
      COPAY: d.value.COPAY
    };
  });



  fields = ["TC_NAME", "SUB_TC_NAME", "SGMNT"];
  vals = [TC_NAME, SUB_TC_NAME, SGMNT ];
  datafilter = "";
  vals.forEach(function(i, idx) {
    if (i != "ALL") {
      datafilter = datafilter + "d." + fields[idx] + " == " + fields[idx] + " && ";
    }
  });

  datafilter = datafilter + " d.RX_FILL_YYYYQTR >= RX_FILL_YYYYQTR_MIN && ";
  datafilter = datafilter + " d.RX_FILL_YYYYQTR <= RX_FILL_YYYYQTR_MAX  ";

  filtered_copayanalysis_data2 = copayanalysis_data.filter(function(d) {
    return eval(datafilter.slice());
  });

  // Now do the roll-up across manufacturers and brands
  // need to be careful to take the average after rollup
  // over the number of unique manufactures if only a manufacturers
  // is selected or over all unique brands and manufactures if
  // both a brand and manufacture is selected

  var normalizer = 1.0;

  if (DRUG_NAME == "ALL" &&  MNFCTRR !="ALL"  )
  {
    var uniquevalues = uniques(filtered_copayanalysis_data2.map(function(d) {
      return d.MNFCTRR;
    }));
    normalizer = uniquevalues.length;

  } else if  (DRUG_NAME != "ALL" &&  MNFCTRR !="ALL"  ) {
    var uniquevalues = uniques(filtered_copayanalysis_data2.map(function(d) {
      return d.MNFCTRR + "|" + d.DRUG_NAME;
    }));
    normalizer = uniquevalues.length;
  } else {
    normalizer = 1.0;
  }

  rollup_txt = "d3.nest().key(function(d) {return d.GEO_STATE + '|' + d.GEO_CITY;}).rollup(function(v) {return{";

  measures.forEach(function(m,idx){
        rollup_txt = rollup_txt + m + "_ALL : d3." + aggs[idx] + "(v, function(d) { return d." + m + ";}), "
  })
  rollup_txt = rollup_txt.slice(0,-2) + "};}).map(filtered_copayanalysis_data2);";

  var chart_data2 = eval(rollup_txt);

  chart_data2 = d3.entries(chart_data2).map(function(d, idx) {
    return {
      key: d.key,
      PYR_SLS_AMT_ALL: d.value.PYR_SLS_AMT_ALL,
      PYR_PAT_CNT_ALL: d.value.PYR_PAT_CNT_ALL,
      COPAY_ALL: d.value.COPAY_ALL / normalizer
    };
  });


  // Now join chart_data1 and chart_data1 based on the key values
  chart_data = [];

  for (var i in chart_data1) {
      var obj = {   key: chart_data1[i].key,
                    PYR_SLS_AMT: chart_data1[i].PYR_SLS_AMT,
                    PYR_PAT_CNT: chart_data1[i].PYR_PAT_CNT,
                    COPAY: chart_data1[i].COPAY };

      for (var j in chart_data2)
      {
         if (chart_data1[i].key == chart_data2[j].key)
         {
             obj.PYR_SLS_AMT_ALL = chart_data2[j].PYR_SLS_AMT_ALL;
             obj.PYR_PAT_CNT_ALL = chart_data2[j].PYR_PAT_CNT_ALL;
             obj.COPAY_ALL = chart_data2[j].COPAY_ALL;
         }
       }

      // Add the lon and lat values for each of the cities

      for (var k in cities)
      {
          var geos = chart_data1[i].key.split("|");
          var city = geos[1].toUpperCase();

          if ( city == cities[k].place.toUpperCase() )
          {

            obj.lon = cities[k].lon;
            obj.lat = cities[k].lat;
          }

      }
       chart_data.push(obj);
  }

   chart_data = d3.entries(chart_data).map(function(d, idx) {

    var dims = d.value.key.split("|");

    return {
      key: d.value.key + "|" + TC_NAME + "|" + SUB_TC_NAME + "|" + SGMNT+ "|" + MNFCTRR+ "|" + DRUG_NAME ,
      GEO_STATE: dims[0],
      GEO_CITY: dims[1],

      PYR_SLS_AMT: d.value.PYR_SLS_AMT,
      PYR_SLS_AMT_ALL: d.value.PYR_SLS_AMT_ALL,
      PYR_PAT_CNT: d.value.PYR_PAT_CNT,
      PYR_PAT_CNT_ALL: d.value.PYR_PAT_CNT_ALL,
      COPAY: d.value.COPAY,
      COPAY_ALL: d.value.COPAY_ALL,
      DELTA_COPAY:  Math.abs( d.value.COPAY - d.value.COPAY_ALL),
      lon: d.value.lon,
      lat: d.value.lat

    };

  })
}




function init_copayanalysis() {


  svg = d3.select("#copayanalysis").append("svg").attr("width", svgWidth).attr("height", svgHeight)

  svg.append("svg:rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("stroke", "none")
    .attr("fill", "none")

  svg.append("svg:g")
    .attr("id", "geochart")
    .attr("transform", "translate(70,20)")

  vis = d3.select("#geochart");

  // D3 Projection
  projection = d3.geo.albersUsa()
				   .translate([svgWidth/2, svgHeight/2])    // translate to center of screen
				   .scale([1000]);          // scale things down so see entire US

           // Define path generator
  var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
		  	 .projection(projection);  // tell path generator to use albersUsa projection


  svg.selectAll("path")
         	.data(states.features)
         	.enter()
         	.append("path")
         	.attr("d", path)
         	.style("stroke", "#fff")
         	.style("stroke-width", "1")
         	.style("fill", "#666");


};

function update_copayanalysis() {


  set_chart_data();

  tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {

      // tttext = "<p><center><span class='tip_txt_style0'>" + MNFCTRR + "</span></center></p>";
      // tttext = tttext + "<p><center><span class='tip_txt_style0'>" + DRUG_NAME + "</span></center></p>";
      tttext = "<p>Sales (" + MNFCTRR + ": " + DRUG_NAME + "): <span class='tip_txt_style'>" + curFormat(d.PYR_SLS_AMT) + "</span></p>";
      tttext = tttext + "<p>Sales (Region): <span class='tip_txt_style'>" + curFormat(d.PYR_SLS_AMT_ALL) + "</span></p>";
      tttext = tttext + "<p>CoPay (" + MNFCTRR + ": " + DRUG_NAME + "): <span class='tip_txt_style'>" + curFormat(d.COPAY) + "</span></p>";
      tttext = tttext + "<p>CoPay (Region): <span class='tip_txt_style'>" + curFormat(d.COPAY_ALL) + "</span></p>";
      // tttext = tttext + "<p>Delta CoPay (Region): <span class='tip_txt_style'>" + curFormat(d.DELTA_COPAY) + "</span></p>";
      return tttext;

    });


    // minCoPay = d3.min(chart_data, function(d) {
    //   return d.COPAY;
    // });
    //
    // var maxCoPay1 = d3.max(chart_data, function(d) {
    //   return d.COPAY_ALL;
    // });
    //
     var maxDELTA_COPAY = d3.max(chart_data, function(d) {
       return d.DELTA_COPAY;
     });

     var maxGrossSales = d3.max(chart_data, function(d) {
       return d.PYR_SLS_AMT;
     });

    // var maxCoPay = (maxCoPay1 > maxCoPay2) ? maxCoPay1 : maxCoPay2;

    if (maxDELTA_COPAY == 0.0) {
      var bubbleScale_color = function(x) { return "#336600";};
    } else {
          var bubbleScale_color = d3.scale.quantize().domain([0,maxDELTA_COPAY]).range(["#336600", "#ffcc00", "#990000"]);
    }

    var bubbleScale_size = d3.scale.linear().domain([0,maxGrossSales]).range([5,25])

    //var barscale = d3.scale.linear().domain([0, maxCoPay]).range([maxHeight,0]);


      // Add Overlay for tooltips bullets

    // bars_copay = svg.selectAll("rect.bar-copay").data(chart_data, keyFn);
    //   //
    //   // update the bullets
    //   bars_copay
    //     .enter()
    //     .append("svg:rect")
    //     .attr("class", "bar-copay")
    //     .attr("fill", "#ffe600")
    //     .attr("opacity", "0.8");
    //
    //   bars_copay.exit().remove();

      // bars
      //   .on('mouseover', tip.show)
      //   .on('mouseout', tip.hide)
      //   .call(tip);

    // bars_copay =  svg.selectAll("rect.bar-copay").data(chart_data, keyFn);
    //
    // bars_copay.enter()
    // .append("svg:rect")
    // .attr("class", "bar-copay")
    // .attr("fill", "#ffe600")
    // .attr("opacity", "0.8");
    //
    // bars_copay.exit()
    //     .transition()
    //     .duration(300)
    //     .ease("exp")
    //     .attr("height", 0)
    //     .remove();
    //
    // bars_copay.transition()
    // .duration(300)
    // .ease("exp")
    //         .style("opacity", "0.8")
    //         .attr("x", function(d) {
    //          return projection([d.lon, d.lat])[0] - barwidth;
    //        })
    //        .attr("y", function(d) {
    //          return projection([d.lon, d.lat])[1] - maxHeight + barscale(d.COPAY);
    //        })
    //        .attr("width", barwidth)
    //        .attr("height", function(d, i) {
    //          return maxHeight - barscale(d.COPAY);
    //
    //        })
    //        ;
    //
    //  bars_copay_all =  svg.selectAll("rect.bar-copay-all").data(chart_data, keyFn);
    //
    //  bars_copay_all.enter()
    //  .append("svg:rect")
    //  .attr("class", "bar-copay-all")
    //  .attr("fill", "#333")
    //  .attr("opacity", "0.8");
    //
    //  bars_copay_all.exit()
    //      .transition()
    //      .duration(300)
    //      .ease("exp")
    //      .attr("height", 0)
    //      .remove();
    //
    //  bars_copay_all.transition()
    //  .duration(300)
    //  .ease("exp")
    //          .style("opacity", "0.8")
    //          .attr("x", function(d) {
    //           return projection([d.lon, d.lat])[0];
    //         })
    //         .attr("y", function(d) {
    //           return projection([d.lon, d.lat])[1] - maxHeight + barscale(d.COPAY_ALL);
    //         })
    //         .attr("width", barwidth)
    //         .attr("height", function(d, i) {
    //           return maxHeight - barscale(d.COPAY_ALL);
    //
    //         })
    //         ;



      circles = svg.selectAll("circle.circle-copay").data(chart_data, keyFn);
        //
        // update the bullets
        circles
          .enter()
          .append("svg:circle")
          .attr("class", "circle-copay")
          .attr("fill", function(d) { return bubbleScale_color(d.DELTA_COPAY)} )
          .attr("opacity", "0.7");

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
          return bubbleScale_size(d.PYR_SLS_AMT)
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
          return projection([d.lon, d.lat])[0] + 2*barwidth;
        })
        .attr("y", function(d) {
          return projection([d.lon, d.lat])[1];
        })
        .style("fill", "white")
        .style("font-size", "12px")
        .text( function(d) {return d.GEO_CITY} );
        // .attr("height", function(d, i) {
        //   //return maxHeight - barscale(d.COPAY);
        //   return barscale(d.COPAY);
        // })

  // var xScale = d3.scale.ordinal()
  //   .domain(chart_data.map(function(d) {
  //     return d.title1;
  //   }))
  //   .rangeRoundBands([0, maxw], 0.5, 1.5);
  //
  // var xAxis = d3.svg.axis().scale(xScale).orient("top");


  // var yScale = d3.scale.linear()
  //   .domain([0, d3.max(chart_data, function(d) {
  //     return d.wac;
  //   })])
  //   .range([maxh, 0]);
  //
  // var yAxis = d3.svg.axis().scale(yScale).orient("left");



  // Add Overlay for tooltips bullets

  // overlay_bullets = vis.selectAll("rect.bar-overlay").data(chart_data, keyFn);
  // //
  // // update the bullets
  // overlay_bullets.enter()
  //   .append("svg:rect")
  //   .attr("class", "bar-net")
  //   .attr("fill", "#fff")
  //   .attr("opacity", "0.0");
  //
  // //d3.transition(vis).selectAll("rect.bar-overlay");
  //
  // overlay_bullets.on('mouseover', tip.show)
  //   .on('mouseout', tip.hide);
  //
  // overlay_bullets.call(tip);
  // overlay_bullets.exit().remove();
  //
  // overlay_bullets
  //   .attr("x", function(d) {
  //     return xScale(d.title1);
  //   })
  //   .attr("y", function(d) {
  //     return yScale(d.wac);
  //   })
  //   .attr("width", xScale.rangeBand())
  //   .attr("height", function(d, i) {
  //     return maxh - yScale(d.wac);
  //   });



  // d3.transition(vis)
  //   .select('.x.plotaxis')
  //   .call(xAxis)
  //   .selectAll("text")
  //   .attr("transform", "rotate(-90)translate(-10,0)")
  //   .attr("font-size", "12px")
  //   .style("text-anchor", "end")
  //   .style("alignment-baseline", "text-before-edge");
  //
  // d3.transition(vis)
  //   .select('.y.plotaxis')
  //   .call(yAxis)
  //   .selectAll("text")
  //   .text(function(d) {
  //     return "$" + d;
  //   })
  //   .attr("transform", "translate(-5,0)")
  //   .attr("font-size", "12px")
  //   .style("text-anchor", "end");

}


init_copayanalysis();
