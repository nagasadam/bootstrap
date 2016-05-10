function apply_filters(){

  //*************NEED TO FIX FILTERS for clients*****************************

  var fields_agg = ["TC_NAME", "SUB_TC_NAME", "SGMNT"];
  var vals_agg = [TC_NAME, SUB_TC_NAME, SGMNT];
  var datafilter_agg = "";
  var fields_client = ["TC_NAME", "SUB_TC_NAME", "SGMNT", "MNFCTRR", "DRUG_NAME"];
  var vals_client = [TC_NAME, SUB_TC_NAME, SGMNT, MNFCTRR, DRUG_NAME];
  var datafilter_client = "";

  vals_agg.forEach(function(i, idx) {
    if (i != "ALL") {
      datafilter_agg = datafilter_agg + "d." + fields_agg[idx] + " == " + fields_agg[idx] + " && ";
    }
  });

  datafilter_agg = datafilter_agg + " d.RX_FILL_YYYYQTR >= RX_FILL_YYYYQTR_MIN && ";
  datafilter_agg = datafilter_agg + " d.RX_FILL_YYYYQTR <= RX_FILL_YYYYQTR_MAX  ";

  vals_client.forEach(function(i, idx) {
    if (i != "ALL") {
      datafilter_client = datafilter_client + "d." + fields_client[idx] + " == " + fields_client[idx] + " && ";
    }
  });

  datafilter_client = datafilter_client + " d.RX_FILL_YYYYQTR >= RX_FILL_YYYYQTR_MIN && ";
  datafilter_client = datafilter_client + " d.RX_FILL_YYYYQTR <= RX_FILL_YYYYQTR_MAX  ";

  filtered_payercomp_data_agg = payercomp_data.filter(function(d) {
  return eval(datafilter_agg);
  });

  //console.log(filtered_payercomp_data_agg.length);

  filtered_payercomp_data_client = payercomp_data.filter(function(d) {
  return eval(datafilter_client);
  });
  //filtered_payercomp_data_client = filtered_payercomp_data_agg;

  //console.log(datafilter_agg);
  //console.log(datafilter_client);
}


//group data by payer
function group_data(adata){
  var dist_dates = uniques(adata.map(function(d) {
    return d.RX_FILL_YYYYQTR;
  })).length;


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
              return (d.PYR_PAT_CNT)/(dist_dates);
          })
      };
    })
    .entries(adata);
}

//calculating some table columns
function create_table_data(adata, atable_data){

  var dist_dates = uniques(adata.map(function(d) {
    return d.RX_FILL_YYYYQTR;
  })).length;


  var payersCnt = databyPayer.length;

  var tot_sales = d3.sum(filtered_payercomp_data_agg, function(d){ return d.PYR_SLS_AMT;});
  var avg_tot_sales = d3.mean(filtered_payercomp_data_agg, function(d){ return d.PYR_SLS_AMT;});
  var tot_patient_cnt = (d3.sum(filtered_payercomp_data_agg, function(d){ return d.PYR_PAT_CNT;}))/(dist_dates);
  var tot_trx = d3.sum(filtered_payercomp_data_agg, function(d){ return d.PYR_TRX;});
  //var avg_tot_trx = d3.mean(filtered_PayerComp_data_agg, function(d){ return d.PYR_TRX;});
  var tot_rebates = d3.sum(filtered_payercomp_data_agg, function(d){ return d.PYR_RBT_AMT;});

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
    SalestoPatient : d3.format("%")(d3.round(((d.values.tot_payer_sales/tot_sales ) - (d.values.tot_payer_patient_cnt/tot_patient_cnt)), 2)),
    MarketSharebyRebates : d3.format("%")(d3.round((d.values.tot_payer_rebates/tot_rebates), 2)),
    GTNtoLive: d3.format("$,")(d3.round((d.values.tot_payer_sales - d.values.tot_payer_rebates)/(d.values.tot_payer_patient_cnt), 2))
      });
  })
}

//create function for mapping entries to array given an object array and string attribute
function getcolumnvals(objarray, colname){
  if( colname == "GTNtoLive" ){
    return objarray.map(function(d) {return +(d[colname].replace('$',"").replace(',',""));} );
  }
  else {
      return objarray.map(function(d) {return +(d[colname].replace('%',""))/100;} );
  }
  //return d3.entries(objarray).map(function(d) {return d.value.colname;});
}

//create function that returns scale given array of domain and array of range

