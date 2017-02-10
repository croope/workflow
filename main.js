
this.nodeData = [
    {id: 1, x: 100, y: 100, label: 'Start', transitions: [{id:50, fromStateId: 1, toStateId: 2, label: 'Forward'}]},
    {id: 2, x: 250, y: 250, label: 'End', transitions: [{id: 51, fromStateId: 2, toStateId: 1, label: 'Back'}]},
    {id: 3, x: 500, y: 100, label: 'Middle', transitions: [{id: 52, fromStateId: 3, toStateId: 2, label: 'Onwards'}]},
    {id: 4, x: 250, y: 100, label: 'Shire', transitions: [{id: 53, fromStateId: 4, toStateId: 3, label: 'Back Again'}]}
];

var rectWidth = 175;
var rectHeight = 80;

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
    // var rects = svg.selectAll('rect');
    //
    // var obj = [];
    // for (a = 0; a < rects[0].length; a++) {
    //     if(a > 0) {
    //         var x1 = rects[0][a-1].attributes.x.value;
    //         var y1 = rects[0][a-1].attributes.y.value;
    //         var x2 = rects[0][a].attributes.x.value;
    //         var y2 = rects[0][a].attributes.y.value;
    //         var linearr = [{x:x1,y:y1},{x:x2,y:y2}];
    //         obj.push(linearr);
    //     }
    // }

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

            //redrawLines();
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
            this.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });
}

setupDragAndZoom();

this.svg = d3.select('#editor').append('svg').attr('width', 1250).attr('height', 750);

this.svg.call(zoom);

this.svg.on('contextmenu', function(d) {
    //Do stuff, add menu for removing etc
    //d3.event.stopPropagation();
    //alert('balls');
});

this.defs = svg.append('svg:defs');

function mouseDown() {
    if (d3.event.srcElement != 'rect') {
        return;
    }

    var m = d3.mouse(this);

    var line = d3.selectAll('svg').append('line')
        .attr('x1', m[0])
        .attr('x2', m[1])
        .attr('y1', m[0])
        .attr('y2', m[1]);

    d3.selectAll('svg').on('mousemove', function(d){
        var m = d3.mouse(this);
        line.attr('x2', m[0])
            .attr('y2', m[1])
    });
}

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
      .attr('x', function (d) {
          return d.x;
      })
      .attr('y', function (d) {
          return d.y;
      })
      .attr('transform', function(d){
         return 'translate(' + [d.x, d.y] + ')';
      });

    node.append('rect')
        .attr('rx', '20')
        .attr('ry', '20')
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .on('contextmenu', function(d) {
            d3.event.stopPropagation();
            // Do stuff here, delete edit etc
            alert(d.label);
        })
        .on('mousedown', mouseDown)
        .on('mouseup', function(d) {
            if (d3.event.srcElement != 'rect') {
                return;
            }
            this.svg.on("mousemove", null);
        });

    node.append('text').text(function(d) {
            return d.label;
        })
        .attr('x', rectWidth / 2)
    	.attr('y', rectHeight / 2)
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
        .attr('refX', 1)
        .attr('refY', 1)
        .attr('orient', 'auto')
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
        // Calculate the position for the links
        var x1 = d.x1 + rectWidth/2;
        var x2 = d.x2 - rectWidth/2;
        var y1 = d.y1 + rectHeight;
        var y2 = d.y2 - rectHeight;

        // TODO: If the nodes are relatively horizontally aligned go from and to the middle
        // if (y2 == y1 || y2 >= y1 + rectHeight/2 || y2 <= rectHeight) {
        //     x1 = d.x1 + rectWidth;
        //     x2 = d.x2 - rectWidth;
        // }

        return ' M ' + x1 + ' ' + y1 +
               ' L ' + x2 + ' ' + y2 +
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

function killall() {

}


createGrid();
createNodes();
createLinks();
