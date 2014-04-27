var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select('svg#chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var force = d3.layout.force()
    .linkDistance(80)
    .charge(-120)
    .size([width, height])
    .on('tick', tick);

var link = svg.selectAll('.link'),
    node = svg.selectAll('.node');

d3.json('test/example.franklin', function (error, data) {
  var root = data['project_root'];
  var nodes = flatten(root),
      links = createLinks(nodes, root);
  
  force
      .nodes(nodes)
      .links(links)
      .start();
  console.log(links);

  link = link.data(links);
  link.enter().insert('line', '.node')
      .attr('class', 'link');

  node = node.data(nodes, function (d) { return d.id; });
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node');
  nodeEnter.append('circle')
      .attr('r', 10)
      .call(force.drag);
  nodeEnter.append('text')
      .attr('dy', '.35em')
      .text(function (d) { return d.name; });
  node.select("circle")
      .style("fill", function (d) {
        if (d.entry_point) return 'red';
        else return 'black';
      });
});

function tick() {
  link.attr('x1', function (d) { return d.source.x; })
      .attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; })
      .attr('y2', function (d) { return d.target.y; });

  node.attr('transform', function (d) { return 'translate(' + d.x + ',' +  d.y + ')'; });
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

// The data object now has id fields thanks to flatten.
function createLinks(nodes, obj) {
  var links = [];
  nodes.forEach(function (node) {
    node.next.forEach(function (f) {
      var otherNode = (nodes.filter(function (n) { return n.name == f; }))[0];
      links.push({ source: node, target: otherNode });
    });
  });
  return links;
}
