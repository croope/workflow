
this.nodeData = [
    {id: 1, x: 10, y: 10, label: 'Start', transitions: [{id:50, fromStateId: 1, toStateId: 2, label: 'Forward'}]},
    {id: 2, x: 200, y: 200, label: 'End', transitions: [{id: 51, fromStateId: 2, toStateId: 1, label: 'Back'}]},
    {id: 3, x: 500, y: 10, label: 'Middle', transitions: [{id: 52, fromStateId: 2, toStateId: 3, label: 'Onwards'}]}
];

function onNodeMove(node) {
    // TODO: Add logic here to deal with node movement and redrawing of lines.
    var x = node.x;
}

function nodePopup(node) {
    //TODO: Add a popup to edit the current node, list to delete, rename etc
}

function linkPopup(link) {
    //TODO:
}

function redrawLines() {
    var rects = svg.selectAll("rect");

    var obj = [];
    for (a = 0; a < rects[0].length; a++) {
        if(a > 0) {
            var x1 = rects[0][a-1].attributes.x.value;
            var y1 = rects[0][a-1].attributes.y.value;
            var x2 = rects[0][a].attributes.x.value;
            var y2 = rects[0][a].attributes.y.value;
            var linearr = [{x:x1,y:y1},{x:x2,y:y2}];
            obj.push(linearr);
        }
    }

    this.svg.selectAll('.line')
        .append('path')
        .data(obj)
        .attr('class', 'line')
        .attr('d', line);
}

function setupDragAndZoom() {
    // Create the drag behavior
    this.drag = d3.behavior.drag()
        .on("drag", function (d, i) {
        	d.x += d3.event.dx;
        	d.y += d3.event.dy;
        	d3.select(this).attr("transform", function (d, i) {
        		return "translate(" + [d.x, d.y] + ")";
        	});

            redrawLines();
        })
        .on("dragstart", function (d) {
        	d3.event.sourceEvent.stopPropagation();
        	d3.select(this).select('rect').classed('selected', true);
        	d3.select(this).classed("dragging", true);
        })
        .on("dragend", function (d) {
        	d3.event.sourceEvent.stopPropagation();
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

this.svg.on('contextmenu', function(d) {
    //Do stuff, add menu for removing etc
    //d3.event.stopPropagation();
    //alert('balls');
});

this.defs = svg.append('svg:defs');

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
    	})
        .on('contextmenu', function(d){
            d3.event.stopPropagation();
            // Do stuff here, delete edit etc
            alert(d.label);
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

function createLinks() {
    // Create the data for the links - for links we need to create a path
    var transitions = [];

    // get the data into a format that we can use
    for (var i = 0; i < this.nodeData.length; ++i) {
        var node = this.nodeData[i];

        for (var j = 0; j < node.transitions.length; ++j) {
            var transition = node.transitions[j];
            // get the node data
            var fromNode = this.nodeData.find(function(x){
                return x.id == transition.fromStateId;
            });

            var toNode = this.nodeData.find(function(x){
                return x.id == transition.toStateId;
            });

            transition.x1 = fromNode.x;
            transition.y1 = fromNode.y;
            transition.x2 = toNode.x;
            transition.y2 = toNode.y;

            transitions.push(transition);
        }
    }

    var link = this.svg.append('g')
      .selectAll('g')
      .data(transitions);

    var marker = this.defs.selectAll('marker')
        .data(transitions)
        .enter()
        .append('marker')
        .attr('id', function(d){
            return 'marker_' + d.id;
        })
        .attr('markerHeight', 10)
        .attr('markerWidth', 10)
        .attr('markerUnits', 'strokeWidth')
        .attr('refX', 0)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('viewbox', '10 10 0 0')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 5 10 z')
        .attr('fill', 'black');

    var linkPath = link.enter()
        .append('path')
        .style('fill', 'black')
        .style('stroke', 'black')
        .style('stroke-width', 2);

    var line = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate('basis');

    linkPath.attr('d', function(d){
        return ' M ' + d.x1 + ' ' + d.y1 +
               ' L ' + d.x2 + ' ' + d.y2 +
            //    ' L ' + d.x2 + ' ' + d.y2 +
            //    ' L ' + d.x2 + ' ' + d.y2 +
            //    ' L ' + d.x2 + ' ' + d.y2 +
            //    ' C ' + d.x2 + ' ' + d.y2 + ' ' + d.x2 + ' ' + d.y2 + ' ' + d.x2 + ' ' + d.y2 +
            //    ' C ' + d.x2 + ' ' + d.y2 + ' ' + d.x2 + ' ' + d.y2 + ' ' + d.x2 + ' ' + d.y2 +
               ' Z ';
    }).attr('marker-end', function(d) {
        return 'url(#marker_' + d.id + ')'
    });
}

createGrid();
createNodes();
createLinks();