var mydomain1 = domainofvalues(getcolumnvals(table_client_data, "SalestoPatient"));
var mydomain2 = domainofvalues(getcolumnvals(table_client_data, "GTNtoLive"));
var colorScale1 = d3.scale.linear()
                    .range(['red', 'yellow', 'green'])
                    .domain([mydomain1[0], 0, mydomain1[1]]);

var colorScale2 = d3.scale.linear()
                    .range(['red', 'yellow', 'green'])
                    .domain([mydomain2[0], 0, mydomain2[1]]);

function domainofvalues(array){
  return [d3.min(array), d3.max(array)];
}


//ranking performed as sum of scaled values from SalestoPatients and GTNtoLive.
function rank_payers(atable_data){
  var rank_scores =[];
  var sales_2_patient_arr  = getcolumnvals(atable_data, "SalestoPatient");
  var gtn_2_live_arr = getcolumnvals(atable_data, "GTNtoLive");

  //console.log([d3.min(patient_cnt_arr), d3.max(patient_cnt_arr)]);
    var sales2pat_scale = d3.scale.linear()
                   .domain([d3.min(sales_2_patient_arr), d3.max(sales_2_patient_arr)])
                   .range([7, 45]);
    var gtn2live_scale = d3.scale.linear()
                   .domain([d3.min(gtn_2_live_arr), d3.max(gtn_2_live_arr)])
                   .range([7, 45]);
    for(var i=0; i< atable_data.length; i++){
      atable_data[i].MPScores = d3.round(sales2pat_scale(sales_2_patient_arr[i]) + gtn2live_scale(gtn_2_live_arr[i]) );
    }
    //LAST COLUMN NAN PROBLEM numbers coming "GTN to live" column and  sales 2 patient
    rank_scores = atable_data.map(function (d) {return d.MPScores;});
    var sorted = atable_data.map(function (d) {return d.MPScores;}).sort().reverse();
    //var sorted = rank_scores.slice().sort(function(a,b){return b-a});
    var ranks = rank_scores.slice().map(function(v){ return sorted.indexOf(v)+1 });
    for(var i=0; i< atable_data.length; i++){
      atable_data[i].Rank =  ranks[i];
      //atable_data[i].MPScores = d3.round(rank_scores[i], 2);//score_scale(rank_scores[i]); !!!!!NOT SCALE but limit max score to <90
    }
}

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

// Scale Payer size in bins with values [1, 2, 3]
function bin_payerSize(atable_data){

  var patient_cnt_arr = d3.entries(atable_data).map(function(d) {return +((d.value.PatientCnt).replace(',',""));});

    var size_scale = d3.scale.linear()
                      .domain([d3.min(patient_cnt_arr), d3.max(patient_cnt_arr)])
                      .range([0, 15]);

    for(var i=0; i< atable_data.length; i++){
      atable_data[i].PayerSize = payersize(size_scale(patient_cnt_arr[i]));
    }
}


///ADJUST PAYERCNT AND PAYERSIZE TO BE AVEARAGE OVER NUMBER OF UNIQUE DATES
function set_chart_data() {

  apply_filters();

  //console.log(filtered_payercomp_data_agg[0]);
	databyPayer = group_data(filtered_payercomp_data_agg);
	databyPayerbyClient = group_data(filtered_payercomp_data_client);
  //console.log(table_client_data);
  var payersCnt = databyPayer.length;
  //console.log(databyPayer.length);

  table_agg_data = [];
  table_client_data = [];

	create_table_data(databyPayer, table_agg_data);
  create_table_data(databyPayerbyClient, table_client_data);
  //console.log(table_agg_data.map(function (d) {return d.GTNtoLive;}));

  rank_payers(table_agg_data);
  rank_payers(table_client_data);

  bin_payerSize(table_agg_data);
  bin_payerSize(table_client_data);
}

/* HELPERS
 * These will be transferred to dataTables table initiation stage when the reason found for malfunction
 * not sure though if it will be more advantage processing wise or not
*/
// Accepts value and rounding type for cell values.
function roundUp(val, round){
  var val = Math.round(Number(val.replace(/[^0-9\.]+/g,"")));
      val = val.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

      return val;
}

function arrowDirection (val) {
  var val = Number(val.replace(/[^0-9\.]+/g,""));
  var arrowDir = "right";
      if(val >= 1){
        arrowDir = "up";
      } else if(val <= -1){
        arrowDir = "down";
      }

      return arrowDir;
}

