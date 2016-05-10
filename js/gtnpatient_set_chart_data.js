function set_chart_data() {

  // Allow for an ALL option from the drop dropDown_SEGMENT



    var fields = ["TC_NAME", "SUB_TC_NAME", "SGMNT", "MNFCTRR", "DRUG_NAME"];
    var vals = [TC_NAME, SUB_TC_NAME, SGMNT, MNFCTRR, DRUG_NAME ];
    var datafilter = "";

    if ( TC_NAME == "ALL" && SUB_TC_NAME == "ALL" && SGMNT == "ALL" && MNFCTRR == "ALL" && DRUG_NAME == "ALL")
    {
      filtered_gtnpatient_data=gtnpatient_data;

    }
    else {


        vals.forEach(function(i, idx) {
          if (i != "ALL") {
            datafilter = datafilter + "d." + fields[idx] + " == " + fields[idx] + " && ";
          }
        });

        filtered_gtnpatient_data = gtnpatient_data.filter(function(d) {
          return eval(datafilter.slice(0,-4));
        });
    }

    var rollup_txt = "d3.nest().key(function(d) {return d.RX_FILL_YYYYQTR + '|' + d.PYR_NAME;}).rollup(function(v) {return{";

    var measures = ["PYR_SLS_AMT", "PYR_PAT_CNT"];
    var aggs = ["sum", "sum"];

    measures.forEach(function(m,idx){
          rollup_txt = rollup_txt + m + ": d3." + aggs[idx] + "(v, function(d) { return d." + m + ";}), "
    })



    rollup_txt = rollup_txt.slice(0,-2) + "};}).map(filtered_gtnpatient_data);";

    var chart_data1 = eval(rollup_txt);

    chart_data1 = d3.entries(chart_data1).map(function(d, idx) {
      return {
        key: d.key,
        SLS_PER_PATIENT: ( d.value.PYR_PAT_CNT > 0) ? d.value.PYR_SLS_AMT / d.value.PYR_PAT_CNT : 0.0
      };
    });

// --- Now calculate the revenue/patient across all manufacturers (brands) and payors for each GEO


  fields = ["TC_NAME", "SUB_TC_NAME", "SGMNT"];
  vals = [TC_NAME, SUB_TC_NAME, SGMNT ];
  datafilter = "";

  if ( TC_NAME == "ALL" && SUB_TC_NAME == "ALL" && SGMNT == "ALL" && MNFCTRR == "ALL" && DRUG_NAME == "ALL")
  {
    filtered_gtnpatient_data2=gtnpatient_data;

  }
  else {

      vals.forEach(function(i, idx) {
        if (i != "ALL") {
          datafilter = datafilter + "d." + fields[idx] + " == " + fields[idx] + " && ";
        }
      });

      filtered_gtnpatient_data2 = gtnpatient_data.filter(function(d) {
        return eval(datafilter.slice(0,-4));
      });
}


  rollup_txt = "d3.nest().key(function(d) {return d.RX_FILL_YYYYQTR + '|' + d.PYR_NAME;}).rollup(function(v) {return{";

  measures.forEach(function(m,idx){
        rollup_txt = rollup_txt + m + "_ALL : d3." + aggs[idx] + "(v, function(d) { return d." + m + ";}), "
  })
  rollup_txt = rollup_txt.slice(0,-2) + "};}).map(filtered_gtnpatient_data2);";

  var chart_data2 = eval(rollup_txt);

  chart_data2 = d3.entries(chart_data2).map(function(d, idx) {
    return {
      key: d.key,
      SLS_PER_PATIENT_ALL: d.value.PYR_PAT_CNT_ALL >0 ? d.value.PYR_SLS_AMT_ALL /d.value.PYR_PAT_CNT_ALL : 0.0
    };
  });



  //--- Calculate the average revenue per patient across all payors and manufacturers

  rollup_txt = "d3.nest().key(function(d) {return d.RX_FILL_YYYYQTR ;}).rollup(function(v) {return{";

  measures.forEach(function(m,idx){
        rollup_txt = rollup_txt + m + "_PAYOR_ALL : d3." + aggs[idx] + "(v, function(d) { return d." + m + ";}), "
  })
  rollup_txt = rollup_txt.slice(0,-2) + "};}).map(filtered_gtnpatient_data2);";

  var chart_data3 = eval(rollup_txt);

  chart_data3 = d3.entries(chart_data3).map(function(d, idx) {
    return {
      key: d.key,
      SLS_PER_PATIENT_PAYOR_ALL: d.value.PYR_PAT_CNT_PAYOR_ALL >0 ? d.value.PYR_SLS_AMT_PAYOR_ALL /d.value.PYR_PAT_CNT_PAYOR_ALL : 0.0
    };
  });


  // Now join chart_data1, chart_data2, and chart_data3 along with the lon and lat data based on the key values
  chart_data = [];


  for (var i in chart_data1) {
      var obj = {   key: chart_data1[i].key,
                    SLS_PER_PATIENT: chart_data1[i].SLS_PER_PATIENT };

      for (var j in chart_data2)
      {
         if (chart_data1[i].key == chart_data2[j].key)
         {
             obj.SLS_PER_PATIENT_ALL = chart_data2[j].SLS_PER_PATIENT_ALL;
         }
       }

       var dims = obj.key.split("|") ;

       for (var k in chart_data3)
       {
          if (dims[0] == chart_data3[k].key)
          {
              obj.SLS_PER_PATIENT_PAYOR_ALL = chart_data3[k].SLS_PER_PATIENT_PAYOR_ALL;
          }
        }

       chart_data.push(obj);
  }

   chart_data = d3.entries(chart_data).map(function(d, idx) {

    var dims = d.value.key.split("|");

    return {
      key: d.value.key + "|" + TC_NAME + "|" + SUB_TC_NAME + "|" + SGMNT+ "|" + MNFCTRR+ "|" + DRUG_NAME ,
      RX_FILL_YYYYQTR: dims[0],
      PYR_NAME: dims[1],

      SLS_PER_PATIENT: d.value.SLS_PER_PATIENT,
      SLS_PER_PATIENT_ALL: d.value.SLS_PER_PATIENT_ALL,
      SLS_PER_PATIENT_PAYOR_ALL: d.value.SLS_PER_PATIENT_PAYOR_ALL

    };



    chart_data.sort(function(a, b) {
      return d3.ascending(a.key, b.key)
    });


  })
}

