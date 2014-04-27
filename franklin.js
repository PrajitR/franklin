var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select('svg#chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var data, root, prevFolder = [],
    description = d3.select('p#description');

d3.select('button#back')
    .on('click', gotoPreviousFolder);

d3.json('test/example.franklin', function (error, _data) {
  data = _data;
  root = 'project_root';
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
        .on('click', function (u) { handleClick(g.node(u).label); })
        .on('mouseover', function (u) { updateDescription(g.node(u).description); });
    return svgNodes;
  });
  renderer.run(g, svg);
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
  if (data[name]) {
    prevFolder.push(root);
    root = name;
    createDagre(data[root]);
  }
}

function updateDescription(des) {
  description.html(des);
}

function gotoPreviousFolder(d) {
  console.log('ay');
  var folder = prevFolder.pop();
  if (folder) {
    root = folder;
    createDagre(data[root]);
  }
}
