//////////////////////////////
// SVG AND GRAPH DIMENSIONS //
//////////////////////////////

var svgWidth_barchart = 900, svgHeight_barchart = 850;

//set up svg using margin conventions - we'll need plenty of room on the left for labels
var margin_barchart = { top: 15, right: 25, bottom: 15, left: 60 };

var width_barchart = svgWidth_barchart - margin_barchart.left - margin_barchart.right,
    height_barchart = svgHeight_barchart - margin_barchart.top - margin_barchart.bottom;

var svg_barchart = d3.select("#barchartDiv")
  .append("div")
  // Container class to make it responsive.
  .classed("svg-container", true)
  .append("svg")
  // Responsive SVG needs these 2 attributes and no width and height attr.
  // .attr("preserveAspectRatio", "xMidYMid none")
  .attr("viewBox", "0 0 " + svgWidth_barchart + " " + svgHeight_barchart)
  // Class to make it responsive.
  .classed("svg-content-responsive", true)

//////////
// AXES //
//////////

var x_barchart = d3.scaleLinear()
    .range([0, width_barchart])

var y_barchart = d3.scaleBand()
    .rangeRound([height_barchart, 0])
    .padding(0.1);

var xAxis_barchart = d3.axisBottom(x_barchart).ticks(10);
var yAxis_barchart = d3.axisLeft(y_barchart).ticks(0);

svg_barchart.append("g")
  .attr("class", "x axis")
  .attr('id', "axis--x_barchart")
  .attr("transform", "translate(0," + height_barchart + ")")
  .call(xAxis_barchart);

svg_barchart.append("text")
  .style("text-anchor", "end")
  .attr("x", width_barchart)
  .attr("y", height_barchart - 8)
  .text("X Axis");

svg_barchart.append("g")
  .attr("class", "y_axis_barchart")
  .attr('id', "axis--y_barchart")
  // offset to right so ticks are not covered
  .attr("transform", "translate(30,0)")
  .call(yAxis_barchart)

svg_barchart.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "1em")
  .style("text-anchor", "end")
  .text("Y Axis");

///////////////////////////
// DATA DEPENDANT UPDATE //
///////////////////////////

var drawBarChartPicked = function(err, chart_data) {

  data = []
  for(let i=0; i<5; i++) {
    data.push({"name" : chart_data[0][i].name, "value" : chart_data[0][i].value})
  }

  console.log("POST", data)

  data.forEach(function(d) {
    d.value = +d.value;
  });

  x_barchart.domain([0, d3.max(data, function (d) { return d.value; })]);
  y_barchart.domain(data.map(function (d) {return d.name; }));

  var bars = svg_barchart.selectAll(".bar")
    .remove()
    .exit()
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("y", function (d) { return y_barchart(d.name); })
    .attr("height", y_barchart.bandwidth())
    .attr("x", 50)
    .attr("width", function (d) { return x_barchart(d.value); })


  // add value label to end of each bar
  svg_barchart.selectAll(".text")
    .data(data)
    .enter()
    .append("text")
    .attr("class","label")
    .text(function (d) { return d.name; })
    //y position of the label is halfway down the bar
    .attr("y", function (d) { return y_barchart(d.name) + y_barchart.bandwidth() / 2 + 4; })
    //x position is at end of bar - boundary box of text
    .attr("x", function (d) {
      console.log("BBOX", this.getBBox().width);
      return x_barchart(d.value) - this.getBBox().width;
    });

  svg_barchart.select("#axis--y_barchart").call(yAxis_barchart)
  svg_barchart.select("#axis--x_barchart").call(xAxis_barchart)
}
