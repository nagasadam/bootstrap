//FILTERING FUNCTIONS

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

var table_agg_data = [];
var table_client_data = [];
var filtered_PayerComp_data_agg;
var filtered_PayerComp_data_client;
var agg_table;
var client_table;
var svg;
var chart;
var tip;
var agg_rank;

var curFormat = d3.format("$,.3n");
var keyFn = function(d) {
  return d.key
};

var margin = {
    top: 5,
    right: 25,
    bottom: 200,
    left: 30
  },
  width = 80 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;

// --- Global variables: END

// ------------------------------------------
// --- DATE SLIDER:  BEGIN


var unique_dates = uniques(symphony_data.map(function(d) {
  return d.RX_FILL_YYYYQTR;
}));

unique_dates.sort();

var dslider = dateslider().tickValues(unique_dates).width(600).callback(function() {
  RX_FILL_YYYYQTR = dslider.value();
  set_chart_data();
  update_PayerComp();
});

d3.select("#dateslider").append("svg").call(dslider);

var RX_FILL_YYYYQTR = unique_dates[0];

// --- DATE SLIDER:  END
// ------------------------------------------


// ------------------------------------------
// ---  THERAPUETIC CLASS DROP DOWN:  BEGIN

unique_TC = unique_TC.concat(uniques(symphony_data.map(function(d) {
  return d.TC_NAME;
})));

