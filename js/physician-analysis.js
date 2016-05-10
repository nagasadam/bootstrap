// ---------------------------------------------------------
// ---  Generate aggregations needed for this symphony_data


var pyanalysis_data = d3.nest()
.key(function(d)
  { return d.TC_NAME + "|" + d.SUB_TC_NAME + "|" + d.SGMNT + "|" + d.RX_FILL_YYYYQTR + "|" + d.MNFCTRR + "|" + d.DRUG_NAME  + "|" + d.GEO_STATE + "|" + d.GEO_MSA + "|" + d.PHSYCN_ID + "|" + d.PYSCN_NAME;
  })
  .rollup(function(v) {
    return {
      PHYS_PAT_CNT: d3.sum(v, function(d) {
        return d.PHYS_PAT_CNT > 0 ? d.PHYS_PAT_CNT : 0.0;
      }),
      PHYS_RX_CNT: d3.sum(v, function(d) {
        return d.PHYS_RX_CNT > 0 ? d.PHYS_RX_CNT : 0.0;
      })
    };
  })
  .map(physician_data);
// console.log(pyanalysis_data);
var dd = d3.entries(pyanalysis_data);

pyanalysis_data = dd.map(function(d) {
//console.log('D: '+JSON.stringify(d));
  var dims = d.key.split("|");
  return {
    TC_NAME: dims[0],
    SUB_TC_NAME: dims[1],
    SGMNT: dims[2],
    RX_FILL_YYYYQTR: dims[3],
    MNFCTRR: dims[4],
    DRUG_NAME: dims[5],
    GEO_STATE: dims[6],
    GEO_MSA: dims[7],
    PHSYCN_ID: dims[8],
    PYSCN_NAME: dims[9],
    PHYS_PAT_CNT: d.value.PHYS_PAT_CNT,
    PHYS_RX_CNT: d.value.PHYS_RX_CNT
}
});
// console.log(pyanalysis_data);
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
var filtered_physicians_data;
var svg;
var chart;
var tip;
var titles;

var vis;
var projection;


var svgWidth = document.getElementById("phyanalysis").offsetWidth;

var svgHeight = 500;
var maxh = svgHeight * 0.7;
var maxw = svgWidth * 0.9;

var keyFn = function(d) {
  return d.key
};



// --- Global variables: END
// ------------------------------------------



// ----- DATE SLIDER AND DROPDOWNS
// --- DATE SLIDER:  BEGIN

var unique_dates = uniques(pyanalysis_data.map(function(d) {
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

    update_phyanalysis();

}));

// --- DATE SLIDER:  END
// ------------------------------------------


// ------------------------------------------
// ---  THERAPUETIC CLASS DROP DOWN:  BEGIN

unique_TC = unique_TC.concat(uniques(pyanalysis_data.map(function(d) {
  return d.TC_NAME;
})));

