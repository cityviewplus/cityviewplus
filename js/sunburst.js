var query = `SELECT * FROM "20f64c02-6023-4280-8131-e8c0cedcae9b"`;

getData(query, function(jsonArray) {

  var height = 770;
  var width = 770;
  var radius = width / 8;
  var pMargin = 30

  var barHeight = 500;
  var barWidth = 500;

  margin = ({
    top: 20,
    right: 0,
    bottom: 0,
    left: 40
  })

  var dataJson = d3.nest()
    .key(function(d) {
      return d.Decade;
    })
    .key(function(d) {
      return d.Neighborhood;
    })
    .key(function(d) {
      return d["Race and or Ethnicity"];
    })
    .rollup(function(v) {
      return parseFloat(v[0]["Percent of Population"])
    })
    .entries(jsonArray);

  dataJson = addChildToJson(dataJson, "Race by decade", "key", "values");

  function renameKeys(d) {
    d.name = d.key;
    delete d.key;
    if (typeof d.value === "number") d.size = d.value;
    else d.values.forEach(renameKeys), d.children = d.values;
    delete d.values;
  }


  renameKeys(dataJson);

  console.log("3" + JSON.stringify(jsonArray))


  var format = d3.format(",d");

  var color = d3.scaleOrdinal().range(d3.quantize(d3.interpolateRainbow, dataJson.children.length + 1));
  var purple = d3.scaleOrdinal().domain(dataJson.children.length + 1).range(['rgb(110, 64, 170)']);
  var pink = d3.scaleOrdinal().domain(dataJson.children.length + 1).range(['rgb(223, 64, 161)']);
  var orange = d3.scaleOrdinal().domain(dataJson.children.length + 1).range(['rgb(255, 112, 78)']);
  var yellow = d3.scaleOrdinal().domain(dataJson.children.length + 1).range(['rgb(210, 201, 52)']);
  var green = d3.scaleOrdinal().domain(dataJson.children.length + 1).range(['rgb(107, 247, 92)']);
  var turqouise = d3.scaleOrdinal().domain(dataJson.children.length + 1).range(['rgb(27, 217, 172)']);
  var blue = d3.scaleOrdinal().domain(dataJson.children.length + 1).range(['rgb(57, 136, 225)'])

  var partition = data => {
    const root = d3.hierarchy(data)
      .sum(d => {
        return d.size;
      })
      .sort((a, b) => b.value - a.value);
    return d3.partition()
      .size([2 * Math.PI, root.height + 1])
      (root);
  };

  var arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));


  var chart = () => {
    const root = partition(dataJson);

    root.each(d => d.current = d);

    var svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", "100%")
      //.attr("style", "margin-left:auto; margin-right:auto; display:block;")
      .attr("style", "margin-left:auto; float:right; display:block;")
      .style("font", "10px sans-serif");

    var svg2 = d3.select("#barChart").append("svg")
      .attr("width", width)
      .attr("height", "100%")
      //.attr("style", "margin-left:auto; margin-right:auto; display:block;")
      .attr("style", "margin-left:auto; float:right; display:block;")
      .style("font", "10px sans-serif");

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2.05})`);

    const path = g.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .enter().append("path")
      .attr("fill", d => {
        //while (d.depth > 2) {
        //d = d.parent;
        //}
        if (d.depth == 3) {
          return color(d.data.name);
        } else if (d.depth == 2 && d.parent.data.name == "1950") {
          return yellow(d.data.name);
        } else if (d.depth == 2 && d.parent.data.name == "1960") {
          return purple(d.data.name);
        } else if (d.depth == 2 && d.parent.data.name == "1970") {
          return blue(d.data.name);
        } else if (d.depth == 2 && d.parent.data.name == "1980") {
          return green(d.data.name);
        } else if (d.depth == 2 && d.parent.data.name == "1990") {
          return pink(d.data.name);
        } else if (d.depth == 2 && d.parent.data.name == "2000") {
          return turqouise(d.data.name);
        } else if (d.depth == 2 && d.parent.data.name == "2010") {
          return orange(d.data.name);
        } else {
          return color(d.data.name);
        }
      })
      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
      .attr("d", d => arc(d.current));

    path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked); //d => {if(d.children) {
    //clicked(d.current)
    //} else {clicked(d.current)}});


    path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    const label = g.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .enter().append("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.children ? `${d.data.name}` : `${d.data.name} ${d.value}%`) //+ arc.startAngle(d.current));

    const parent = g.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);


    function clicked(p) {

      console.log(p)

      parent.datum(p.parent || root);

      if (p.depth == 2) {

        svg2.selectAll("g").remove()
        svg2.selectAll("rect").remove()

        root.each(d => d.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth)
        });

        const t = g.transition().duration(750);

        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        path.transition(t)
          .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
          })
          .filter(function(d) {
            return +this.getAttribute("fill-opacity") || arcVisible(d.target);
          })
          .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
          .attrTween("d", d => () => arc(d.current));

        label.filter(function(d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
          }).transition(t)
          .attr("fill-opacity", d => +labelVisible(d.target))
          .attrTween("transform", d => () => labelTransform(d.current));

        //Below is code for chart making

        const barChart = svg2.append('g')
          .attr('transform', `translate(${pMargin}, ${pMargin})`);

        var childrenNames = []
        var childrenValues = []
        console.log(p.children[0].value)

        for (i = 0; i < p.children.length; i++) {
          childrenNames.push(p.children[i].data.name);
        }

        for (i = 0; i < p.children.length; i++) {
          childrenValues.push(p.children[i].value);
        }

        var xScale = d3.scaleBand()
          .domain(p.children.map(s => s.data.name))
          .range([margin.left, barWidth - margin.right])
          .padding(0.1)

        var yScale = d3.scaleLinear()
          .domain([0, 100])
          .range([barHeight - margin.bottom, margin.top])


        // var xAxis = g => g
        //   //.scale(x)
        //   //.orient("bottom")
        //   .attr("transform", `translate(0,${height - margin.bottom})`)
        //   .call(d3.axisBottom(xScale).tickSizeOuter(0))

        barChart.append('g')
          .attr('transform', `translate(0, ${barHeight - margin.bottom})`)
          .call(d3.axisBottom(xScale).tickSizeOuter(0));

        // var yAxis = g => g
        //   .attr("transform", `translate(${margin.left},0)`)
        //   .call(d3.axisLeft(yScale))
        // //.call(g => g.select(".domain").remove())

        barChart.append('g')
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(yScale));


        barChart.selectAll()
          .data(p.children)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', s => xScale(s.data.name))
          .attr('y', s => yScale(s.value))
          .attr('height', s => barHeight - yScale(s.value))
          .attr('width', xScale.bandwidth())

      } else {

        root.each(d => d.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth)
        });

        const t = g.transition().duration(750);

        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        path.transition(t)
          .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
          })
          .filter(function(d) {
            return +this.getAttribute("fill-opacity") || arcVisible(d.target);
          })
          .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
          .attrTween("d", d => () => arc(d.current));

        label.filter(function(d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
          }).transition(t)
          .attr("fill-opacity", d => +labelVisible(d.target))
          .attrTween("transform", d => () => labelTransform(d.current));
      }
    }

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    return svg.node();
  };

  chart();
  //chart2();
});
