



// ------------------------------------------
// --- Global variables: BEGIN
var TC_NAME = "ALL";
var SUB_TC_NAME = "ALL";
var SGMNT = "ALL";

var unique_SUBTC = ["ALL"];
var unique_TC = ["ALL"];
var unique_Brands = [];

var chart_data;
var svg;
var chart;
var tip;
var titles;

var vis;
var bullets;

var max_wac;
var mean_gtn;
var mean_oop;

var new_data;
var old_data;
var area;

var xScale;
var yScale;

var color = d3.scale.category20b();
var colordomain = ["#999999", "#ffe600", "#ffffff"];
var opacity_val = "0.4";

var svgWidth = document.getElementById("mainvis").offsetWidth;

var svgHeight = 500;
var maxh = svgHeight * 0.7;
var maxw = svgWidth * 0.9;

var nodemap = {};

var curFormat = d3.format("$,.2f");

var curFormat2 = d3.format("$,.0f");
var keyFn = function(d) {
  return d.key
};

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};


// --- Global variables: END
// ------------------------------------------



// ------------------------------------------
// ---  BRAND vs Manufacturer TOGGLE:  BEGIN



var w= svgWidth;
var h= 30;
var svg_btoggle = d3.select("#brandtoggle")
                        .append("svg")
                        .attr("width",w)
                        .attr("height",h);

var allchoices = svg_btoggle.append("g")
                    .attr("id","allchoices");

var defaultColor= "#ffffff";
var hoverColor= "#333333";
var pressedColor= "#ffe600";

var boptions = ["MNFCTRR","DRUG_NAME"];
var blabels = ["BioPharma Company", "Product Name"];
var AXIS_LABELS = boptions[0];

var offset1 = svgWidth/2 ;
var offset2 = 0;
var legendBlockWidth1 = 15;
var textMargin1 = 15;

var initcolors = [pressedColor, defaultColor];

var buttonChoices= allchoices.selectAll("g.button")
                            .data(blabels)
                            .enter()
                            .append("g")
                            .attr("class","button")
                            .style("cursor","pointer")
                            .attr("value", function(d,i){ return i; })
                            .each(function(key, i) {

                              var item = d3.select(this);
                              var text = item.append('text')
                                .attr('transform',
                                  'translate(' + [
                                    legendBlockWidth1 + textMargin1,
                                    legendBlockWidth1
                                  ].join(',') + ')'
                                )
                                .style("fill", "white")
                                .text(key);

                              item.append('circle')
                                .attr({
                                  r: legendBlockWidth1/2,
                                  cx: legendBlockWidth1/2,
                                  cy: legendBlockWidth1/2 + 3,
                                  fill: initcolors[i] ,
                                  stroke: initcolors[i]

                                });

                              item.attr('transform', function() {
                                return 'translate(' + offset2 + ',0)';
                              });
                              // Update the offset
                              offset2 += text.node().getBoundingClientRect().width + legendBlockWidth1 + textMargin1 * 3;

                            })


                            .on("click",function(d,i) {
                                updateButtonColors(d3.select(this), d3.select(this.parentNode))

                                AXIS_LABELS = boptions[d3.select(this).attr('value')];
                                update_patientswitching();
                            })
                            .on("mouseover", function() {
                                if (d3.select(this).select("circle").attr("fill") != pressedColor) {
                                    d3.select(this)
                                        .select("circle")
                                        .attr("fill",hoverColor);
                                }
                            })
                            .on("mouseout", function() {
                                if (d3.select(this).select("circle").attr("fill") != pressedColor) {
                                    d3.select(this)
                                        .select("circle")
                                        .attr("fill",defaultColor);
                                }
                            });

d3.select("#allchoices").attr("transform","translate(" + (offset1 - offset2/2) + ",0)")



function updateButtonColors(button, parent) {
    parent.selectAll("circle")
             .attr("fill",defaultColor)

    button.select("circle")
            .attr("fill",pressedColor)
}

// --- BRAND vs Manufacturer  TOGGLE:  BEGIN
// ------------------------------------------

// ------------------------------------------
// ---  THERAPUETIC CLASS DROP DOWN:  BEGIN

