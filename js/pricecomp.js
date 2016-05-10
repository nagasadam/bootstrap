// ---------------------------------------------------------
// ---  Generate aggregations needed for this symphony_data

var pricecomp_data = d3.nest()
  .key(function(d) {
    return d.TC_NAME + "|" + d.SUB_TC_NAME + "|" + d.SGMNT + "|" + d.RX_FILL_YYYYQTR + "|" + d.MNFCTRR + "|" +  d.DRUG_NAME;
  })
  .rollup(function(v) {
    return {

      SALES: d3.sum(v, function(d){
        return d.PYR_SLS_AMT;
      }),
      WAC_UNIT: d3.mean(v, function(d) {
        return d.WAC_PER_UNIT >= 0 ? d.WAC_PER_UNIT : 0.0;
      }),
      OOP_UNIT: d3.mean(v, function(d) {
        return d.OOP_UNIT >= 0 ? d.OOP_UNIT : 0.0;
      }),
      GTN_UNIT: d3.mean(v, function(d) {
        return (d.WAC_PER_UNIT - d.RBT_AMT_UNIT) >= 0 ? (d.WAC_PER_UNIT - d.RBT_AMT_UNIT) : 0.0;
      }),

      WAC_30DOS: d3.mean(v, function(d) {
        return d.WAC_PRICE_30DOS >= 0 ? d.WAC_PRICE_30DOS : 0.0;
      }),
      OOP_30DOS: d3.mean(v, function(d) {
        return d.OOP_30DOS >= 0 ? d.OOP_30DOS : 0.0;
      }),
      GTN_30DOS: d3.mean(v, function(d) {
        return (d.WAC_PRICE_30DOS - d.RBT_AMT_30DOS) >= 0 ? (d.WAC_PRICE_30DOS - d.RBT_AMT_30DOS) : 0.0;
      })

    };
  })
  .map(symphony_data);

symphony_data = null;

var dd = d3.entries(pricecomp_data);

var pricecomp_data = dd.map(function(d) {

  var dims = d.key.split("|");
  return {
    TC_NAME: dims[0],
    SUB_TC_NAME: dims[1],
    SGMNT: dims[2],
    RX_FILL_YYYYQTR: dims[3],
    MNFCTRR: dims[4],
    DRUG_NAME: dims[5],
    SALES: d.value.SALES,
    WAC_UNIT: d.value.WAC_UNIT,
    OOP_UNIT: d.value.OOP_UNIT,
    GTN_UNIT: d.value.GTN_UNIT,
    WAC_30DOS: d.value.WAC_30DOS,
    OOP_30DOS: d.value.OOP_30DOS,
    GTN_30DOS: d.value.GTN_30DOS
  }
});


// ------------------------------------------
// --- Global variables: BEGIN
var TC_NAME = "ALL";
var SUB_TC_NAME = "ALL";
var SGMNT = "ALL";

var unique_SUBTC = ["ALL"];
var unique_TC = ["ALL"];
var unique_Brands = [];

var chart_data;
var filtered_pricecomp_data;
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

var measures = ["WAC", "GTN", "OOP"];
var colordomain = ["#999999", "#ffe600", "#ffffff"];
var opacity_val = "0.4";

var svgWidth = document.getElementById("mainvis").offsetWidth;

var svgHeight = 450;
var maxh = svgHeight * 0.7;
var maxw = svgWidth * 0.9;

var curFormat = d3.format("$,.2f");

var curFormat2 = d3.format("$,.0f");
var keyFn = function(d) {
  return d.key
};


// --- Global variables: END
// ------------------------------------------


// ------------------------------------------
// --- DATE SLIDER:  BEGIN

var unique_dates = uniques(pricecomp_data.map(function(d) {
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

    update_pricecomp();

}));

// --- DATE SLIDER:  END
// ------------------------------------------

// ------------------------------------------
// ---  UNIT vs 30DOS TOGGLE:  BEGIN



var w= svgWidth;
var h= 30;
var svg_ratios = d3.select("#dostoggle")
                        .append("svg")
                        .attr("width",w)
                        .attr("height",h);

var allButtons= svg_ratios.append("g")
                    .attr("id","allButtons");

var defaultColor= "#ffffff";
var hoverColor= "#333333";
var pressedColor= "#ffe600";

