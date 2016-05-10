function dateslider() {
  var margin = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    },
    width = 200,
    height = 60,
    ticks = 5,
    tickSize = 0,
    tvalues = ["2014Q1", "2014Q2"],
    brush = d3.svg.brush(),
    handle, slider,
    value = 0,
    xoffset = 50,
    fmt = "",
    upd = function(d) {
      value = d;
    },
    cback = function(d) {};

  var range = [];

  for (var k = 0; k < tvalues.length; k++) {
    range.push(k * width / tvalues.length + xoffset)
  };

  var x = d3.scale.ordinal()
    .domain(tvalues)
    .range(range);

  function chart(el) {

    range = [];

    for (var k = 0; k < tvalues.length; k++) {
      range.push(k * width / tvalues.length + xoffset)
    };

    var x = d3.scale.ordinal()
      .domain(tvalues)
      .range(range);

    brush.x(x).extent([0, 0])
      .on("brush", brushed);

    var svg_slider = el.attr("width", width + 20)
      .attr("height", height)
      .append("g").attr("transform", "translate (10,0)");

    svg_slider.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height / 2 + ")")
      .call(d3.svg.axis().scale(x).orient("top").tickValues(tvalues).tickSize(tickSize).tickPadding(15))
      .attr("class", "halo");

    slider = svg_slider.append("g")
      .attr("class", "slider")
      .call(brush)
      .style({
        "fill": "#69f",
        "fill-opacity": "0.3"
      });

    slider.selectAll(".extent,.resize").remove();
    slider.select(".background").attr("height", height)

    handle = slider.append("circle")
      .attr("class", "handle")
      .attr("transform", "translate(0," + height / 2 + ")")
      .attr("cx", x(value))
      .attr("r", 9);

    function brushed() {
      if (d3.event.sourceEvent) {
        var domain = x.domain();
        range = x.range();
        var xPos = d3.mouse(this)[0];
        value = domain[d3.bisect(range, xPos) - 1];
        upd(value);
        cback();
      }


    }
    upd = function(v) {
      brush.extent([v, v]);
      value = brush.extent()[0];
      handle.attr("cx", x(value));
    }
  }
  chart.fmt = function(_) {
    if (!arguments.length) return fmt;
    fmt = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };
  chart.ticks = function(_) {
    if (!arguments.length) return ticks;
    ticks = _;
    return chart;
  };
  chart.tickSize = function(_) {
    if (!arguments.length) return tickSize;
    tickSize = _;
    return chart;
  };
  chart.tickValues = function(_) {
    if (!arguments.length) return tvalues;
    tvalues = _;
    return chart;
  };
  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };
  chart.callback = function(_) {
    if (!arguments.length) return cback;
    cback = _;
    return chart;
  };
  chart.value = function(_) {
    if (!arguments.length) return value;
    upd(_);
    return chart;
  };

  return chart;
}