unique_TC = unique_TC.concat(uniques(patient_switching_DRUG_NAME_data.map(function(d) {
  return d.TC_NAME;
})));

var TC_select = d3.select("#dropDown_TC").append("select").attr("width", "20%").on("change", function() {
  TC_NAME = d3.select(this).property('value');

  SUB_TC_NAME = "ALL";

  update_patientswitching();

  unique_SUBTC = ["ALL"];

  if (TC_NAME != "ALL") {
    unique_SUBTC = unique_SUBTC.concat(uniques(chart_data.map(function(d) {
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
  update_patientswitching();
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
unique_SGMNT = unique_SGMNT.concat(uniques(patient_switching_DRUG_NAME_data.map(function(d) {
  return d.SGMNT;
})));

var SGMNT_select = d3.select("#dropDown_SEGMENT").append("select").attr("width", "20%").on("change", function() {
  SGMNT = d3.select(this).property('value');
  update_patientswitching();
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


function set_chart_data(datval, tc_name) {

  // Allow for an ALL option from the drop dropDown_SEGMENT

  var fields = ["TC_NAME", "SUB_TC_NAME", "SGMNT"];
  var vals = [TC_NAME, SUB_TC_NAME, SGMNT];
  var datafilter = "";
  vals.forEach(function(i, idx) {
    if (i != "ALL") {
      datafilter = datafilter + "d." + fields[idx] + " == " + fields[idx] + " && ";
    }
  });
  var select_chart_data = "";
  if ( TC_NAME == "ALL" && SUB_TC_NAME == "ALL" && SGMNT == "ALL")
  {
    select_chart_data = "patient_switching_" + AXIS_LABELS + "_data";
  } else {
    select_chart_data = "patient_switching_" + AXIS_LABELS + "_data.filter(function(d) {   return " + datafilter.slice(0,-4) + ";});"
  }

  chart_data = eval( select_chart_data );

  var tmpLinks= [];
  var tmpNodes = [];

  var tmpLinksText = [];

  var chart_data_cols =  Object.keys(chart_data[0]);
  var chart_dates = chart_data_cols.slice(-8);

  chart_data.forEach( function(x) {

    // for each pair of dates determine if we have a new node
    for (i = 0; i < (chart_dates.length-1); i++)
    {
      var source = x[chart_dates[i]];
      var target = x[chart_dates[i+1]];

       if (source == '') { source  = "Inactive";}
       if (target == '') { target  = "Inactive";}

        tmpNodes.push( chart_dates[i] + ":" + source  );
        tmpNodes.push( chart_dates[i+1] + ":" + target );

        tmpLinks.push(  chart_dates[i]  + ":" + source + "|" + chart_dates[i+1] + ":" + target );

    //   if ( (source != '')  )
    //   {
    //     tmpNodes.push( chart_dates[i] + ":" + source  )
    //
    //      if  (target != '')
    //       {
    //
    //         tmpLinks.push(  chart_dates[i]  + ":" + source + "|" + chart_dates[i+1] + ":" + target );
    //       }
    //       else {
    //         tmpNodes.push( chart_dates[i+1] + ":Exit" )
    //         tmpLinks.push(  chart_dates[i]  + ":" + source + "|" + chart_dates[i+1] + ":Exit" );
    //       }
    //   } else {
    //
    //     if (target != '')
    //     {
    //       tmpNodes.push( chart_dates[i] + ":Enter" )
    //       tmpLinks.push(  chart_dates[i]  + ":Enter|" + chart_dates[i+1] + ":" + target );
    //     }
    //   }
     }
  })

  var tmpNodes = uniques(tmpNodes.map(function(d) {
    return d;
  }));

  tmpNodes.sort();

  var nodes = [];
  tmpNodes.forEach( function(d,i) {

    var s_n = d.split(":");

    nodes.push( {"name": d,
                 "label": s_n[1],
                 "qtr": s_n[0],
                 "node": i ,
                 "color": color(s_n[1])})
  })

  var links = d3.nest()
    .key(function(d) {
      return d;
    })
    .rollup(function(v) {
      return {

        NUM_PATIENTS: d3.sum(v, function(d){
          return 1.0;
        })

      };
    })
    .map(tmpLinks);

    var dd = d3.entries(links);

    var links = dd.map(function(d) {

      var dims = d.key.split("|");

      if (tmpNodes.indexOf(dims[0]) > -1 && tmpNodes.indexOf(dims[1]) > -1)
      {
      return {
        source: tmpNodes.indexOf(dims[0]),
        target: tmpNodes.indexOf(dims[1]),
        value: d.value.NUM_PATIENTS
      }
    }
    });


    links.clean(undefined);

    links.sort(function(a, b) {
      return d3.ascending(a.source, b.source)
    });

    nodemap = { "nodes": nodes,
                "links": links};


}



function init_patientswitching() {

  set_chart_data();

  var svg = d3.select("#patientswitching").append("svg").attr("width", svgWidth).attr("height", svgHeight)

  svg.append("svg:rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("stroke", "none")
    .attr("fill", "none");

  svg.append("svg:g")
    .attr("id", "sankeychart")
    //.attr("transform", "translate(70,20)");

    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = svgWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom;

  vis = d3.select("#sankeychart");

  var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) ; };

    var sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(0)
        .size([width*.9, height]);

  var path = sankey.link();

  sankey
      .nodes(nodemap.nodes)
      .links(nodemap.links)
      .layout(0);


      var link = svg.append("g").selectAll(".link")
            .data(nodemap.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke-width", function(d) {
              return Math.max(.5, d.dy);
            })
            .sort(function(a, b) { return b.dy - a.dy; })
            .on("mouseover", linkmouseover)
            .on("mouseout", linkmouseout);

    link.append("title")
          .text(function(d) {

              var s_n = d.source.name.split(":");
              var s_t = d.target.name.split(":");

        	return s_n[1] + " → " +
                  s_t[1] + "\n" + format(d.value); });


    var node = vis.append("g").selectAll(".node")
                      .data(nodemap.nodes)
                    .enter().append("g")
                      .attr("class", "node")
                      .attr("transform", function(d) {
                		  return "translate(" + d.x + "," + d.y + ")"; })
                    .call(d3.behavior.drag()
                      .origin(function(d) { return d; })
                      .on("dragstart", function() {
                		  this.parentNode.appendChild(this); })
                      .on("drag", dragmove));

                      // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { return d.color })
        .on("mouseover", nodemouseover)
        .on("mouseout", nodemouseout)
        .on("click", onclick)
        .attr("cursor", "pointer");
      //  .append("title")
      //   .text(function(d) {
      //       var s_n = d.name.split(":");
  		//   return s_n[1] + "\n" + format(d.value); });


        node.append("text")
              .attr("x", -6)
              .attr("y", function(d) { return d.dy / 2; })
              .attr("dy", ".35em")
              .attr("text-anchor", "end")
              .attr("transform", null)
              .text(function(d) { return d.label; })
            .filter(function(d) { return d.x < width / 2; })
              .attr("x", 6 + sankey.nodeWidth())
              .attr("text-anchor", "start");


        function dragmove(d) {
               d3.select(this).attr("transform",
                   "translate(" + (
                   	   d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
                   	) + "," + (
                              d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
                       ) + ")");
               sankey.relayout();
               link.attr("d", path);
             }


             function linkmouseover(d) {
               d3.select(this)
                 .attr("stroke-opacity", .5);
             }

             function linkmouseout(d) {
               d3.select(this)
                 .attr("stroke-opacity", .05);
             }

             var status = null;

             function nodemouseover(d) {

               d3.select(this)
                 .attr("fill-opacity", .7);

              //  var desc;
              //  for (i = 0; i < clust.length; i++) {
              //    if (clust[i].name == d.name) {
              //      desc = clust[i].desc;
              //    }
              //  }
               d3.selectAll(".link")
                 .attr("id", function(i) {
                   if (i.source.node == d.node || i.target.node == d.node) {
                     status = "clicked";
                   } else {
                     status = null;
                   }
                   return status;
                 });

              //  $("#clustable").html(d.name);
              //  $("#pcount").html(format(d.value));
              //  $("#clusdesc").html(desc);
              //  $("#depart").html(d.departing + " of these players left the game in the following period.");
              //  $("#joined").html(d.joining + " new players joined the game into this cluster.");
              //  $("#instructions").html("Click on a node to explore the entire history of this player group.");
             }

             function nodemouseout(d) {
               d3.select(this)
                 .attr("fill-opacity", 1);

               d3.selectAll(".link")
                 .attr("id", "unclicked");

              //  $("#clustable").html("Mouse over a node to see cluster information");
              //  $("#pcount").html("");
              //  $("#clusdesc").html("");
              //  $("#depart").html("");
              //  $("#joined").html("");
              //  $("#instructions").html("");
             }


};



function onclick(d) {
  // d3.selectAll("#goback").remove();
  // d3.select("text").remove();
  // d3.selectAll("#months").remove();
  //
  // d3.selectAll(".link")
  //   .transition()
  //   .duration(500)
  //   .style("stroke-width", "1px")
  //   .remove();
  // d3.selectAll(".node")
  //   .attr("cursor", "default")
  //   .attr("fill-opacity", 0)
  //   .remove();
  // var data1 = 1;
  //
  // d3.select("svg")
  //   .append("text")
  //   .text("Back to Sankey")
  //   .attr("id", "goback")
  //   .attr("x", 840)
  //   .attr("y", 17)
  //   .style("margin-top", "-300px")
  //   .attr("font-family", "Pontano Sans")
  //   .attr("font-size", 15)
  //   .attr("fill", "blue")
  //   .attr("cursor", "pointer")
  //   .on("click", mainVis);
  //
  // d3.selectAll("#losses").transition().remove();
  // d3.selectAll("#values").transition().remove();
  //
  // svg.selectAll("text.months")
  //   .data(months)
  //   .enter()
  //   .append("text")
  //   .attr("class", "innerText")
  //   .attr("id", "months")
  //   .text(function(d) {
  //     return d.month
  //   })
  //   .attr("x", function(d, i) {
  //     return i * 89 - margin.left - 10
  //   })
  //   .attr("y", 20)
  //   .attr("transform",
  //     "translate(" + margin.left + "," + margin.top + ") scale(1,-1) translate(" + 0 + "," + margin.bottom + ")");
  //
  //
  //
  // d3.csv("data/clustclicked.csv", function(clustclick) {
  //
  //   console.log(colors[0].color);
  //   console.log(d3.keys(clustclick[0]));
  //   height = 470;
  //   x = d3.scale.ordinal().rangeRoundBands([0, width - margin.right - margin.left]);
  //   y = d3.scale.linear().domain([0, 2000]).range([0, height]);
  //   z = d3.scale.ordinal().range(["#c7f3d8", "#95d5af", "#53b67d", "#398b5c", "#c7bfce", "#a898b6", "#806b91", "#5d4a6c",
  //     "#332341", "#f3bd4e", "#5089a8"
  //   ]);
  //
  //   var clicks = clustclick;
  //   console.log(clicks);
  //   var clickfilt = clicks.filter(function(j) {
  //     return j.clicked.split("/")[0] == d.name & j.clicked.split("/")[1] == d.month;
  //   });
  //   var maps = ["Casual Forum", "Casual Losers", "Casual Winners", "Casual",
  //     "Moderate Miscellanea", "Moderate Farmers", "Moderate Losers", "Moderate Winners",
  //     "Moderate", "Forum", "Hardcore"
  //   ];
  //   // Transpose the data into layers by cause.
  //   var causes = d3.layout.stack()(["Casual Forum", "Casual Losers", "Casual Winners", "Casual",
  //     "Moderate Miscellanea", "Moderate Farmers", "Moderate Losers", "Moderate Winners",
  //     "Moderate", "Forum", "Hardcore"
  //   ].map(function(cause) {
  //     return clickfilt.map(function(d) {
  //       return {
  //         x: d.month,
  //         y: +d[cause]
  //       };
  //     });
  //   }));
  //
  //   // Compute the x-domain (by date) and y-domain (by top).
  //   x.domain(causes[0].map(function(d) {
  //     return d.x;
  //   }));
  //   y.domain([0, d3.max(causes[causes.length - 1], function(d) {
  //     return d.y + d.y0;
  //   })]);
  //
  //   for (i = 0; i++; i < colors.length) {
  //     if (d3.keys(clickfilt[0]) == colors.name) {
  //       return console.log(colors.color);
  //     } else {
  //       return console.log("nope");
  //     }
  //   }
  //
  //   // Add a group for each cause.
  //   var cause = svg.selectAll("g.cause")
  //     .data(causes)
  //     .enter().append("svg:g")
  //     .attr("class", "cause")
  //     .style("fill", function(d, i) {
  //       return z(i);
  //     });
  //   //.style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });
  //
  //   // Add a rect for each date.
  //   var rect = cause.selectAll("rect")
  //     .data(Object)
  //     .enter().append("svg:rect")
  //     .attr("x", function(d) {
  //       return x(d.x) * 1.185 + 38;
  //     })
  //     .attr("y", function(d) {
  //       return -y(d.y0) - y(d.y);
  //     })
  //     .attr("height", function(d) {
  //       return y(d.y);
  //     })
  //     .attr("width", 27)
  //     .attr("transform",
  //       "translate(" + -45 + "," + 0 + ") scale(1,-1) translate(" + 0 + "," + 0 + ")")
  //     .on("mouseover", function(d) {
  //       d3.select(this).attr("fill-opacity", 0.7);
  //       $("#onclick").html(d.y + " People");
  //     })
  //     .on("mouseout", function(d) {
  //       d3.select(this).attr("fill-opacity", 1);
  //       $("#onclick").html("");
  //     });
  //
  //   var axisScale = d3.scale.linear()
  //     .domain([d3.max(causes[causes.length - 1], function(d) {
  //       return d.y + d.y0;
  //     }), 0])
  //     .range([0, height]);
  //
  //   //Create the Axis
  //   var yAxis = d3.svg.axis()
  //     .scale(axisScale)
  //     .orient("left")
  //     .ticks(10);
  //
  //
  //   d3.selectAll(".axis").transition()
  //     .call(yAxis);

  };

function update_patientswitching() {


  set_chart_data();

 //  tip = d3.tip()
 //    .attr('class', 'd3-tip')
 //    .offset([-10, 0])
 //    .html(function(d) {
 //
 //      tttext = "<center><span class='tip_txt_style0'>" + d.title1 + "</span></center>";
 //      // tttext = tttext + "<p><center><span class='tip_txt_style1'>(" + SEL_UNIT +  ")</center></span>";
 //      tttext = tttext + "<p>SALES: <span class='tip_txt_style'>" + curFormat(d.SALES) + "</span></p>";
 //      // tttext = tttext + "<p>UNIT: <span class='tip_txt_style'>" + SEL_UNIT +  "</span>";
 //
 //      tttext = tttext + "<p>WAC: <span class='tip_txt_style'>" + curFormat(d.wac) + "</span>";
 //      tttext = tttext + "    Mean WAC: <span class='tip_txt_style'>" + curFormat(mean_wac) + "</span></p>";
 //      tttext = tttext + "<p>GTN: <span class='tip_txt_style'>" + curFormat(d.gtn) + "</span>";
 //      tttext = tttext + "    Mean GTN: <span class='tip_txt_style'>" + curFormat(mean_gtn) + "</span></p>";
 //      tttext = tttext + "<p>OOP: <span class='tip_txt_style'>" + curFormat(d.oop) + "</span>";
 //      tttext = tttext + "    Mean OOP: <span class='tip_txt_style'>" + curFormat(mean_oop) + "</span></p>";
 //      return tttext;
 //    });
 //
 //
 //    xScale = d3.scale.ordinal()
 //      .domain(chart_data.map(function(d) {
 //        return d.title1;
 //      }))
 //      .rangeBands([0, maxw],0.1);
 //
 //    // }))
 //    // .rangeRoundBands([0, maxw], 0.5, 1.5);
 //
 //     yScale = d3.scale.linear()
 //        .domain([0, d3.max(chart_data, function(d) {
 //          return d.wac;
 //        })])
 //        .range([maxh, 0]);
 //
 //
 //  var xAxis = d3.svg.axis().scale(xScale).orient("top");
 //  var yAxis = d3.svg.axis().scale(yScale).orient("left");
 //
 // vis.selectAll("path.area-chart")
 //      .data(new_data)
 //      .transition()
 //      .attr("d", area)
 //      .style("opacity",opacity_val)
 //      .attr("transform","translate(" + xScale.rangeBand()/2.0 + ",0)");
 //
 //
 //  // Add Overlay for tooltips bullets
 //
 //  overlay_bullets = vis.selectAll("rect.bar-overlay").data(chart_data, keyFn);
 //  //
 //  // update the bullets
 //  overlay_bullets
 //    .enter()
 //    .append("svg:rect")
 //    .attr("class", "bar-overlay")
 //    .attr("fill", "#fff")
 //    .attr("opacity", "0.0");
 //
 //  overlay_bullets.exit().remove();
 //
 //  overlay_bullets
 //    .on('mouseover', tip.show)
 //    .on('mouseout', tip.hide)
 //    .call(tip);
 //
 //  overlay_bullets
 //  .attr("x", function(d) {
 //    return xScale(d.title1);
 //  })
 //  .attr("y", function(d) {
 //    return yScale(d.wac);
 //  })
 //  .attr("width", xScale.rangeBand())
 //  .attr("height", function(d, i) {
 //    return maxh - yScale(d.wac);
 //  })
 //  ;
 //
 //    // add circles for the data points and a line connecting them
 //
 //    // Add line for the mean wac price
 //    mean_wac_line = vis.selectAll("line.wac-mean").data([mean_wac], function(d) {
 //      return d;
 //    });
 //
 //    mean_wac_line.enter()
 //      .append("svg:line")
 //      .attr("class", "wac-mean")
 //      .attr({
 //        x1: 0,
 //        y1: function(d) {
 //          return yScale(d);
 //        },
 //        x2: svgWidth,
 //        y2: function(d) {
 //          return yScale(d);
 //        }
 //      })
 //
 //    mean_wac_line.exit().remove();
 //
 //    // mean_wac_txt = vis.selectAll("text.wac-mean-txt").data([mean_wac], function(d) {
 //    //   return d;
 //    // });
 //    //
 //    // mean_wac_txt.enter()
 //    //   .append("svg:text")
 //    //   .attr("class", "wac-mean-txt")
 //    //   .attr("transform", "translate(" + (maxw-20) + ", " + (yScale(mean_wac) - 10) + ")")
 //    //   .text("MEAN WAC: " + curFormat(mean_wac))
 //    //   .style("text-anchor", "end");
 //    //
 //    // mean_wac_txt.exit().remove();
 //
 //  // Add line for the mean gtn price
 //  mean_gtn_line = vis.selectAll("line.gtn-mean").data([mean_gtn], function(d) {
 //    return d;
 //  });
 //
 //  mean_gtn_line.enter()
 //    .append("svg:line")
 //    .attr("class", "gtn-mean")
 //    .attr({
 //      x1: 0,
 //      y1: function(d) {
 //        return yScale(d);
 //      },
 //      x2: svgWidth,
 //      y2: function(d) {
 //        return yScale(d);
 //      }
 //    })
 //
 //  mean_gtn_line.exit().remove();
 //
 //
 //
 //  // Add line for mean OOP price
 //  mean_oop_line = vis.selectAll("line.oop-mean").data([mean_oop], function(d) {
 //    return d;
 //  });
 //
 //  mean_oop_line.enter()
 //    .append("svg:line")
 //    .attr("class", "oop-mean")
 //    .attr({
 //      x1: 0,
 //      y1: function(d) {
 //        return yScale(d);
 //      },
 //      x2: svgWidth,
 //      y2: function(d) {
 //        return yScale(d);
 //      }
 //    })
 //
 //  mean_oop_line.exit().remove();
 //
 //
 //
 //  d3.transition(vis)
 //    .select('.x.plotaxis')
 //    .call(xAxis)
 //    .selectAll("text")
 //    .attr("transform", "rotate(-40)translate(-10,0)")
 //    .attr("font-size", "12px")
 //    .style("text-anchor", "end")
 //    .style("alignment-baseline", "text-before-edge");
 //
 //  d3.transition(vis)
 //    .select('.y.plotaxis')
 //    .call(yAxis)
 //    .selectAll("text")
 //    .text(function(d) {
 //      return curFormat2(d);
 //    })
 //    .attr("transform", "translate(-5,0)")
 //    .attr("font-size", "12px")
 //    .style("text-anchor", "end");

}


init_patientswitching();
