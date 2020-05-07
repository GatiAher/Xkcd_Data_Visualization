//////////////////////////////
// SVG AND GRAPH DIMENSIONS //
//////////////////////////////

var svgWidth_barchart_selected = 900, svgHeight_barchart_selected = 850;

//set up svg using margin conventions - we'll need plenty of room on the left for labels
var margin_barchart_selected = { top: 15, right: 25, bottom: 15, left: 60 };

var width_barchart_selected = svgWidth_barchart_selected - margin_barchart_selected.left - margin_barchart_selected.right,
    height_barchart_selected = svgHeight_barchart_selected - margin_barchart_selected.top - margin_barchart_selected.bottom;

var svg_barchart_selected = d3.select("#barchartSelectedDiv")
  .append("div")
  // Container class to make it responsive.
  .classed("svg-container", true)
  .append("svg")
  // Responsive SVG needs these 2 attributes and no width and height attr.
  // .attr("preserveAspectRatio", "xMidYMid none")
  .attr("viewBox", "0 0 " + svgWidth_barchart_selected + " " + svgHeight_barchart_selected)
  // Class to make it responsive.
  .classed("svg-content-responsive", true)

//////////
// AXES //
//////////

var x_barchart_selected = d3.scaleLinear()
    .range([0, width_barchart_selected])

var y_barchart_selected = d3.scaleBand()
    .rangeRound([height_barchart_selected, 0])
    .padding(0.1);

var xAxis_barchart_selected = d3.axisBottom(x_barchart_selected).ticks(10);
var yAxis_barchart_selected = d3.axisLeft(y_barchart_selected).ticks(0);

svg_barchart_selected.append("g")
  .attr("class", "x axis")
  .attr('id', "axis--x_barchart_selected")
  .attr("transform", "translate(0," + height_barchart_selected + ")")
  .call(xAxis_barchart_selected);

svg_barchart_selected.append("text")
  .style("text-anchor", "end")
  .attr("x", width_barchart_selected)
  .attr("y", height_barchart_selected - 8)
  .text("X Axis");

svg_barchart_selected.append("g")
  .attr("class", "y_axis_barchart_selected")
  .attr('id', "axis--y_barchart_selected")
  // offset to right so ticks are not covered
  .attr("transform", "translate(30,0)")
  .call(yAxis_barchart_selected)

svg_barchart_selected.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "1em")
  .style("text-anchor", "end")
  .text("Y Axis");

///////////////////////////
// DATA DEPENDANT UPDATE //
///////////////////////////

var drawBarchartSelected = function(chart_data) {

  data = []
  for(let i=0; i<5; i++) {
    data.push({"name" : chart_data[0][i].name, "value" : chart_data[0][i].value})
  }

  console.log("POST", data)

  data.forEach(function(d) {
    d.value = +d.value;
  });

  x_barchart_selected.domain([0, d3.max(data, function (d) { return d.value; })]);
  y_barchart_selected.domain(data.map(function (d) {return d.name; }));

  bars = svg_barchart_selected.selectAll(".bar_selected")
    .remove()
    .exit()
    .data(data)
    .enter().append("rect")
    .attr("class", "bar_selected")
    .attr("y", function (d) { return y_barchart_selected(d.name); })
    .attr("height", y_barchart_selected.bandwidth())
    .attr("x", 50)
    .attr("width", function (d) { return x_barchart_selected(d.value); })


  // add value label to end of each bar
  svg_barchart_selected.selectAll(".text")
    .data(data)
    .enter()
    .append("text")
    .attr("class","label")
    .text(function (d) { return d.name; })
    //y position of the label is halfway down the bar
    .attr("y", function (d) { return y_barchart_selected(d.name) + y_barchart_selected.bandwidth() / 2 + 4; })
    //x position is at end of bar - boundary box of text
    .attr("x", function (d) {
      return x_barchart_selected(d.value) - this.getBBox().width;
    });

  svg_barchart_selected.select("#axis--y_barchart_selected").call(yAxis_barchart_selected)
  svg_barchart_selected.select("#axis--x_barchart_selected").call(xAxis_barchart_selected)
}
