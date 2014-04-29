var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom - 100;

var svg = d3.select('svg#chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var data, 
    root, 
    prevFolder = [],
    description = d3.select('p#description');
 
var editing = false,
    sourceNode = null;

d3.select('button#back')
    .on('click', gotoPreviousFolder);
d3.select('button#toggleEdit')
    .on('click', toggleEdit);

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
  if (!editing && data[root + name]) {
    prevFolder.push(root);
    root += name;
    createDagre(data[root]);
  } else if (editing) {
    handleEdit(name);
  }
}

function handleEdit(name) {
  if (sourceNode && sourceNode != name) {
    data[root][sourceNode].next.push(name);
    d3.select('#franklin-' + cleanHtmlId(sourceNode))
        .style('stroke', null);
    sourceNode = null;
    createDagre(data[root]);
  } else {
    sourceNode = name;
    d3.select('#franklin-' + cleanHtmlId(sourceNode))
        .style('stroke', '#e22121');
  }
}


function updateDescription(des) {
  description.html(des);
}

function cleanHtmlId(id) {
  // Replace "/" or "." with "-".
  return id.replace(/\/|\./, '-');
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
  selectNode = null;
}