/* Event Handlers */
// Child row toggle
$('input#compare-checkbox').on('click', function(){
    if ($('.compare-row').hasClass('show')) {
        // This row is already open - close it
        $('.compare-row, #dropDown_DRUG_NAME, #dropDown_MNFCTRR').fadeOut().toggleClass('show');
    }
    else {
        // Open this row
        $('.compare-row, #dropDown_DRUG_NAME, #dropDown_MNFCTRR').toggleClass('show').fadeIn();
    }
});

/* init */
function init_payercomp() {
  set_chart_data();
  //console.log(table_client_data.length);
  //console.log(MNFCTRR);
  //console.log(DRUG_NAME);

  //aggregate payer table
  $(document).ready(function() {
    agg_table =  $('#data-table-agg').DataTable( {
      "aaData": table_agg_data,

      "aoColumns": [
              {
                "sTitle": "Biopharma Company",
                "sDefaultContent": "All",
                "sClass": "Range",
                "orderable": false
              },
              { "sTitle": "Payer Name",
                "mData": "PYR_NAME",
                "sClass": "PYR_NAME"
                // "fnCreatedCell": function(td, cellData, rowData, iRow, iColumn) {
                //   $(td).html('<div class="'+cellData+'"></div>');
                // }
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
              { "sTitle": "Patient Share %",
                "mData": "MarketSharebyPatient",
                "sClass": "MarketSharebyPatient"
              },
              { "sTitle": "Payer Size",
                "mData": "PayerSize",
                "sClass": "PayerSize",
                "fnCreatedCell": function(td, cellData, rowData, iRow, iColumn) {
                  $(td).html('<div class="size'+cellData+'">'+cellData+'</div>');
                }
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
                "fnCreatedCell": function(td, cellData, rowData, iRow, iColumn) {
                  $(td).html(roundUp(cellData, "ceil"));
                }
              },
              { "sTitle": "Rebates %",
                "mData": "RebatestoSales",
                "sClass": "RebatestoSales"
              },
              { "sTitle": "Market Share (Sales) vs Patient Share",
                "mData": "SalestoPatient",
                "sClass": "SalestoPatient",
                "fnCreatedCell": function(td, cellData, rowData, iRow, iColumn) {
                var arrowData = roundUp(cellData, "round");
                var arrDirection = arrowDirection(arrowData);
                  var mydomain = domainofvalues(getcolumnvals(table_agg_data, "SalestoPatient"));
                  var colorScale = d3.scale.linear()
                    .range(['red', 'yellow', 'green'])
                    .domain([mydomain[0], 0, mydomain[1]]);
                  var arrowColor = colorScale(+(cellData.replace('%',""))/100);
                  $(td).html('<span class="data">'+cellData+'</span><span class="arrow icon-arrow-'+arrDirection+'" style="color:'+arrowColor+'"></span>');
                }
              },
              { "sTitle": "GTN per Patient",
                "mData": "GTNtoLive",
                "sClass": "GTNtoLive",
                "fnCreatedCell": function(td, cellData, rowData, iRow, iColumn) {
                var cellData = roundUp(cellData, "round");
                var arrDirection = arrowDirection(cellData);
                  var mydomain = domainofvalues(getcolumnvals(table_agg_data, "GTNtoLive"));
                  var colorScale = d3.scale.linear()
                    .range(['red', 'yellow', 'green'])
                    .domain([mydomain[0], 0, mydomain[1]]);
                  var arrowColor = colorScale(+(cellData.replace('$',"").replace(',',"")));
                  $(td).html('<span class="data">$'+cellData+'</span><span class="arrow icon-arrow-'+arrDirection+'" style="color:'+arrowColor+'"></span>');
                }
              },
              { "sTitle": "Market Perfomance Score",
                "mData": "MPScores",
                "sClass": "MarketPerfomanceScore"
              }
            ],
      "bAutoWidth": false,
      "bDeferRender": true,
      "sDom": 't',
      //"bFilter": false,
      //"bInfo": false,
      //"bPaginate": false,
      //"bLengthChange": false,
      "order": [[ 2, "asc" ]]
    });
    //end of creating table

    // Add child rows for every row in table
    agg_table.rows().every( function ( rowIdx, tableLoop, rowLoop) {

      //get the name of the payer and find corresponding child row
      var cur_payer = table_agg_data[rowIdx].PYR_NAME;
      function if_exist(){
                  if( table_client_data.filter(function(d) {return d.PYR_NAME == cur_payer;}).length > 0){
                      return table_client_data.filter(function(d) {return d.PYR_NAME == cur_payer;});
                    }
                  else{
                    return null;
                  }
                }

      var child_row = if_exist();
      //console.log(cur_payer);
      //console.log(child_row);

      if( child_row != null){
        // var color1 = colorScale1(child_row[0].SalestoPatient);
        // var color2 = colorScale2(child_row[0].GTNtoLive);
        // if (MNFCTRR is all capital)
        if(MNFCTRR == "ALL"){
          MNFCTRR = "All";
        }
        if(DRUG_NAME == "ALL"){
          DRUG_NAME = "All Products";
        }


        var spArrowData = roundUp(child_row[0].SalestoPatient, "round");
        var spArrDirection = arrowDirection(spArrowData);
        var spDomain = domainofvalues(getcolumnvals(table_agg_data, "SalestoPatient"));
        var spColorScale = d3.scale.linear()
          .range(['red', 'yellow', 'green'])
          .domain([spDomain[0], 0, spDomain[1]]);
        var spArrowColor = spColorScale(+(child_row[0].SalestoPatient.replace('%',""))/100);

        var gtnData = roundUp(child_row[0].GTNtoLive, "round");
        var gtnArrDirection = arrowDirection(gtnData);
        var gtnDomain = domainofvalues(getcolumnvals(table_agg_data, "GTNtoLive"));
        var gtnColorScale = d3.scale.linear()
          .range(['red', 'yellow', 'green'])
          .domain([gtnDomain[0], 0, gtnDomain[1]]);
        var gtnArrowColor = gtnColorScale(+(gtnData.replace('$',"").replace(',',"")));

        //console.log('<td color='+color1+'>'+table_client_data[rowIdx].SalestoPatient+'</td>');
        this
            .child(
              $(
              //'<div class="rowslider table compare">'+
                //'<table class="table table2">'+
                    '<tr class="compare-row">'+
                        '<td>'+MNFCTRR+'<br/>'+DRUG_NAME +'</td>'+
                        '<td>'+child_row[0].PYR_NAME+'</td>'+
                        '<td>'+child_row[0].Rank+'</td>'+
                        '<td>'+child_row[0].MarketSharebyScripts+'</td>'+
                        '<td>'+child_row[0].MarketSharebySales+'</td>'+
                        '<td>'+child_row[0].MarketSharebyPatient+'</td>'+
                        '<td class="PayerSize"><div class="size'+child_row[0].PayerSize+'">'+child_row[0].PayerSize+'</div></td>'+
                        '<td>'+child_row[0].PayerRevenue+'</td>'+
                        '<td>'+child_row[0].PayerRebates+'</td>'+
                        '<td class="PatientLives">'+roundUp(child_row[0].PatientCnt, "ceil")+'</td>'+
                        '<td>'+child_row[0].RebatestoSales+'</td>'+
                        '<td class="SalestoPatient"><span class="data">'+child_row[0].SalestoPatient+'</span><span class="arrow icon-arrow-'+spArrDirection+'" style="color:'+spArrowColor+'"></span></td>'+
                        '<td class="GTNtoLive"><span class="data">$'+gtnData+'</span><span class="arrow icon-arrow-'+gtnArrDirection+'" style="color:'+gtnArrowColor+'"></span></td>'+
                        '<td>'+child_row[0].MPScores+'</td>'+
                    '</tr>' //+
                  //'</table>'//+
                //'</div>'
              )
            )
            .show();
      }
    });
    // hide loader animation
    $('.loader').fadeOut().css('display','none');
    //page is hiding pull downs. It is time to reveal
    $('form.dropdowns').css('display','flex').fadeIn();
    // check if compare is on. if so, expand child row.
    if($('input#compare-checkbox').is( ":checked" )) {
      $('.compare-row').toggleClass('show').fadeIn();
    }

  });
}



function update_payercomp(){
  //filtered_payercomp_data_agg = null;
  //filtered_payercomp_data_client = null;
  //agg_table.clear();
  //client_table.clear();
  agg_table.destroy();
  // reset_ui();
  //set_chart_data();
  init_payercomp();
  //agg_table.ajax.reload();
  //svg.data(table_agg_data).transition().duration(1000).call(chart);
  //svg.data(table_client_data).transition().duration(1000).call(chart);
}

init_payercomp();