function set_geo_chart_data() {

  // First data set will be filtered by TC, SUBTC , SEGMENT, MNFCTRR, DRUG_NAME, and PYR_NAME


  var fields = ["TC_NAME", "SUB_TC_NAME", "SGMNT", "MNFCTRR", "DRUG_NAME", "PYR_NAME"];
  var vals = [TC_NAME, SUB_TC_NAME, SGMNT, MNFCTRR, DRUG_NAME, PYR_NAME  ];
  var datafilter = "";




      vals.forEach(function(i, idx) {
        if (i != "ALL") {
          datafilter = datafilter + "d." + fields[idx] + " == " + fields[idx] + " && ";
        }
      });

      filtered_gtnpatient_data = gtnpatient_data.filter(function(d) {
        return eval(datafilter.slice(0,-4));
      });

  var rollup_txt = "d3.nest().key(function(d) {return d.GEO_CITY;}).rollup(function(v) {return{";

  var measures = ["PYR_SLS_AMT", "PYR_PAT_CNT"];
  var aggs = ["sum", "sum"];

  measures.forEach(function(m,idx){
        rollup_txt = rollup_txt + m + ": d3." + aggs[idx] + "(v, function(d) { return d." + m + ";}), "
  })

  rollup_txt = rollup_txt.slice(0,-2) + "};}).map(filtered_gtnpatient_data);";

  var chart_data1 = eval(rollup_txt);

  chart_data1 = d3.entries(chart_data1).map(function(d, idx) {
    return {
      key: d.key,
      SLS_PER_PATIENT: ( d.value.PYR_PAT_CNT > 0) ? d.value.PYR_SLS_AMT / d.value.PYR_PAT_CNT : 0.0
    };
  });



  //--- now summarize data across all manufacturers in the TC


  fields = ["TC_NAME", "SUB_TC_NAME", "SGMNT"];
  vals = [TC_NAME, SUB_TC_NAME, SGMNT ];
  datafilter = "";

  if ( TC_NAME == "ALL" && SUB_TC_NAME == "ALL" && SGMNT == "ALL" && MNFCTRR == "ALL" && DRUG_NAME == "ALL")
  {
    filtered_gtnpatient_data2=gtnpatient_data;

  }
  else {

      vals.forEach(function(i, idx) {
        if (i != "ALL") {
          datafilter = datafilter + "d." + fields[idx] + " == " + fields[idx] + " && ";
        }
      });


      filtered_gtnpatient_data2 = gtnpatient_data.filter(function(d) {
        return eval(datafilter.slice(0,-4));
      });
 }


  rollup_txt = "d3.nest().key(function(d) {return d.GEO_CITY;}).rollup(function(v) {return{";

  measures.forEach(function(m,idx){
        rollup_txt = rollup_txt + m + "_ALL : d3." + aggs[idx] + "(v, function(d) { return d." + m + ";}), "
  })
  rollup_txt = rollup_txt.slice(0,-2) + "};}).map(filtered_gtnpatient_data2);";

  var chart_data2 = eval(rollup_txt);

  chart_data2 = d3.entries(chart_data2).map(function(d, idx) {
    return {
      key: d.key,
      SLS_PER_PATIENT_ALL: d.value.PYR_PAT_CNT_ALL >0 ? d.value.PYR_SLS_AMT_ALL /d.value.PYR_PAT_CNT_ALL : 0.0
    };
  });







fields = ["TC_NAME", "SUB_TC_NAME", "SGMNT", "PYR_NAME"];
vals = [TC_NAME, SUB_TC_NAME, SGMNT, PYR_NAME ];
datafilter = "";



    vals.forEach(function(i, idx) {
      if (i != "ALL") {
        datafilter = datafilter + "d." + fields[idx] + " == " + fields[idx] + " && ";
      }
    });


    filtered_gtnpatient_data3 = gtnpatient_data.filter(function(d) {
      return eval(datafilter.slice(0,-4));
    });



rollup_txt = "d3.nest().key(function(d) {return d.GEO_CITY ;}).rollup(function(v) {return{";

measures.forEach(function(m,idx){
      rollup_txt = rollup_txt + m + "_PAYOR_ALL : d3." + aggs[idx] + "(v, function(d) { return d." + m + ";}), "
})
rollup_txt = rollup_txt.slice(0,-2) + "};}).map(filtered_gtnpatient_data3);";

var chart_data3 = eval(rollup_txt);

chart_data3 = d3.entries(chart_data3).map(function(d, idx) {
  return {
    key: d.key,
    SLS_PER_PATIENT_PAYOR_ALL: d.value.PYR_PAT_CNT_PAYOR_ALL >0 ? d.value.PYR_SLS_AMT_PAYOR_ALL /d.value.PYR_PAT_CNT_PAYOR_ALL : 0.0
  };
});






  // Now join chart_data1 and chart_data2 based on the key values
  chart_data = [];


    for (var i in chart_data1) {
        var obj = {   key: chart_data1[i].key,
                      SLS_PER_PATIENT: chart_data1[i].SLS_PER_PATIENT };

        for (var j in chart_data2)
        {
           if (chart_data1[i].key == chart_data2[j].key)
           {
               obj.SLS_PER_PATIENT_ALL = chart_data2[j].SLS_PER_PATIENT_ALL;
           }
         }

         for (var k in chart_data3)
         {
            if (chart_data1[i].key  == chart_data3[k].key)
            {
                obj.SLS_PER_PATIENT_PAYOR_ALL = chart_data3[k].SLS_PER_PATIENT_PAYOR_ALL;
            }
          }

          for (var m in cities)
          {

              var city = chart_data1[i].key.toUpperCase();

              if ( city == cities[m].place.toUpperCase() )
              {

                obj.lon = cities[m].lon;
                obj.lat = cities[m].lat;
              }

          }

         chart_data.push(obj);
    }

     chart_data = d3.entries(chart_data).map(function(d, idx) {

      var dims = d.value.key.split("|");

      return {
        key: d.value.key + "|" + TC_NAME + "|" + SUB_TC_NAME + "|" + SGMNT+ "|" + MNFCTRR+ "|" + DRUG_NAME + "|" + PYR_NAME,
        GEO_CITY: d.value.key,
        lon: d.value.lon,
        lat: d.value.lat,

        SLS_PER_PATIENT: d.value.SLS_PER_PATIENT,
        SLS_PER_PATIENT_ALL: d.value.SLS_PER_PATIENT_ALL,
        SLS_PER_PATIENT_PAYOR_ALL: d.value.SLS_PER_PATIENT_PAYOR_ALL

      };


    chart_data.sort(function(a, b) {
      return d3.ascending(a.key, b.key)
    });


  })
}