var toggleoptions = ["UNIT","30DOS"];
var togglelabels = ["Per Unit", "30 DOS"];
var SEL_UNIT = toggleoptions[0];

var offset1 = svgWidth/2 ;
var offset2 = 0;
var legendBlockWidth1 = 15;
var textMargin1 = 15;

var initcolors = [pressedColor, defaultColor];

var buttonGroups= allButtons.selectAll("g.button")
                            .data(togglelabels)
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

                                SEL_UNIT = toggleoptions[d3.select(this).attr('value')];
                                update_pricecomp();
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

d3.select("#allButtons").attr("transform","translate(" + (offset1 - offset2/2) + ",0)")



function updateButtonColors(button, parent) {
    parent.selectAll("circle")
             .attr("fill",defaultColor)

    button.select("circle")
            .attr("fill",pressedColor)
}

// --- UNIT vs 30DOS TOGGLE:  BEGIN
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
var blabels = ["Biopharma Company", "Product Name"];
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
                                update_pricecomp();
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

// --- UNIT vs 30DOS TOGGLE:  BEGIN
// ------------------------------------------

// ------------------------------------------
// ---  THERAPUETIC CLASS DROP DOWN:  BEGIN

unique_TC = unique_TC.concat(uniques(pricecomp_data.map(function(d) {
  return d.TC_NAME;
})));

