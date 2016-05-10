// ------------------------------------------
// --- Global variables: BEGIN
var TC_NAME = "ALL";
var SUB_TC_NAME = "ALL";
var SGMNT = "ALL";
var MNFCTRR = "ALL";
var DRUG_NAME = "ALL";

var unique_SUBTC = ["ALL"];
var unique_TC = ["ALL"];
var unique_Brands = [];
var unique_MNFCTRR = ["ALL"];
var unique_DRUG_NAME = ["ALL"];

var table_agg_data = [];
var table_client_data = [];
var filtered_payercomp_data_agg;
var filtered_payercomp_data_client;
var agg_table;
var client_table;
var agg_rank;

var databyPayer;
var databyPayerbyClient; 

var vis;
var bullets;

var svgWidth = document.getElementById("mainvis").offsetWidth;

var svgHeight = 550;
var maxh = svgHeight * 0.7;
var maxw = svgWidth * 0.9;

var curFormat = d3.format("$,.2f");

var curFormat2 = d3.format("$,.0f");
var keyFn = function(d) {
  return d.key
};


// --- Global variables: END
// ------------------------------------------

// --- GET RELEVANT DATA FOR SPECIFIC DASHBOARD: BEGIN
// -------------------------------------------------


//console.log(symphony_data[0]);
//console.log(symphony_data[1]);

//console.log(symphony_data.map(function(d) { return d.TC_NAME;})[0]);


//var dd = d3.entries(symphony_data);

var payercomp_data = symphony_data.map(function(d) {
  return{
    TC_NAME: d.TC_NAME,
    SUB_TC_NAME: d.SUB_TC_NAME,
    SGMNT: d.SGMNT,
    RX_FILL_YYYYQTR: d.RX_FILL_YYYYQTR,
    MNFCTRR: d.MNFCTRR,
    DRUG_NAME: d.DRUG_NAME,
    PYR_NAME: d.PYR_NAME,
    PYR_SLS_AMT: d.PYR_SLS_AMT,
    PYR_PAT_CNT: d.PYR_PAT_CNT,
    PYR_TRX: d.PYR_TRX,
    PYR_RBT_AMT: d.PYR_RBT_AMT
  }
  });

symphony_data = null;

// -------------------------------------------------
// --- GET RELEVANT DATA FOR SPECIFIC DASHBOARD: END

// ------------------------------------------
// --- DATE SLIDER:  BEGIN

var unique_dates = uniques(payercomp_data.map(function(d) {
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

    update_payercomp();

}));

//console.log(RX_FILL_YYYYQTR_MAX);

// --- DATE SLIDER:  END
// ------------------------------------------

// ------------------------------------------
// ---  UNIT vs 30DOS TOGGLE:  BEGIN



var w= 285;
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

var offset1 = 0;
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
                                return 'translate(' + offset1 + ',0)';
                              });
                              // Update the offset
                              offset1 += text.node().getBBox().width + legendBlockWidth1 + textMargin1 * 3;

                            })


                            .on("click",function(d,i) {
                                updateButtonColors(d3.select(this), d3.select(this.parentNode))

                                SEL_UNIT = toggleoptions[d3.select(this).attr('value')];
                                update_payercomp();
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
                            })

function updateButtonColors(button, parent) {
    parent.selectAll("circle")
             .attr("fill",defaultColor)

    button.select("circle")
            .attr("fill",pressedColor)
}

// --- UNIT vs 30DOS TOGGLE:  END
// ------------------------------------------


// ------------------------------------------
// ---  THERAPUETIC CLASS DROP DOWN:  BEGIN

unique_TC = unique_TC.concat(uniques(payercomp_data.map(function(d) {
  return d.TC_NAME;
})));

unique_MNFCTRR = unique_MNFCTRR.concat(uniques(payercomp_data.map(function(d) {
  return d.MNFCTRR;
})));

//unique_MNFCTRR.sort();

/*unique_DRUG_NAME = unique_DRUG_NAME.concat(uniques(payercomp_data.map(function(d) {
  return d.DRUG_NAME;
})));; */

//unique_DRUG_NAME.sort();

