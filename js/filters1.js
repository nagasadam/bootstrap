//FILTERING FUNCTIONS

function uniques(arr) {
      var a = [];
      for (var i=0, l=arr.length; i<l; i++)
          if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
              a.push(arr[i]);
      return a;
  }
// get the unique dates values from the data
var unique_dates = uniques(dashboard1_data.map(function(d) {
  return d.RX_FILL_YYYYQTR;
}));

unique_dates.sort();

var dslider = dateslider().tickValues(unique_dates).width(525).callback(function() {
    DATE_VALUE = dslider.value();
    set_chart_data();
    update_dashboard1();
  });

//Create date Slider
d3.select("#dateslider").append("svg").call(dslider);

var unique_TC = uniques(dashboard1_data.map(function(d) {
  return d.TC_NAME;
}));

//Therapeutic Classes selection
var TC_select = d3.select("#dropDown_TC").append("select").on("change", function() {
          TC_NAME = d3.select(this).property('value');

          tmp = dashboard1_data.filter(function(d) {
            return (d.TC_NAME == TC_NAME )
          });

          unique_SUBTC = uniques(tmp.map(function(d) {
            return d.SUB_TC_NAME;
          }));

          SUBTC_options = SUBTC_select.selectAll("option")
                              .data(unique_SUBTC)
                              .enter()
                              .append("option")
                              .text(function (d) {
                                return d;
                              })
                              .attr("value", function (d) {
                                return d;
                              })
                              ;
          set_chart_data();
          update_dashboard1();
} );

var TC_options = TC_select.selectAll("option")
                    .data(unique_TC)
                    .enter()
                    .append("option")
                    .text(function (d) {
                      return d;
                    })
                    .attr("value", function (d) {
                      return d;
                    })
                    ;

// Get the sub tc classes for the selected TC
var tmp = dashboard1_data.filter(function(d) {
  return (d.TC_NAME == unique_TC[0] )
});

var unique_SUBTC = uniques(tmp.map(function(d) {
  return d.SUB_TC_NAME;
}));

var SUBTC_select = d3.select("#dropDown_SUBTC").append("select").on("change", function() {
          SUB_TC_NAME = d3.select(this).property('value');
          set_chart_data();
          update_dashboard1();
} );

var SUBTC_options = SUBTC_select.selectAll("option")
                    .data(unique_SUBTC)
                    .enter()
                    .append("option")
                    .text(function (d) {
                      return d;
                    })
                    .attr("value", function (d) {
                      return d;
                    })
                    ;

//Get the manufacturers for the selected TC
var mnf_tmp = dashboard1_data.filter(function(d) {
  return (d.SUB_TC_NAME = unique_SUBTC[0] )
});

var unique_MNFCTRR = uniques(mnf_tmp.map(function(d) {
  return d.MNFCTRR;
}));

var MNFCTRR_select = d3.select("#dropDown_MNFCTRR").append("select").on("change", function() {
            MNFCTRR = d3.select(this).property('value');
            set_chart_data();
            update_dashboard1();
});

var MNFCTRR_options = MNFCTRR_select.selectAll("option")
                      .data(unique_MNFCTRR)
                      .enter()
                      .append("option")
                      .text(function (d) {
                        return d;
                      })
                      .attr("value", function (d) {
                        return d;
                      });

//Get the brands for the selected manufacturer
var brand_tmp = dashboard1_data.filter(function(d) {
  return (d.MNFCTRR = unique_MNFCTRR[0] )
});

var unique_BRAND = uniques(brand_tmp.map(function(d) {
  return d.DRUG_NAME;
}));

var BRAND_select = d3.select("#dropDown_DRUG_NAME").append("select").on("change", function() {
            DRUG_NAME = d3.select(this).property('value');
            set_chart_data();
            update_dashboard1();
});

var BRAND_options = BRAND_select.selectAll("option")
                      .data(unique_BRAND)
                      .enter()
                      .append("option")
                      .text(function (d) {
                        return d;
                      })
                      .attr("value", function (d) {
                        return d;
                      });                      

//Segments i.e. Medicare, Medicaid and Commercial
var unique_SGMNT = uniques(dashboard1_data.map(function(d) {
                      return d.SGMNT;
                    }));

var SGMNT_select = d3.select("#dropDown_SEGMENT").append("select").on("change", function() {
          SGMNT = d3.select(this).property('value');
          set_chart_data();
          update_dashboard1();} );

var SGMNT_options = SGMNT_select.selectAll("option")
                    .data(unique_SGMNT)
                    .enter()
                    .append("option")
                    .text(function (d) {
                      return d;
                    })
                    .attr("value", function (d) {
                      return d;
                    })
                    ;