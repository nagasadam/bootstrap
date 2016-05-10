// Create the legend
gtnpatient_legend = function ()
{
var svglegend = d3.select('#gtnpatient_legend')
  .append('svg')
  .attr("id", "svglegend")
  .attr('width', svgWidth)
  .attr('height', 30);

var allLegend = svglegend.append("g")
                      .attr("id","allLegend");

var legendRectSize = 18;
var legendSpacing = 4;

var offset = 0;
var legendBlockWidth = 15;
var textMargin = 10;
var fontsize = 12;


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
                              legendBlockWidth/2 + fontsize/2
                              ].join(',') + ')')
                     .style("fill", "white")
                     .style("font-size", fontsize)
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

legend.on( "dblclick", function() {

        alert("dbl");
        var curr = d3.select(this);

        d3.entries(curr[0])[0].value.children[1].setAttribute("opacity", 0.8);
        d3.entries(curr[0])[0].value.children[1].setAttribute("stroke", "#333");
        d3.entries(curr[0])[0].value.children[1].setAttribute("stroke-width", 3);
        d3.entries(curr[0])[0].value.children[1].setAttribute("stroke-opacity", 1.0);

        PYR_NAME = d3.entries(curr[0])[0].value.__data__;
        PYR_NAME = PYR_NAME.replace(" ", "");

        var AllLines = d3.selectAll("g.payer");
         var currline = d3.selectAll("." + PYR_NAME);

        AllLines[0].forEach( function(m) {

          m.children[0].setAttribute("opacity","0.0")
          m.children[1].setAttribute("opacity","0.0")
          m.children[3].setAttribute("opacity","0.0")
          m.children[4].setAttribute("opacity","0.0")
        })

         currline[0][0].setAttribute("opacity", "0.8")
         currline[0][1].setAttribute("opacity", "0.8")
         currline[0][2].setAttribute("style", "fill: #ffffff; font-size: 12px; opacity: 1.0")
         currline[0][3].setAttribute("style", "fill: #ffffff; font-size: 12px; opacity: 1.0")

     })

.on("mouseleave",  function() {

  var AllLines = d3.selectAll("g.payer");

  var curr = d3.select(this);

  d3.entries(curr[0])[0].value.children[1].setAttribute("stroke-opacity", 0.0);
  d3.entries(curr[0])[0].value.children[1].setAttribute("opacity", 1.0);

  AllLines[0].forEach( function(m) {

      m.children[0].setAttribute("opacity","0.8")
      m.children[1].setAttribute("opacity","0.8")
      m.children[3].setAttribute("style", "fill: #ffffff; font-size: 12px; opacity: 0.0")
      m.children[4].setAttribute("style", "fill: #ffffff; font-size: 12px; opacity: 0.0")
  })
          })
.on("click", onclick)
alert("single");
d3.select('#allLegend').attr("transform", "translate(" + (svgWidth/2 - offset/2) +",0)");

}



var clickedOnce = false;
var timer;

$("#gtnpatient_legend").bind("click", function(){
    if (clickedOnce) {
        run_on_double_click();
    } else {
        timer = setTimeout(run_on_simple_click, 150);
        clickedOnce = true;
    }
});

function run_on_simple_click() {
    alert("simpleclick");
    clickedOnce = false;
}

function run_on_double_click() {
    clickedOnce = false;
    clearTimeout(timer);
    alert("doubleclick");
}