var TC_select = d3.select("#dropDown_TC").append("select").attr("width", "20%").on("change", function() {
  TC_NAME = d3.select(this).property('value');

  SUB_TC_NAME = "ALL";
  MNFCTRR = "ALL";
  DRUG_NAME = "ALL";

  update_payercomp();

  unique_SUBTC = ["ALL"];
  unique_MNFCTRR = ["ALL"];
  unique_DRUG_NAME = ["ALL"];


  if (TC_NAME != "ALL") {
    unique_MNFCTRR = ["ALL"];
    unique_SUBTC = unique_SUBTC.concat(uniques(filtered_payercomp_data_agg.map(function(d) {
      return d.SUB_TC_NAME;
    })));
   unique_MNFCTRR = unique_MNFCTRR.concat(uniques(filtered_payercomp_data_client.map(function(d) {
      return d.MNFCTRR;
    })));   
    /*unique_DRUG_NAME = unique_DRUG_NAME.concat(uniques(filtered_payercomp_data_client.map(function(d) {
      return d.DRUG_NAME;
    })));*/ 
  };

  SUBTC_options = SUBTC_select.selectAll("option").data(unique_SUBTC, function(d) {
    return d;
  });
  MNFCTRR_options = MNFCTRR_select.selectAll("option").data(unique_MNFCTRR, function(d) {
    return d;
  });  

  DRUG_NAME_options = DRUG_NAME_select.selectAll("option").data(unique_DRUG_NAME, function(d) {
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

    MNFCTRR_options.enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  MNFCTRR_options.exit().remove();

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
  DRUG_NAME = "ALL";

  update_payercomp();

  if (SUB_TC_NAME != "ALL") {
   unique_MNFCTRR = ["ALL"].concat(uniques(filtered_payercomp_data_client.map(function(d) {
      return d.MNFCTRR;
    })));  
    unique_DRUG_NAME = unique_DRUG_NAME.concat(uniques(filtered_payercomp_data_client.map(function(d) {
      return d.DRUG_NAME;
    })));       
  };

  MNFCTRR_options = MNFCTRR_select.selectAll("option").data(unique_MNFCTRR, function(d) {
    return d;
  }); 

  DRUG_NAME_options = DRUG_NAME_select.selectAll("option").data(unique_DRUG_NAME, function(d) {
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
unique_SGMNT = unique_SGMNT.concat(uniques(payercomp_data.map(function(d) {
  return d.SGMNT;
})));

var SGMNT_select = d3.select("#dropDown_SEGMENT").append("select").attr("width", "20%").on("change", function() {
  SGMNT = d3.select(this).property('value');
  
  MNFCTRR = "ALL";
  DRUG_NAME = "ALL";

  update_payercomp();

   if (SGMNT != "ALL") {
   unique_MNFCTRR = ["ALL"].concat(uniques(filtered_payercomp_data_client.map(function(d) {
      return d.MNFCTRR;
    })));  
    unique_DRUG_NAME = unique_DRUG_NAME.concat(uniques(filtered_payercomp_data_client.map(function(d) {
      return d.DRUG_NAME;
    })));       
  };

  MNFCTRR_options = MNFCTRR_select.selectAll("option").data(unique_MNFCTRR, function(d) {
    return d;
  }); 

  DRUG_NAME_options = DRUG_NAME_select.selectAll("option").data(unique_DRUG_NAME, function(d) {
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





// var SGMNT_select = d3.select("#dropDown_SEGMENT")
//                       .append("div")
//                       .attr("class", "selectric")
//                       .append("div")
//                       .attr("class", "label")
//                       .on("click", function() { show(this);} )
//                       .text( "Segment")
//                       .append("b")
//                       .attr("class","button")
//                       .append("div")
//                       .attr("class","hidden")
//                       .attr("id","options")
//                       .on("click", function() { choose(this) ;})
//                       .on("change", function() {
//                             SGMNT = d3.select(this).property('value');
//                             update_pricecomp();}
//                           );
//
// var SGMNT_options = SGMNT_select.selectAll("option")
//   .data(unique_SGMNT)
//   .enter()
//   .append("option")
//   .text(function(d) {
//     return d;
//   })
//   .attr("value", function(d) {
//     return d;
//   });
//
//
//
//
//   function show(el) {
//     var selectbox = document.getElementById("options");
//     if (selectbox.className == "hidden") {
//       selectbox.setAttribute("class","visible");
//     } else {
//       selectbox.setAttribute("class","hidden");
//     }
//   }
//
//   function choose(el) {
//
//     //var el =   d3.select(this);
//
//     var value = el.html();
//     el.attr("class","hidden");
//     el.paretnElement.html(value);
//
//     // var options = el;
//     // var target = ev.target;
//     // var value = ev.target.innerHTML;
//     //
//     // options.setAttribute('class', 'hidden');
//     // options.parentElement.querySelector('.label').innerHTML = value;
//   }


// ---  SEGMENT DROP DOWN:  END
// ------------------------------------------
// ------------------------------------------
// ---  MANUFACTURER DROP DOWN:  BEGIN

var MNFCTRR_select = d3.select("#dropDown_MNFCTRR").append("select").attr("width", "20%").on("change", function() {
  MNFCTRR = d3.select(this).property('value');

  DRUG_NAME = "ALL";

  update_payercomp();

  unique_DRUG_NAME = ["ALL"];

  if (MNFCTRR != "ALL") {
  unique_DRUG_NAME = unique_DRUG_NAME.concat(uniques(filtered_payercomp_data_client.map(function(d) {
      return d.DRUG_NAME;
    })));   
  };


  DRUG_NAME_options = DRUG_NAME_select.selectAll("option").data(unique_DRUG_NAME, function(d) {
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
// ---  DRUG NAME DROP DOWN:  BEGIN

var DRUG_NAME_select = d3.select("#dropDown_DRUG_NAME").append("select").attr("width", "20%").on("change", function() {
  DRUG_NAME = d3.select(this).property('value');
  update_payercomp();
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

// ---  DRUG NAME DROP DOWN:  END
// ------------------------------------------

