//////////////////////////////
// SVG AND GRAPH DIMENSIONS //
//////////////////////////////

var svgWidth_barchart_picked = 900, svgHeight_barchart_picked = 850;

//set up svg using margin conventions - we'll need plenty of room on the left for labels
var margin_barchart_picked = { top: 15, right: 25, bottom: 15, left: 60 };

var width_barchart_picked = svgWidth_barchart_picked - margin_barchart_picked.left - margin_barchart_picked.right,
    height_barchart_picked = svgHeight_barchart_picked - margin_barchart_picked.top - margin_barchart_picked.bottom;

var svg_barchart_picked = d3.select("#barchartPickedDiv")
  .append("div")
  // Container class to make it responsive.
  .classed("svg-container", true)
  .append("svg")
  // Responsive SVG needs these 2 attributes and no width and height attr.
  // .attr("preserveAspectRatio", "xMidYMid none")
  .attr("viewBox", "0 0 " + svgWidth_barchart_picked + " " + svgHeight_barchart_picked)
  // Class to make it responsive.
  .classed("svg-content-responsive", true)

//////////
// AXES //
//////////

var x_barchart_picked = d3.scaleLinear()
    .range([0, width_barchart_picked])

var y_barchart_picked = d3.scaleBand()
    .rangeRound([height_barchart_picked, 0])
    .padding(0.1);

var xAxis_barchart_picked = d3.axisBottom(x_barchart_picked).ticks(10);
var yAxis_barchart_picked = d3.axisLeft(y_barchart_picked).ticks(0);

svg_barchart_picked.append("g")
  .attr("class", "x axis")
  .attr('id', "axis--x_barchart_picked")
  .attr("transform", "translate(0," + height_barchart_picked + ")")
  .call(xAxis_barchart_picked);

svg_barchart_picked.append("text")
  .style("text-anchor", "end")
  .attr("x", width_barchart_picked)
  .attr("y", height_barchart_picked - 8)
  .text("X Axis");

svg_barchart_picked.append("g")
  .attr("class", "y_axis_barchart_picked")
  .attr('id', "axis--y_barchart_picked")
  // offset to right so ticks are not covered
  .attr("transform", "translate(30,0)")
  .call(yAxis_barchart_picked)

svg_barchart_picked.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "1em")
  .style("text-anchor", "end")
  .text("Y Axis");

///////////////////////////
// DATA DEPENDANT UPDATE //
///////////////////////////

var drawBarchartPicked = function(chart_data) {

  data = []
  for(let i=0; i<5; i++) {
    data.push({"name" : chart_data[0][i].name, "value" : chart_data[0][i].value})
  }

  console.log("POST", data)

  data.forEach(function(d) {
    d.value = +d.value;
  });

  x_barchart_picked.domain([0, d3.max(data, function (d) { return d.value; })]);
  y_barchart_picked.domain(data.map(function (d) {return d.name; }));

  svg_barchart_picked.selectAll(".bar_picked")
    .remove()
    .exit()
    .data(data)
    .enter().append("rect")
    .attr("class", "bar_picked")
    .attr("y", function (d) { return y_barchart_picked(d.name); })
    .attr("height", y_barchart_picked.bandwidth())
    .attr("x", 50)
    .attr("width", function (d) { return x_barchart_picked(d.value); })


  // add value label to end of each bar
  svg_barchart_picked.selectAll(".text")
    .data(data)
    .enter()
    .append("text")
    .attr("class","label")
    .text(function (d) { return d.name; })
    //y position of the label is halfway down the bar
    .attr("y", function (d) { return y_barchart_picked(d.name) + y_barchart_picked.bandwidth() / 2 + 4; })
    //x position is at end of bar - boundary box of text
    .attr("x", function (d) {
      return x_barchart_picked(d.value) - this.getBBox().width;
    });

  svg_barchart_picked.select("#axis--y_barchart_picked").call(yAxis_barchart_picked)
  svg_barchart_picked.select("#axis--x_barchart_picked").call(xAxis_barchart_picked)
}
