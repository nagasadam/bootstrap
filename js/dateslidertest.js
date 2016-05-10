

// ------------------------------------------
// --- Global variables: BEGIN




// --- Global variables: END
// ------------------------------------------


// ------------------------------------------
// --- DATE SLIDER:  BEGIN

var unique_dates = ["2014 Q1", "2014 Q2","2014 Q3","2014 Q4", "2015 Q1", "2015 Q2","2015 Q3","2015 Q4"]

unique_dates.sort();

//  Create date objects

var dateParsed = unique_dates.map(function(d, i){
       var splitted = d.split(' ');
       var quarterStartMonth = 3 * ( splitted[1].charAt(1) -1) + 1;

       return d3.time.format('%m %Y').parse(quarterStartMonth + ' ' + splitted[0]);
   });

var sliderWidth = document.getElementById("dateslider").offsetWidth;



var RX_FILL_YYYYQTR_MIN = unique_dates[0];
var RX_FILL_YYYYQTR_MAX = unique_dates[ (unique_dates.length-1) ];

d3.select("#dateslider").call(d3.slider().axis(true).value([unique_dates[0], unique_dates[1]]).tickValues(unique_dates).on("slideend", function(value)
{

    RX_FILL_YYYYQTR_MIN = value[ 0 ];
    RX_FILL_YYYYQTR_MAX =  value[ 1 ];

}));



// --- DATE SLIDER:  END
// ------------------------------------------