var TC_select = d3.select("#dropDown_TC").append("select").attr("width", "20%").on("change", function() {
  TC_NAME = d3.select(this).property('value');

  SUB_TC_NAME = "ALL";
  MNFCTRR = "ALL";
  DRUG_NAME = "ALL";

  update_phyanalysis();

  unique_SUBTC = ["ALL"];

  if (TC_NAME != "ALL") {
    unique_SUBTC = unique_SUBTC.concat(uniques(filtered_physicians_data.map(function(d) {
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

  update_phyanalysis();


  unique_MNFCTRR = ["ALL"];

  if (SUB_TC_NAME != "ALL") {
    unique_MNFCTRR = unique_MNFCTRR.concat(uniques(filtered_physicians_data.map(function(d) {
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
unique_SGMNT = unique_SGMNT.concat(uniques(pyanalysis_data.map(function(d) {
  return d.SGMNT;
})));

var SGMNT_select = d3.select("#dropDown_SEGMENT").append("select").attr("width", "20%").on("change", function() {
  SGMNT = d3.select(this).property('value');
  update_phyanalysis();
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
// ---  MANUFACTURER (dropDown_MNFCTRR) DROP DOWN:  BEGIN

var MNFCTRR_select = d3.select("#dropDown_MNFCTRR").append("select").on("change", function() {
  MNFCTRR = d3.select(this).property('value');
  DRUG_NAME = "ALL";

  update_phyanalysis();


  unique_DRUG_NAME = ["ALL"];

  if (MNFCTRR != "ALL") {
    unique_DRUG_NAME = unique_DRUG_NAME.concat(uniques(filtered_physicians_data.map(function(d) {
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

var DRUG_NAME_select = d3.select("#dropDown_DRUG_NAME").append("select").on("change", function() {
  DRUG_NAME = d3.select(this).property('value');
  update_phyanalysis();
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


// ---  FUNCTIONS:  BEGIN
// ------------------------------------------

function set_chart_data(chartType) {
  var chartType = chartType;
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


  // This data also needed for the bubble force chart
  filtered_physicians_data = pyanalysis_data.filter(function(d) {
    return eval(datafilter.slice());
  });
// console.log(filtered_physicians_data);


var filtered_pyhsicians = d3.nest()
                        .key(function(d) {
                            return d.GEO_STATE + '|' + d.GEO_MSA + '&' + d.PHSYCN_ID + '|' + d.PYSCN_NAME;
                          })
                          .rollup(function(v) {
                            return {
                              PHYS_PAT_CNT: d3.sum(v, function(d) {
                                return d.PHYS_PAT_CNT > 0 ? d.PHYS_PAT_CNT : 0.0;
                              }),
                              PHYS_RX_CNT: d3.sum(v, function(d) {
                                return d.PHYS_RX_CNT > 0 ? d.PHYS_RX_CNT : 0.0;
                              })
                            };
                        }).map(filtered_physicians_data);



  bubble_chart_data_pyhsicians = d3.entries(filtered_pyhsicians).map(function(d, idx) {
    var dims = d.key.split("&");
    var name = dims[1].split("|");
    name = name[1].split(",");
    return {
      CITY: dims[0],
      PHYS_ID_NAME: dims[1],
      PHYS_FIRST_NAME: name[0],
      PHYS_LAST_NAME: name[1],
      PHYS_PAT_CNT: d.value.PHYS_PAT_CNT,
      PHYS_RX_CNT: d.value.PHYS_RX_CNT
    };
  });

  var chart_data_pyhsicians = d3.nest()
      .key(function(d) {
          return d.CITY;
        })
      .rollup(function(leaves) { return leaves.length; })
      .map(bubble_chart_data_pyhsicians);

      var chart_data_pyhsicians = d3.entries(chart_data_pyhsicians);


  // console.log(chart_data_pyhsicians);


  // Now add latitiude and longitudes
  chart_data = [];

  for (var i in chart_data_pyhsicians) {
      var obj = {   key: chart_data_pyhsicians[i].key,
                    PHYS_CNT: chart_data_pyhsicians[i].value
                  };
      // Add the lon and lat values for each of the cities

                    for (var k in cities)
                    {
                        var geos = chart_data_pyhsicians[i].key.split("|");
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
      key: d.value.key + "|" + TC_NAME + "|" + SUB_TC_NAME + "|" + SGMNT+ "|" + MNFCTRR+ "|" + DRUG_NAME,
      GEO_STATE: dims[0],
      GEO_MSA: dims[1],
      PHYS_CNT: d.value.PHYS_CNT,
      lon: d.value.lon,
      lat: d.value.lat
    };

  })

}

function init_copayanalysis() {

  svg = d3.select("#phyanalysis").append("svg").attr("width", svgWidth).attr("height", svgHeight)

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

function draw_bubblechart(location){

  set_chart_data();

// filter the selected city physicians
var cityPhysicians = bubble_chart_data_pyhsicians.filter(function (d) {
    return d.CITY === location;
});

    var maxRX = d3.max(cityPhysicians, function(d) {
           return d.PHYS_RX_CNT;
         });

    if (maxRX == 0.0) {
      var bubbleScale_color = function(x) { return "#336600";};
    } else {
          var bubbleScale_color = d3.scale.quantize().domain([0,maxRX]).range(["#CCCCCC", "#7fd1d5", "#990000", "#336600", "#ffcc00"]);
    }

    // var physName = function(idName){
    //   var idName = idName.split("|");
    //   var name = idName[1].split(",");
    //   return name[0] + " " + name[1];
    // }

    var diameter = 520;

    tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .html(function(d) {
        tttext =  "<p>Name: <span class='tip_txt_style'>" + d.PHYS_FIRST_NAME + " " + d.PHYS_LAST_NAME + "</span></p>";
        tttext = tttext + "<p>Number of Patients: <span class='tip_txt_style'>" + d.PHYS_PAT_CNT + "</span></p>";
        tttext = tttext + "<p>Number of Prescriptions: <span class='tip_txt_style'>" + d.PHYS_RX_CNT + "</span></p>";
      return tttext;

    });

     // create new pack layout
    var bubble = d3.layout.pack()
      .sort(null)
      .value(function(d){
        return d.PHYS_PAT_CNT;
      })
      .size([diameter, diameter]);
      //make sure to remove the bubbles before attaching the new one
    d3.select("svg#bubbles").remove();
     // select chart3 div and append svg canvas for graph
    var canvas = d3.select("#phyanalysis-bubbles").append("svg")
      .attr("id", "bubbles")
      .attr("width", diameter)
      .attr("height", diameter)
      .append("g");

     // should return array of nodes associated with data
     // computed position of nodes & graphical data for each node
    var nodes = bubble.nodes({children:cityPhysicians});

    var node = canvas.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
     // give nodes a class name for referencing
      .attr("class", "node")
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

      node.append("circle")
      .attr("r", function(d) { return d.r; })
      // this class category can be divided further
      .attr("class", function(d) { if ( d.r < 15 ){ return "small-bubble" } else { return "large-bubble"}; })
      .attr("fill", function(d) { return bubbleScale_color(d.PHYS_RX_CNT)} );



      node.append("text")
     .attr("text-anchor", "middle")
     .attr("alignment-baseline","baseline")
     .style("font-size", "10px")
     .text(function(d) {
        return d.PHYS_FIRST_NAME;
      });

     node.append("text")
     .attr("text-anchor", "middle")
     .attr("alignment-baseline","hanging")
     .style("font-size", "10px")
     .text(function(d) {
        return d.PHYS_LAST_NAME;
      });



      node.on('mouseover', tip.show).on('mouseout', tip.hide)
      .call(tip);

}

function update_phyanalysis() {

  set_chart_data();

  tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        tttext = "<p><center><span class='tip_txt_style0'>" + d.GEO_MSA + "</span></center></p>";
        tttext = tttext + "<p>Number of Physicians: <span class='tip_txt_style'>" + d.PHYS_CNT + "</span></p>";
      return tttext;

    });

    var maxPhysicianPopulation = d3.max(chart_data, function(d) {
       return d.PHYS_CNT;
     });

    var bubbleScale_size = d3.scale.linear().domain([0,maxPhysicianPopulation]).range([10,30]);



      circles = svg.selectAll("circle.circle-physicians").data(chart_data, keyFn);
        //
        // update the bullets
        circles
          .enter()
          .append("svg:circle")
          .attr("id", function(d) { return d.GEO_STATE + '|' +  d.GEO_MSA } )
          .attr("class","circle-physicians")
          .attr("fill", "#336600")
          .attr("opacity", "0.7");

         circles.exit().remove();


        circles.on('mouseover', tip.show).on('mouseout', tip.hide)
        .call(tip);


        // On Click, we want to add data to the array and chart
        circles.on("click", function() {

          var coords = d3.mouse(this);
          var location = $(this).attr("id");
          var cityState = location.split("|");
          cityState = cityState[1] + ", " + cityState[0];

          if($(".map").hasClass("out")=== false){
            $(".map").toggleClass("out");
            $(".icon.icon-enlarge").css("display","block");
            $(".d3-tip").toggleClass("static");
          }

          $(this).toggleClass("active").siblings().removeClass("active");

          $("#phyanalysis-bubbles h1").text(cityState).css("display","block").css("color","white");

          d3.selectAll("svg#bubbles").transition().style("opacity", 0).remove();
          draw_bubblechart(location);

          //make a call to bubblechart function

        });
       //console.log("outside the function:"+locationValue());

        circles
        .attr("cx", function(d) {
          return projection([d.lon, d.lat])[0];
        })
        .attr("cy", function(d) {
          return projection([d.lon, d.lat])[1];
        })
        .attr("r", function(d) {
          return bubbleScale_size(d.PHYS_CNT)
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
        .text( function(d) {return d.GEO_MSA} );

}
$(".icon.icon-enlarge").on("click", function(){
  $("#phyanalysis-bubbles h1").hide();
  $(".circle-physicians.active").removeClass("active")
  d3.selectAll("svg#bubbles").transition().style("opacity", 0).remove();
  $(".map").toggleClass("out");
  $(this).css("display","none");
  $(".d3-tip").toggleClass("static");
  $("text.circle-text").css("font-size", "12px");
})

init_copayanalysis();

