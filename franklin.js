var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select('svg#chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var force = d3.layout.force()
    .linkDistance(200)
    .charge(function (d) { return -100 * r(d.next.length); })
    .size([width, height])
    .on('tick', tick);

var r = d3.scale.linear()
        .range([10, 40]);

var link = svg.selectAll('.link'),
    node = svg.selectAll('.node');

var data, root, prevFolder = [];

d3.select('button#back')
    .on('click', gotoPreviousFolder);

d3.json('test/example.franklin', function (error, _data) {
  data = _data;
  root = 'project_root';
  update(data[root]);
});

function update(root) {
  var nodes = flatten(root),
      links = createLinks(nodes, root);

  r.domain([0, d3.max(nodes, function (d) { return d.next.length; })]);
  force
      .nodes(nodes)
      .links(links)
      .start();

  link.remove();
  node.remove();
  link = svg.selectAll('.link'),
  node = svg.selectAll('.node');

  link = link.data(links);
  link.enter().insert('line', '.node')
      .attr('class', 'link');

  node = node.data(nodes);

  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .on('click', click);
  nodeEnter.append('circle')
      .attr('r', function (d) { return r(d.next.length); })
      .attr('stroke', 'black')
      .attr('stoke-width', 2)
      .call(force.drag);
  nodeEnter.append('text')
      .attr('dy', '.35em')
      .attr('x', function (d) { return -0.4 * r(d.next.length); })
      .text(function (d) { return d.name; });

  node.select("circle")
      .style("fill", function (d) {
        if (d.entry_point) return 'red';
        else return 'yellow';
      });
}

function tick() {
  link.attr('x1', function (d) { return d.source.x; })
      .attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; })
      .attr('y2', function (d) { return d.target.y; });

  node.attr('transform', function (d) { return 'translate(' + d.x + ',' +  d.y + ')'; });
}

function click(d) {
  if (d3.event.defaultPrevented) return;
  if (data[d.name]) {
    force.stop();
    prevFolder.push(root);
    root = d.name;
    update(data[root]);
  }
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
      if (otherNode)
        links.push({ source: node, target: otherNode });
    });
  });
  return links;
}

function gotoPreviousFolder(d) {
  var folder = prevFolder.pop();
  if (folder) {
    force.stop();
    root = folder;
    update(data[root]);
  }
}
