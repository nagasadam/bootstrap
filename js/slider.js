function slider()
{
    var margin = {top: 0, left: 0, right: 0, bottom: 0},
        width  = 150,
        height = 60,
        brush  = d3.svg.brush(),
        handle, slider,
        value  = 0,
        fmt = "",
        upd    = function(d){value = d;},
        cback  = function(d){};

    var x = d3.scale.linear()
        .domain([-6,6])
        .range ([0,width])
        .clamp(true);

    function chart(el)
    {

        brush.x(x).extent([0,0])
             .on("brush", brushed);

        var svg_slider = el.attr("width",  width +20 )
            .attr("height", height )
            .append("g").attr("transform","translate (10,0)");

        svg_slider.append("g")
           .attr("class","x axis")
           .attr("transform", "translate(0,"+height/2+")")
           .call(d3.svg.axis().scale(x).orient("top").ticks(5).tickSize(0).tickPadding(15).tickFormat(function(d) { return d + fmt; }) )
           .select(".domain")
          /* .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })*/
           .attr("class", "halo");

        slider = svg_slider.append("g")
            .attr("class","slider")
            .call(brush)
            .style({
              "fill": "#69f",
              "fill-opacity": "0.3"
            });

        slider.selectAll(".extent,.resize").remove();
        slider.select(".background").attr("height",height)

        handle = slider.append("circle")
            .attr("class","handle")
            .attr("transform", "translate(0,"+height/2+")")
            .attr("cx",x(value))
            .attr("r",9);

        function brushed()
        {
            if (d3.event.sourceEvent) value = x.invert(d3.mouse(this)[0]);
            upd(value);
            cback();
        }
        upd = function(v)
        {
            brush.extent([v,v]);
            value = brush.extent()[0];
            handle.attr("cx",x(value));
        }
    }
    chart.fmt = function (_) {
            if (!arguments.length) return fmt;
            fmt = _;
            return chart;
        };

    chart.margin   = function(_) { if (!arguments.length) return margin;  margin = _; return chart; };
    chart.callback = function(_) { if (!arguments.length) return cback;    cback = _; return chart; };
    chart.value    = function(_) { if (!arguments.length) return value;       upd(_); return chart; };

    return chart;
}
