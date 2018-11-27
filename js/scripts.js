//write your javascript here!

console.log('Starting CityView...');

var read = `SELECT * FROM "20f64c02-6023-4280-8131-e8c0cedcae9b" LIMIT 100`;

var data = getData(read, function(jsonArray) {
  var ul = document.getElementById('jsonList');
  var dataJson = addChildToJson(
    mapJsonArray(jsonArray, 'Neighborhood', 'Percent of Population'), 'Neighborhood');

  console.log(dataJson);

  //https://stackoverflow.com/questions/921789/how-to-loop-through-a-plain-javascript-object-with-the-objects-as-members
  // for (var key in dataJson) {
  //   // skip loop if the property is from prototype
  //   if (!dataJson.hasOwnProperty(key)) continue;
  //
  //   var obj = dataJson[key];
  //   for (var prop in obj) {
  //     // skip loop if the property is from prototype
  //     if (!obj.hasOwnProperty(prop)) continue;
  //
  //     var node = document.createElement("LI");
  //     var textnode = document.createTextNode(prop + " = " + obj[prop]);
  //     node.appendChild(textnode);
  //     ul.appendChild(node);
  //   }
  //
  //   ul.innerHTML = ul.innerHTML + "--------------------------" + "<br/>";
  // }
});

var width = 960,
    height = 700,
    radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");

var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

var y = d3.scaleSqrt()
    .range([0, radius]);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var partition = d3.partition();

var arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

d3.json("https://gist.githubusercontent.com/mbostock/4348373/raw/85f18ac90409caa5529b32156aa6e71cf985263f/flare.json", function(error, root) {
  if (error) throw error;

  root = d3.hierarchy(root);
  root.sum(function(d) { return d.size; });
  svg.selectAll("path")
      .data(partition(root).descendants())
    .enter().append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
      .on("click", click)
    .append("title")
      .text(function(d) { return d.data.name + "\n" + formatNumber(d.value); });
});

function click(d) {
  svg.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]),
            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
      })
    .selectAll("path")
      .attrTween("d", function(d) { return function() { return arc(d); }; });
}

d3.select(self.frameElement).style("height", height + "px");