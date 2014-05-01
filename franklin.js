var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom - 100;

var chart = d3.select('svg#chart')
    .attr('width', width + margin.left + margin.right),
    //.attr('height', height + margin.top + margin.bottom)
    svg = chart.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var data, 
    root, 
    prevFolder = [],
    description = d3.select('p#description');
 
var editing = false,
    sourceNode = null,
    specialAction = null,
    connectingLine = null;

var KEYS = { d: 68, r: 82, q: 81, p: 80 };

d3.select('button#back')
    .on('click', gotoPreviousFolder);
d3.select('button#toggleEdit')
    .on('click', toggleEdit);
d3.select(document)
    .on('keydown', handleKeyDown)
    .on('keyup', handleKeyUp)
    .on('mousemove', moveConnectingLine);

d3.json('test/d3.franklin', function (error, _data) {
  data = _data;
  root = '/';
  createDagre(data[root]);
});

function createDagre(root) {
  var g = new dagreD3.Digraph(),
      nodes = flatten(root);

  // Nodes
  nodes.forEach(function (d) {
    g.addNode(d.name, { label: d.name, description: d.description, entry_point: d.entry_point });
  });
  // Edges
  nodes.forEach(function (d) {
    d.next.forEach(function (n) {
      if (!g.hasNode(n)) {
        g.addNode(n, { label: n, description: '' });
      }
      g.addEdge(null, d.name, n);
    });
  });

  var renderer = new dagreD3.Renderer();
  var oldDrawNodes = renderer.drawNodes();
  renderer.drawNodes(function (graph, svg) {
    var svgNodes = oldDrawNodes(graph, svg);
    svgNodes.select('rect')
        .attr('style', function (u) {
          if (g.node(u).entry_point) return 'fill: #ffd0cd';
        })
        .attr('id', function (u) { return 'franklin-' + cleanHtmlId(g.node(u).label); })
        .on('click', function (u) { handleClick(g.node(u).label); })
        .on('mouseover', function (u) { updateDescription(g.node(u).description); });
    return svgNodes;
  });
  var layout = dagreD3.layout()
                      .rankDir('LR');
  renderer.transition(function (selection) { return selection.transition().duration(500); });
  layout = renderer.layout(layout).run(g, svg);

  var ypos = [];
  layout.eachNode(function (u, value) { ypos.push(value.y); });
  chart.attr('height', d3.max(ypos) + 100);
}

function flatten(obj) {
  var nodes = [], i = 0;
  d3.keys(obj).forEach(function (key) {
    var value = obj[key];
    value.name = key;
    value.id = ++i;
    nodes.push(value);
  });
  return nodes;
};

function handleClick(name) {
  if (d3.event.defaultPrevented) return;
  if (!editing && data[root + name]) {
    prevFolder.push(root);
    root += name;
    createDagre(data[root]);
  } else if (editing) {
    editGraph(name);
  }
}

function editGraph(name) {
  if (sourceNode && sourceNode != name) {
    if (specialAction == 'removeLink') {
      var n = data[root][sourceNode];
      n.next = n.next.filter(function(f) { return f != name; });
    } else {
      data[root][sourceNode].next.push(name);
    }
    cleanup();
    createDagre(data[root]);
  } else if (specialAction == 'deleteNode') {
    delete data[root][name];
    cleanup();
    createDagre(data[root]);
  } else {
    sourceNode = name;
    var selected = d3.select('#franklin-' + cleanHtmlId(sourceNode))
        .style('stroke', '#e22121');
    createConnectLine(selected.node().parentNode);
  }
}

function updateDescription(des) {
  description.html(des);
}

function cleanHtmlId(id) {
  // Replace "/" or "." with "-".
  return id.replace(/\/|\./g, '-');
}

function gotoPreviousFolder(e) {
  var folder = prevFolder.pop();
  if (folder) {
    root = folder;
    createDagre(data[root]);
  }
}

function toggleEdit(e) {
  editing = !editing;
  d3.select('button#toggleEdit').html(editing ? 'Explore' : 'Edit');
  cleanup();
}

function createConnectLine(selected) {
  connectingLine = d3.select(selected).append('line')
      .attr({ x1: 0, y1: 0,
              stroke: 'black', 'stroke-width': 2
            });
}

function cleanup() {
  if (connectingLine) { connectingLine.remove(); }
  if (sourceNode) {
    d3.select('#franklin-' + cleanHtmlId(sourceNode))
        .style('stroke', null);
  }
  connectingLine = null; 
  sourceNode = null;
}

function moveConnectingLine() {
  if (connectingLine) {
    var xy = d3.mouse(connectingLine.node()),
        padding = 5;
    connectingLine.attr({ x2: xy[0] - padding, y2: xy[1] - padding });
  }
}

function handleKeyDown() {
  if (specialAction) return;
  var e = d3.event.keyCode;
  if (e == KEYS.d) { specialAction = 'deleteNode'; }
  else if (e == KEYS.r) { specialAction = 'removeLink'; }
  else if (e == KEYS.q) { cleanup(); }
}

function handleKeyUp() {
  var e = d3.event.keyCode;
  if (e == KEYS.d && specialAction == 'deleteNode') { specialAction = null; }
  else if (e == KEYS.r && specialAction == 'removeLink')  { specialAction = null; }
}

