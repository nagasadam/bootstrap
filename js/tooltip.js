//Tooltip Function

d3.helper = {};

d3.helper.tooltip = function (accessor) {
    return function (selection) {
        var tooltipDiv;
        var bodyNode = d3.select('body').node();
        selection.on("mouseover", function (d, i) {
            
            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10) + 'px')
                .style('top', (absoluteMousePos[1]) + 'px')
                .style('position', 'absolute')
                .style('z-index', 1001);
            d3.select(this).style({ fill: '#FFE600' })
            // Add text using the accessor function
            var tooltipText = accessor(d, i) || '';
        })
        .on('mousemove', function (d, i) {
            // Move tooltip
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10) + 'px')
                .style('top', (absoluteMousePos[1] - 15) + 'px');
            var tooltipText = accessor(d, i) || '';
            tooltipDiv.html(tooltipText);
        })
        .on("mouseout", function (d, i) {
            d3.select(this).style({ fill: '' })
            tooltipDiv.remove();
        });

    };
};