var TC_select = d3.select("#dropDown_TC").append("select").attr("width", "20%").on("change", function() {
  TC_NAME = d3.select(this).property('value');

  SUB_TC_NAME = "ALL";

  update_pricecomp();

  unique_SUBTC = ["ALL"];

  if (TC_NAME != "ALL") {
    unique_SUBTC = unique_SUBTC.concat(uniques(filtered_pricecomp_data.map(function(d) {
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
  update_pricecomp();
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
unique_SGMNT = unique_SGMNT.concat(uniques(pricecomp_data.map(function(d) {
  return d.SGMNT;
})));

var SGMNT_select = d3.select("#dropDown_SEGMENT").append("select").attr("width", "20%").on("change", function() {
  SGMNT = d3.select(this).property('value');
  update_pricecomp();
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

  datafilter = datafilter + " d.RX_FILL_YYYYQTR >= RX_FILL_YYYYQTR_MIN && ";
  datafilter = datafilter + " d.RX_FILL_YYYYQTR <= RX_FILL_YYYYQTR_MAX  ";

  filtered_pricecomp_data = pricecomp_data.filter(function(d) {
    return eval(datafilter);
  });

  var rollup_txt = "d3.nest().key(function(d) {return d." + AXIS_LABELS+ ";}).rollup(function(v) {return{";



  measures.forEach(function(m){
        rollup_txt = rollup_txt + m + ": d3.mean(v, function(d) { return d." + m + "_" + SEL_UNIT + ";}), "
  })
  rollup_txt = rollup_txt + " SALES: d3.sum(v,function(d){ return d.SALES;}) };}).map(filtered_pricecomp_data);";

  chart_data = eval(rollup_txt);

  // now sort and take the 10 top by SALES amount

  chart_data = d3.entries(chart_data).map(function(d, idx) {
    return {
      key: idx,
      title1: d.key,
      wac: d.value.WAC,
      oop: d.value.OOP,
      gtn: d.value.GTN,
      SALES: d.value.SALES
    }

  })

  chart_data.sort(function(a, b) {
    return d3.descending(a.SALES, b.SALES)
  });

  chart_data = chart_data.slice(0,10);


  max_wac = d3.max(filtered_pricecomp_data, function(d) {
    return eval( "d.WAC_"+SEL_UNIT ) ;
  });

  mean_gtn = d3.mean(filtered_pricecomp_data, function(d) {
    return eval( "d.GTN_"+ SEL_UNIT) ;
  });

  mean_oop = d3.mean(filtered_pricecomp_data, function(d) {
    return eval( "d.OOP_" + SEL_UNIT);
  });

  mean_wac = d3.mean(filtered_pricecomp_data, function(d) {
    return eval( "d.WAC_" + SEL_UNIT);
  });


  var wac_data = d3.entries(chart_data).map(function(d, idx) {
    return {
      title1: d.value.title1,
      val: d.value.wac
    }

  });

  var gtn_data = d3.entries(chart_data).map(function(d, idx) {
    return {
      title1: d.value.title1,
      val: d.value.gtn
    }

  });

  var oop_data = d3.entries(chart_data).map(function(d, idx) {
    return {
      title1: d.value.title1,
      val: d.value.oop
    }

  });

  new_data= [wac_data, gtn_data, oop_data];

}



function init_pricecomp() {


  var svg = d3.select("#pricecomp").append("svg").attr("width", svgWidth).attr("height", svgHeight)

  svg.append("svg:rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("stroke", "none")
    .attr("fill", "none");

  svg.append("svg:g")
    .attr("id", "barchart")
    .attr("transform", "translate(70,20)");

  vis = d3.select("#barchart");

  vis.append("g")
    .attr("class", "x plotaxis")
    .attr("transform", "translate(0," + maxh + ")");

  vis.append("g")
    .attr("class", "y plotaxis")
    .attr("transform", "translate(0,0)");

  // Create the legend

  var svglegend = d3.select('#pricecomp_legend')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', 30);

  var allLegend = svglegend.append("g")
                        .attr("id","allLegend");

  var legendRectSize = 18;
  var legendSpacing = 4;

  var offset = 0;
  var legendBlockWidth = 10;
  var textMargin = 10;

  var color = d3.scale.ordinal()
    .domain(measures)
    .range(colordomain);

  var legend = allLegend.selectAll('g.legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .each(function(key, i) {

          var item = d3.select(this);
          var legendtext =
                item.append('text')
                      .attr('transform',
                            'translate(' + [
                                legendBlockWidth + textMargin,
                                legendBlockWidth
                                ].join(',') + ')')
                       .style("fill", "white")
                       .text(key);

          item.append('rect')
              .attr({
                        width: legendBlockWidth,
                        height: legendBlockWidth,
                        fill: color(key),
                        stroke: color(key)
                      });

          item.attr('transform', function() { return 'translate(' + offset + ',0)';});
    // Update the offset
          offset += legendtext.node().getBoundingClientRect().width + legendBlockWidth + textMargin * 3;

  });

  d3.select('#allLegend').attr("transform", "translate(" + (svgWidth/2 - offset/2) +",0)");

  set_chart_data();

  xScale = d3.scale.ordinal()
    .domain(chart_data.map(function(d) {
      return d.title1;
    }))
    .rangeBands([0, maxw], 0.5);

   yScale = d3.scale.linear()
      .domain([0, d3.max(chart_data, function(d) {
        return d.wac;
      })])
      .range([maxh, 0]);

  area = d3.svg.area()
    .x(function(d) { return xScale(d.title1); })
    .y0(maxh)
    .y1(function(d) { return yScale(d.val); })
    .interpolate("monotone") ;

  vis.selectAll("path.area-chart")
    .data(new_data)
    .enter()
    .append("path")
    .attr("class", "area-chart")
    .attr("d",area)
    .style("fill", function(d,idx) { return color(measures[idx]); })
    .style("opacity", "0.0");



};

function update_pricecomp() {


  set_chart_data();

  tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {

      tttext = "<center><span class='tip_txt_style0'>" + d.title1 + "</span></center>";
      // tttext = tttext + "<p><center><span class='tip_txt_style1'>(" + SEL_UNIT +  ")</center></span>";
      tttext = tttext + "<p>SALES: <span class='tip_txt_style'>" + curFormat(d.SALES) + "</span></p>";
      // tttext = tttext + "<p>UNIT: <span class='tip_txt_style'>" + SEL_UNIT +  "</span>";

      tttext = tttext + "<p>WAC: <span class='tip_txt_style'>" + curFormat(d.wac) + "</span>";
      tttext = tttext + "    Mean WAC: <span class='tip_txt_style'>" + curFormat(mean_wac) + "</span></p>";
      tttext = tttext + "<p>GTN: <span class='tip_txt_style'>" + curFormat(d.gtn) + "</span>";
      tttext = tttext + "    Mean GTN: <span class='tip_txt_style'>" + curFormat(mean_gtn) + "</span></p>";
      tttext = tttext + "<p>OOP: <span class='tip_txt_style'>" + curFormat(d.oop) + "</span>";
      tttext = tttext + "    Mean OOP: <span class='tip_txt_style'>" + curFormat(mean_oop) + "</span></p>";
      return tttext;
    });


    xScale = d3.scale.ordinal()
      .domain(chart_data.map(function(d) {
        return d.title1;
      }))
      .rangeBands([0, maxw],0.1);

    // }))
    // .rangeRoundBands([0, maxw], 0.5, 1.5);

     yScale = d3.scale.linear()
        .domain([0, d3.max(chart_data, function(d) {
          return d.wac;
        })])
        .range([maxh, 0]);


  var xAxis = d3.svg.axis().scale(xScale).orient("top");
  var yAxis = d3.svg.axis().scale(yScale).orient("left");

 vis.selectAll("path.area-chart")
      .data(new_data)
      .transition()
      .attr("d", area)
      .style("opacity",opacity_val)
      .attr("transform","translate(" + xScale.rangeBand()/2.0 + ",0)");


  // Add Overlay for tooltips bullets

  overlay_bullets = vis.selectAll("rect.bar-overlay").data(chart_data, keyFn);
  //
  // update the bullets
  overlay_bullets
    .enter()
    .append("svg:rect")
    .attr("class", "bar-overlay")
    .attr("fill", "#fff")
    .attr("opacity", "0.0");

  overlay_bullets.exit().remove();

  overlay_bullets
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .call(tip);

  overlay_bullets
  .attr("x", function(d) {
    return xScale(d.title1);
  })
  .attr("y", function(d) {
    return yScale(d.wac);
  })
  .attr("width", xScale.rangeBand())
  .attr("height", function(d, i) {
    return maxh - yScale(d.wac);
  })
  ;

    // add circles for the data points and a line connecting them

    // Add line for the mean wac price
    mean_wac_line = vis.selectAll("line.wac-mean").data([mean_wac], function(d) {
      return d;
    });

    mean_wac_line.enter()
      .append("svg:line")
      .attr("class", "wac-mean")
      .attr({
        x1: 0,
        y1: function(d) {
          return yScale(d);
        },
        x2: svgWidth,
        y2: function(d) {
          return yScale(d);
        }
      })

    mean_wac_line.exit().remove();

    // mean_wac_txt = vis.selectAll("text.wac-mean-txt").data([mean_wac], function(d) {
    //   return d;
    // });
    //
    // mean_wac_txt.enter()
    //   .append("svg:text")
    //   .attr("class", "wac-mean-txt")
    //   .attr("transform", "translate(" + (maxw-20) + ", " + (yScale(mean_wac) - 10) + ")")
    //   .text("MEAN WAC: " + curFormat(mean_wac))
    //   .style("text-anchor", "end");
    //
    // mean_wac_txt.exit().remove();

  // Add line for the mean gtn price
  mean_gtn_line = vis.selectAll("line.gtn-mean").data([mean_gtn], function(d) {
    return d;
  });

  mean_gtn_line.enter()
    .append("svg:line")
    .attr("class", "gtn-mean")
    .attr({
      x1: 0,
      y1: function(d) {
        return yScale(d);
      },
      x2: svgWidth,
      y2: function(d) {
        return yScale(d);
      }
    })

  mean_gtn_line.exit().remove();



  // Add line for mean OOP price
  mean_oop_line = vis.selectAll("line.oop-mean").data([mean_oop], function(d) {
    return d;
  });

  mean_oop_line.enter()
    .append("svg:line")
    .attr("class", "oop-mean")
    .attr({
      x1: 0,
      y1: function(d) {
        return yScale(d);
      },
      x2: svgWidth,
      y2: function(d) {
        return yScale(d);
      }
    })

  mean_oop_line.exit().remove();



  d3.transition(vis)
    .select('.x.plotaxis')
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "rotate(-40)translate(-10,0)")
    .attr("font-size", "12px")
    .style("text-anchor", "end")
    .style("alignment-baseline", "text-before-edge");

  d3.transition(vis)
    .select('.y.plotaxis')
    .call(yAxis)
    .selectAll("text")
    .text(function(d) {
      return curFormat2(d);
    })
    .attr("transform", "translate(-5,0)")
    .attr("font-size", "12px")
    .style("text-anchor", "end");

}


init_pricecomp();