var TC_select = d3.select("#dropDown_TC").append("select").on("change", function() {
  TC_NAME = d3.select(this).property('value');

  SUB_TC_NAME = "ALL";
  MNFCTRR = "ALL";

  update_PayerComp();

  unique_SUBTC = ["ALL"];
  unique_MNFCTRR = ["ALL"];

  if (TC_NAME != "ALL") {
    unique_SUBTC = unique_SUBTC.concat(uniques(filtered_PayerComp_data_agg.map(function(d) {
      return d.SUB_TC_NAME;
    })));
  };
  if (TC_NAME != "ALL") {
    unique_MNFCTRR = unique_MNFCTRR.concat(uniques(filtered_PayerComp_data_agg.map(function(d) {
      return d.MNFCTRR;
    })));
  };

  SUBTC_options = SUBTC_select.selectAll("option").data(unique_SUBTC, function(d) {
    return d;
  });
 MNFCTRR_options = MNFCTRR_select.selectAll("option").data(unique_MNFCTRR, function(d) {
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
  MNFCTRR_options.enter()
    .append("option")
    .text(function(d) {
      return d;
    })
    .attr("value", function(d) {
      return d;
    });

  SUBTC_options.exit().remove();
  MNFCTRR_options.exit().remove();

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

var SUBTC_select = d3.select("#dropDown_SUBTC").append("select").on("change", function() {
  SUB_TC_NAME = d3.select(this).property('value');
  update_PayerComp();
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
unique_SGMNT = unique_SGMNT.concat(uniques(symphony_data.map(function(d) {
  return d.SGMNT;
})));

var SGMNT_select = d3.select("#dropDown_SEGMENT").append("select").on("change", function() {
  SGMNT = d3.select(this).property('value');
  update_PayerComp();
});

var SGMNT_options = SGMNT_select.selectAll("option")
  .data(unique_SGMNT)
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
// ------------------------------------------


var MNFCTRR_select = d3.select("#dropDown_MNFCTRR").append("select").on("change", function() {
  MNFCTRR = d3.select(this).property('value');

  DRUG_NAME = "ALL";

  update_PayerComp();

  unique_DRUG_NAME = ["ALL"];

  if (MNFCTRR != "ALL") {
    unique_DRUG_NAME = unique_DRUG_NAME.concat(uniques(filtered_PayerComp_data_client.map(function(d) {
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
// ---  BRAND DROP DOWN:  BEGIN

var DRUG_NAME_select = d3.select("#dropDown_BRAND").append("select").on("change", function() {
  DRUG_NAME = d3.select(this).property('value');
  update_PayerComp();
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

// ------------------------------------------
// ---  BRAND DROP DOWN:  END
//////////////////////////////////////////////////////////////////////

/********************************************************
*                                                       *
*   Create Data that we'll need                         *
*                                                       *
********************************************************/

function set_chart_data() {

  table_agg_data = [];
  table_client_data = [];
  filtered_PayerComp_data_agg;
  filtered_PayerComp_data_client;
	//*************NEED TO FIX FILTERS for clients*****************************

  var fields_agg = ["TC_NAME", "SUB_TC_NAME", "SGMNT", "RX_FILL_YYYYQTR"];
  var vals_agg = [TC_NAME, SUB_TC_NAME, SGMNT, RX_FILL_YYYYQTR];
  var datafilter_agg = "";
  var fields_client = ["TC_NAME", "SUB_TC_NAME", "SGMNT", "MNFCTRR", "DRUG_NAME", "RX_FILL_YYYYQTR"];
  var vals_client = [TC_NAME, SUB_TC_NAME, SGMNT, MNFCTRR, DRUG_NAME, RX_FILL_YYYYQTR];
  var datafilter_client = "";

  vals_agg.forEach(function(i, idx) {
    if (i != "ALL") {
      datafilter_agg = datafilter_agg + "d." + fields_agg[idx] + " == " + fields_agg[idx] + " && ";
    }
  });

  vals_client.forEach(function(i, idx) {
    if (i != "ALL") {
      datafilter_client = datafilter_client + "d." + fields_client[idx] + " == " + fields_client[idx] + " && ";
    }
  });

	filtered_PayerComp_data_agg = symphony_data.filter(function(d) {
	return eval(datafilter_agg.slice(0, -4));
	});

	filtered_PayerComp_data_client = filtered_PayerComp_data_agg.filter(function(d) {
  return eval(datafilter_client.slice(0, -4));
  });

  //console.log(filtered_PayerComp_data_client.length);
  //console.log(filtered_PayerComp_data_agg.length);
  //console.log(data_client.length);

    var tot_sales = d3.sum(filtered_PayerComp_data_agg, function(d){ return d.PYR_SLS_AMT;});
    var avg_tot_sales = d3.mean(filtered_PayerComp_data_agg, function(d){ return d.PYR_SLS_AMT;});
    var tot_patient_cnt = d3.sum(filtered_PayerComp_data_agg, function(d){ return d.PYR_PAT_CNT;});
    var tot_trx = d3.sum(filtered_PayerComp_data_agg, function(d){ return d.PYR_TRX;});
    //var avg_tot_trx = d3.mean(filtered_PayerComp_data_agg, function(d){ return d.PYR_TRX;});
    var tot_rebates = d3.sum(filtered_PayerComp_data_agg, function(d){ return d.PYR_RBT_AMT;});

  //group data by payer
	function group_data(adata){
		return d3.nest()
    	.key(function(d) {
    		return d.PYR_NAME;
    	})
    	.sortKeys(d3.ascending)
    	.rollup(function(v) {
      		return {
        		tot_payer_rebates: d3.sum(v, function(d) {
          			return d.PYR_RBT_AMT;
        		}),
        		tot_payer_sales: d3.sum(v, function(d) {
          			return d.PYR_SLS_AMT;
        		}),
        		tot_payer_trx: d3.sum(v, function(d) {
          			return d.PYR_TRX;
        		}),
        		tot_payer_patient_cnt: d3.sum(v, function(d) {
          			return d.PYR_PAT_CNT;
        		})
    		};
    	})
    	.entries(adata);
    }
  //console.log(filtered_PayerComp_data_agg.length);
	var databyPayer = group_data(filtered_PayerComp_data_agg);
	var databyPayerbyClient = group_data(filtered_PayerComp_data_client);
  //console.log(table_client_data);
  var payersCnt = databyPayer.length;
  //console.log(databyPayer.length);

	function create_table_data(adata, atable_data){
	    adata.forEach(function(d) {
	    	atable_data.push({
	 			PYR_NAME : d.key,
				RebatestoSales : d3.format("%")(d3.round((d.values.tot_payer_rebates )/(d.values.tot_payer_sales), 2)),
        ScriptstoPatient : d3.round((d.values.tot_payer_trx)/(tot_trx) - (d.values.tot_payer_patient_cnt)/(tot_patient_cnt), 2),
	 			MarketSharebySales : d3.format("%")(d3.round((d.values.tot_payer_sales/tot_sales ), 2)),
        //PayerSize: d.values.tot_payer_patient_cnt,
				MarketSharebyPatient : d3.format("%")(d3.round((d.values.tot_payer_patient_cnt/tot_patient_cnt), 2)),
				MarketSharebyScripts : d3.format("%")(d3.round((d.values.tot_payer_trx/tot_trx), 2)),
        PayerRevenue: d3.format("$,")(d3.round((d.values.tot_payer_sales)/(1000000), 2)),
        PayerRebates: d3.format("$,")(d3.round((d.values.tot_payer_rebates)/(1000000), 2)),
        PatientCnt: d3.format(",")(d.values.tot_payer_patient_cnt),
        //Difference of market share by scripts to national avg market share (which is ratio of payers)
        MarketSharebyScriptstoNational : d3.round((d.values.tot_payer_trx/tot_trx) - (1/payersCnt), 2),
        SalestoPatient : d3.round(((d.values.tot_payer_sales/tot_sales ) - (d.values.tot_payer_patient_cnt/tot_patient_cnt)), 2),
				MarketSharebyRebates : d3.format("%")(d3.round((d.values.tot_payer_rebates/tot_rebates), 2)),
        GTNtoLive: d3.round((d.values.tot_payer_sales - d.values.tot_payer_rebates)/(d.values.tot_payer_patient_cnt), 2)
  	    	});
		})
	}

	create_table_data(databyPayer, table_agg_data);
  create_table_data(databyPayerbyClient, table_client_data);
  //console.log(table_agg_data.map(function (d) {return d.GTNtoLive;}));

//Apply scaling on payer size to get value range of 1, 2 or 3
 payersize = function(d){
  if( d <= 5){
    return 1;
  }
  else if (d <= 10) {
    return 2;
  }
  else{
    return 3;
  }
}


//ranking performed as sum of scaled values from SalestoPatients and GTNtoLive.
  function rank_payers(atable_data){
    var rank_scores =[];
    var var1 = [];
    var var2 = [];
    var patient_cnt_arr = d3.entries(table_agg_data).map(function(d) {return +((d.value.PatientCnt).replace(',',""));});
    var sales_2_patient_arr  = d3.entries(table_agg_data).map(function(d) {return d.value.SalestoPatient;});
    var gtn_2_live_arr = d3.entries(table_agg_data).map(function(d) {return d.value.GTNtoLive;});

      var size_scale = d3.scale.linear()
                        .domain([d3.min(patient_cnt_arr), d3.max(patient_cnt_arr)])
                        .range([0, 15]);
    console.log([d3.min(patient_cnt_arr), d3.max(patient_cnt_arr)]);
      var scale1 = d3.scale.linear()
                     .domain([d3.min(sales_2_patient_arr), d3.max(sales_2_patient_arr)])
                     .range([7, 45]);
      var scale2 = d3.scale.linear()
                     .domain([d3.min(gtn_2_live_arr), d3.max(gtn_2_live_arr)])
                     .range([7, 45]);
      for(var i=0; i< atable_data.length; i++){
        atable_data[i].MPScores = d3.round(scale1(atable_data[i].SalestoPatient) + scale2(atable_data[i].GTNtoLive) );
        atable_data[i].PayerSize = payersize(size_scale(patient_cnt_arr[i]));
      }

      rank_scores = atable_data.map(function (d) {return d.MPScores;});
      var sorted = atable_data.map(function (d) {return d.MPScores;}).sort().reverse();
      //var sorted = rank_scores.slice().sort(function(a,b){return b-a});
      var ranks = rank_scores.slice().map(function(v){ return sorted.indexOf(v)+1 });
      for(var i=0; i< atable_data.length; i++){
        atable_data[i].Rank =  ranks[i];
        //atable_data[i].MPScores = d3.round(rank_scores[i], 2);//score_scale(rank_scores[i]); !!!!!NOT SCALE but limit max score to <90
      }
  }

  rank_payers(table_agg_data);
  rank_payers(table_client_data);

}

/********************************************************
*                                                       *
*  Create the Visualizations                            *
*                                                       *
********************************************************/
function init_PayerComp() {
	set_chart_data();
  //console.log(table_agg_data);

  function domainofvalues(array){
    return [d3.min(array), d3.max(array)];
  }

  function getcolumnvals(objarray, colname){
    return objarray.map(function(d) {return d[colname];} );
  }

  //console.log(domainofvalues(getcolumnvals(table_agg_data, "ScriptstoPatient")));

  //aggregate payer table
 // $(document).ready(function() {
    agg_table =  $('#data-table-agg').DataTable( {
      "aaData": table_agg_data,
      "aoColumns": [
              {
                "sTitle": "Range",
                "sDefaultContent": "Global",
                "sClass": "Range",
                "orderable": false
              },
              { "sTitle": "Payer Name",
                "mData": "PYR_NAME",
                "sClass": "PYR_NAME"
              }, // <-- which values to use inside object and which title
              { "sTitle": "Rank",
                "mData": "Rank",
                "sClass": "Rank"
              },
              { "sTitle": "Market Share % (Scripts)",
                "mData": "MarketSharebyScripts",
                "sClass": "MarketSharebyScripts"
              },
              { "sTitle": "Market Share % (Sales)",
                "mData": "MarketSharebySales",
                "sClass": "MarketSharebySales"
              },
              { "sTitle": "Payer Size",
                "mData": "PayerSize",
                "sClass": "PayerSize"
              },
              { "sTitle": "Payer Revenue (in millions)",
                "mData": "PayerRevenue",
                "sClass": "PayerRevenue",
              },
              { "sTitle": "Payer Rebate Amt (in millions)",
                "mData": "PayerRebates",
                "sClass": "PayerRebateAmt",
              },
              //{ "sTitle": "Rebates %",
              //  "mData": "MarketSharebyRebates",
              //  "sClass": "MarketSharebyRebates"
              //},
              { "sTitle": "Patient Cnt",
                "mData": "PatientCnt",
                "sClass": "PatientLives",
              },
              { "sTitle": "Patient %",
                "mData": "MarketSharebyPatient",
                "sClass": "MarketSharebyPatient"
              },
              { "sTitle": "Rebates %",
                "mData": "RebatestoSales",
                "sClass": "RebatestoSales"
              },
              { "sTitle": "Avg % Sales compared to TRX Patients",
                "mData": "SalestoPatient",
                "sClass": "SalestoPatient",
                "fnCreatedCell": function(td, cellData, rowData, iRow, iColumn) {
                  //var color = (cellData >= 0)? 'green': 'red';
                  var mydomain = domainofvalues(getcolumnvals(table_agg_data, "SalestoPatient"));
                  var colorScale = d3.scale.linear()
                    .range(['red', 'yellow', 'green'])
                    .domain([mydomain[0], 0, mydomain[1]]);
                  $(td).css("background-color", colorScale(cellData));
                }
              },
              { "sTitle": "GTN per Patient",
                "mData": "GTNtoLive",
                "sClass": "GTNtoLive",
                "fnCreatedCell": function(td, cellData, rowData, iRow, iColumn) {
                  //var color = (cellData >= 0)? 'green': 'red';
                  var mydomain = domainofvalues(getcolumnvals(table_agg_data, "GTNtoLive"));
                  var colorScale = d3.scale.linear()
                    .range(['red', 'yellow', 'green'])
                    .domain([mydomain[0], 0, mydomain[1]]);
                  $(td).css("background-color", colorScale(cellData));
                }
              },
              { "sTitle": "Market Perfomance Score",
                "mData": "MPScores",
                "sClass": "MarketPerfomanceScore"
              }
            ],
      "bAutoWidth": false,
      "bDeferRender": true,
      //"bPaginate": false,
      //"bLengthChange": false,
      "order": [[ 1, "asc" ]]
    });
    //$('#data-table-agg').DataTable().clear()
    //agg_table.draw();
 // });


var mydomain1 = domainofvalues(getcolumnvals(table_client_data, "SalestoPatient"));
var mydomain2 = domainofvalues(getcolumnvals(table_client_data, "GTNtoLive"));
var colorScale1 = d3.scale.linear()
                    .range(['red', 'yellow', 'green'])
                    .domain([mydomain1[0], 0, mydomain1[1]]);

var colorScale2 = d3.scale.linear()
                    .range(['red', 'yellow', 'green'])
                    .domain([mydomain2[0], 0, mydomain2[1]]);

  ////////////////////////////////////BEGINING OF ATTEMPT TO TOGGLE ROWS///////////////////////////


/*$('#expandbutton').on('click', function () {
    //var tr = $(this).closest('tr');
    //var row = table.row( tr );
    var row = $('#agg_table').DataTable().rows();
    //var rowIdx = row.index();
    console.log(row);
    //grab all row elements from table;

    if ( row.child.isShown() ) {
        // This row is already open - close it
        $('div.slider', row.child()).slideUp( function () {
            row.child.hide();
            tr.removeClass('shown');
        } );
    }
    else {
        // Open this row
        row.child().show();
        tr.addClass('shown');
        $('div.slider', row.child()).slideDown();
    }
  } );*/


  agg_table.rows().every( function ( rowIdx, tableLoop, rowLoop) {
    var color1 = colorScale1(table_client_data[rowIdx].SalestoPatient);
    var color2 = colorScale2(table_client_data[rowIdx].GTNtoLive);
    //console.log('<td color='+color1+'>'+table_client_data[rowIdx].SalestoPatient+'</td>');
    this
        .child(
          $(
          //'<div class="rowslider table compare">'+
            //'<table class="table table2">'+
                '<tr class="">'+
                    '<td> Client </td>'+
                    '<td>'+table_client_data[rowIdx].PYR_NAME+'</td>'+
                    '<td>'+table_client_data[rowIdx].Rank+'</td>'+
                    '<td>'+table_client_data[rowIdx].MarketSharebyScripts+'</td>'+
                    '<td>'+table_client_data[rowIdx].MarketSharebySales+'</td>'+
                    '<td>'+table_client_data[rowIdx].PayerSize+'</td>'+
                    '<td>'+table_client_data[rowIdx].PayerRevenue+'</td>'+
                    '<td>'+table_client_data[rowIdx].PayerRebates+'</td>'+
                    '<td>'+table_client_data[rowIdx].PatientCnt+'</td>'+
                    '<td>'+table_client_data[rowIdx].MarketSharebyPatient+'</td>'+
                    '<td>'+table_client_data[rowIdx].RebatestoSales+'</td>'+
                    '<td bgcolor='+color1+'>'+table_client_data[rowIdx].SalestoPatient+'</td>'+
                    '<td bgcolor='+color2+'>'+table_client_data[rowIdx].GTNtoLive+'</td>'+
                    '<td>'+table_client_data[rowIdx].MPScores+'</td>'+
                '</tr>' //+
              //'</table>'//+
            //'</div>'
          )
        )
        .show();
  } );


/*  $("#filterbutton").click(function() {
      $.fn.dataTable.ext.search.push(
        function(settings, data, dataIndex) {
            return agg_table.row(dataIndex).nodes().to$().find('td[Range]').data() != 'Global';
          }
      );
      agg_table.draw();
  });
  $("#reset").click(function() {
      $.fn.dataTable.ext.search.pop();
      agg_table.draw();
  });*/
////////////////////////////////////END OF ATTEMPT TO TOGGLE ROWS///////////////////////////


}

function update_PayerComp(){
  //$('#data-table-agg').DataTable().destroy();
  //$('#data-table-client').DataTable().destroy();
  agg_table.clear();
  //client_table.clear();
  //set_chart_data();
  //agg_table.draw()
  init_PayerComp();
	//set_chart_data();
  //PayerComp_data_agg.clear();
  //PayerComp_data_agg.rows.add(filtered_PayerComp_data_agg);
  //PayerComp_data_agg.draw();
  //$('#data-table-agg').DataTable().ajax.reload();
	//svg.data(table_agg_data).transition().duration(1000).call(chart);
  //svg.data(table_client_data).transition().duration(1000).call(chart);
}

init_PayerComp();
