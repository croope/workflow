
this.nodeData = [
    {id: 1, x: 10, y: 10, label: 'Start', transitions: [{id:50, fromStateId: 1, toStateId: 2, label: 'Forward'}]},
    {id: 2, x: 200, y: 200, label: 'End', transitions: [{id: 51, fromStateId: 2, toStateId: 1, label: 'Back'}]}
];

function setupDragAndZoom() {
    // Create the drag behavior
    this.drag = d3.behavior.drag()
        .on("drag", function (d, i) {
        	d.x += d3.event.dx;
        	d.y += d3.event.dy;
        	d3.select(this).attr("transform", function (d, i) {
        		return "translate(" + [d.x, d.y] + ")";
        	});
        })
        .on("dragstart", function (d) {
        	d3.event.sourceEvent.stopPropagation();
        	d3.select(this).select('rect').classed('selected', true);
        	d3.select(this).classed("dragging", true);
        })
        .on("dragend", function (d) {
        	d3.event.sourceEvent.stopPropagation();
        	d3.select(this).classed("dragging", false);
        });

    this.zoom = d3.behavior.zoom()
    			  .scaleExtent([0.2, 1.5])
    			  .on("zoom", function () {
                      d3.select('g').attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                  });
}

setupDragAndZoom();

this.svg = d3.select('#editor').append('svg').attr('width', 1250).attr('height', 750).call(this.zoom);

function createGrid() {
    // Create the grid background
    this.svg.append('g')
       .selectAll('line')
       .data(d3.range(-5000, 5000, 30))
       .enter().append('line')
       .attr('x1', function (d) { return d; })
       .attr('y1', -5000)
       .attr('x2', function (d) { return d; })
       .attr('y2', 5000)
       .attr('class', 'xaxis');

    this.svg.append('g')
      .selectAll('line')
      .data(d3.range(-5000, 5000, 30))
      .enter().append('line')
      .attr('x1', -5000)
      .attr('y1', function (d) { return d; })
      .attr('x2', 5000)
      .attr('y2', function (d) { return d; })
      .attr('class', 'yaxis');
}

function createNodes() {
    // create the nodes from data
    var node = this.svg.append('g')
      .selectAll('g')
      .data(this.nodeData)
      .enter()
      .append('g')
      .call(this.drag)
      .attr('transform', function(d){
          return 'translate(' + [d.x, d.y] + ')';
      });

    node.append('rect')
        .attr('rx', '20')
        .attr('ry', '20')
        .attr('x', function (d) {
    		return d.x;
    	})
    	.attr('y', function (d) {
    		return d.y;
    	});

    node.append('text').text(function(d) {
            return d.label;
        })
        .attr('x', function (d) {
    		return d.x + 85;
    	})
    	.attr('y', function (d) {
    		return d.y + 40;
    	})
    	.attr('text-anchor', 'middle');
}

createGrid();
createNodes();
