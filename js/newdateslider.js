(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['d3'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('d3'));
  } else {
    root.d3.slider = factory(root.d3);
  }
}(this, function(d3) {
  return function module() {
    "use strict";
    // Public variables width default settings
    var
      axis = false,
      margin = 50,
      value,
      active = 1,
      tvalues,
      scale;

    // Private variables
    var axisScale,
      dispatch = d3.dispatch("slideend"),
      formatPercent = d3.format(".2%"),
      handle1,
      handle2 = null,
      divRange,
      sliderLength = 500,
      div,
      divWidth,
      handleWidth;

    function slider(selection) {
      selection.each(function() {

        // DIV container
        div = d3.select(this).classed("d3-slider d3-slider-horizontal", true);


        divWidth = document.getElementById("dateslider").offsetWidth;


        sliderLength = divWidth - 2*margin;


        scale = d3.scale.ordinal()
          .domain(tvalues.map(function(d) {
            return d;
          }))
          .rangePoints([0, sliderLength], 0.05);

        var drag = d3.behavior.drag();

        drag.on('dragend', function() {
          dispatch.slideend(value);
        });

        handle1 = div.append("a")
          .classed("d3-slider-handle", true)
          .attr("xlink:href", "#")
          .attr('id', "handle-one")
          .on("click", stopPropagation)
          .call(drag);

        handle2 = div.append("a")
          .classed("d3-slider-handle", true)
          .attr('id', "handle-two")
          .attr("xlink:href", "#")
          .on("click", stopPropagation)
          .call(drag);


        handleWidth = document.getElementById("handle-one").offsetWidth;

        divRange = d3.select(this).append('div').classed("d3-slider-range", true);

        var leftPos = (margin + scale(value[0]))/divWidth ;
        var rightPos = (margin + scale(value[1]))/divWidth ;

        handle1.style("left", formatPercent(leftPos - handleWidth/divWidth));
        divRange.style("left", formatPercent(leftPos ));
        drag.on("drag", onDragHorizontal);

        handle2.style("left", formatPercent(rightPos ));
        divRange.style("right", formatPercent(1.0 - rightPos ));
        drag.on("drag", onDragHorizontal);

        if (axis) {
          createAxis(div);
        }

        function createAxis(dom) {

          axis = d3.svg.axis()
            .tickValues(tvalues)
            .orient("bottom")
            .scale(scale);

          // Create SVG axis container
          var svg = dom.append("svg")
            .classed("d3-slider-axis d3-slider-axis-horizontal", true)
            .on("click", stopPropagation);

          var g = svg.append("g");

          svg.attr({
            width: sliderLength+2*margin,
            height: margin
          });

          var rangeHeight = parseInt(divRange.style("height"), 10);

          g.attr("transform", "translate(" + margin + "," + rangeHeight + ")");
          g.call(axis);

        }

        function onDragHorizontal() {
          if (d3.event.sourceEvent.target.id === "handle-one") {
            active = 1;
          } else if (d3.event.sourceEvent.target.id == "handle-two") {
            active = 2;
          }
          var pos = Math.max(0, Math.min(scale([tvalues[(tvalues.length - 1)]]), d3.event.x));
          moveHandle(nearestTick(pos));
        }

        function stopPropagation() {
          d3.event.stopPropagation();
        }

      });

    }

    // Move slider handle on click/drag
    function moveHandle(newValue) {

      var currentValue = value[active - 1],
        oldPos = scale(currentValue),
        newPos = scale(newValue);

      if (oldPos !== newPos) {

        value[active - 1] = newValue;

        if (value[0] > value[1]) return;


        var leftPos = (margin + scale(value[0]))/divWidth ;
        var rightPos = (margin + scale(value[1]))/divWidth ;

        if (active === 1) {

          handle1.style("left", formatPercent(leftPos - handleWidth/divWidth));
          divRange.style("left", formatPercent(leftPos ));

        } else {

          handle2.style("left", formatPercent(rightPos ));
          divRange.style("right", formatPercent(1.0 - rightPos ));

        }
      }
    }

    // Calculate nearest step value
    function stepValue(val) {
      if (val === scale.domain()[0] || val === scale.domain()[1]) {
        return val;
      }
      var alignValue = nearestTick(scale(val));
      return alignValue;

    }

    // Find the nearest tick
    function nearestTick(pos) {
      var ticks = scale.ticks ? scale.ticks() : scale.domain();
      var dist = ticks.map(function(d) {
        return pos - scale(d);
      });
      var i = -1,
        index = 0,
        r = scale.ticks ? scale.range()[1] : scale.rangeExtent()[1];
      do {
        i++;
        if (Math.abs(dist[i]) < r) {
          r = Math.abs(dist[i]);
          index = i;
        };
      } while (dist[i] > 0 && i < dist.length - 1);

      return ticks[index];
    };


    // Getter/setter functions
    slider.axis = function(_) {
      if (!arguments.length) return axis;
      axis = _;
      return slider;
    };

    slider.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return slider;
    };

    slider.value = function(_) {
      if (!arguments.length) return value;
      if (value) {
        moveHandle(stepValue(_));
      };
      value = _;
      return slider;
    };

    slider.scale = function(_) {
      if (!arguments.length) return scale;
      scale = _;
      return slider;
    };

    slider.tickValues = function(_) {
      if (!arguments.length) return tvalues;
      tvalues = _;
      return slider;
    };

    d3.rebind(slider, dispatch, "on");

    return slider;

  }
}));
