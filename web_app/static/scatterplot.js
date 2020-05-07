//////////////////////////////
// SVG AND GRAPH DIMENSIONS //
//////////////////////////////

// make sure to change on viewbox property as well
// to preserve aspect ratio of plot
var svgWidth = 900, svgHeight = 850;

var margin = { top: 20, right: 20, bottom: 30, left: 30 };
var width = svgWidth - margin.left - margin.right,
height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#scatterplotDiv")
  .append("div")
  // Container class to make it responsive.
  .classed("svg-container", true)
  .append("svg")
  // Responsive SVG needs these 2 attributes and no width and height attr.
  // .attr("preserveAspectRatio", "xMidYMid none")
  .attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
  // Class to make it responsive.
  .classed("svg-content-responsive", true)

//////////
// AXES //
//////////

var x = d3.scaleLinear()
  .range([0, width])
  .nice();

var y = d3.scaleLinear()
  .range([height, 0])
  .nice();

var xAxis = d3.axisBottom(x).ticks(10);
var yAxis = d3.axisLeft(y).ticks(10);

// x axis
svg.append("g")
  .attr("class", "x axis")
  .attr('id', "axis--x")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

svg.append("text")
  .style("text-anchor", "end")
  .attr("x", width)
  .attr("y", height - 8)
  .text("X Axis");

// y axis
svg.append("g")
  .attr("class", "y axis")
  .attr('id', "axis--y")
  // offset to right so ticks are not covered
  .attr("transform", "translate(30,0)")
  .call(yAxis);

svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "1em")
  .style("text-anchor", "end")
  .text("Y Axis");

///////////////////////////
// DATA DEPENDANT UPDATE //
///////////////////////////

function drawScatterplot(data) {
    // data dependant code

    // first set domain based off of data domain
    x.domain(d3.extent(comic_data, function (d) { return d.x; })).nice()
    y.domain(d3.extent(comic_data, function (d) { return d.y; })).nice()

    // append brush before points so tooltips work
    scatter.append("g")
      .attr("class", "brush")
      .call(brush);

    // append points
    scatter.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 8)
      .attr("cx", function (d) { return x(d.x); })
      .attr("cy", function (d) { return y(d.y); })
      .attr('sn', function(d) { return d.sn })
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)
      .on("click", click)
}

/////////////////////////////
// USER INTERACTION UPDATE //
/////////////////////////////

// BRUSH AND CLIP AND SCATTER

var clip = svg.append("defs").append("svg:clipPath")
  .attr("id", "clip")
  .append("svg:rect")
  .attr("width", width )
  .attr("height", height )
  .attr("x", 0)
  .attr("y", 0);

var scatter = svg.append("g")
  .attr("id", "scatterplot")
  .attr("clip-path", "url(#clip)");

var brush = d3.brush()
  .extent([[0, 0], [width, height]])
  .on("end", brushended);

var idleTimeout,
idleDelay = 350;

function brushended() {

    let s = d3.event.selection;

    if (!s) {
        // if nothing selected, reset axes
        if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
        x.domain(d3.extent(comic_data, function (d) { return d.x; })).nice();
        y.domain(d3.extent(comic_data, function (d) { return d.y; })).nice();

    } else {
        // make the selection, do before zoom changes range of chart
        scatter.selectAll(".dot").classed("selected", function(d){
          return isBrushed(s, x(d.x), y(d.y))
        });

        // get list of sn of selected comics
        let my_selection = [];
        scatter.selectAll(".selected")
          .each(function(d) {
            my_selection.push(d.sn);
          });
        sendSelected(my_selection)
        document.getElementById("jsonList").innerHTML = my_selection;

        // adjust axes to selected data
        x.domain([ x.invert(s[0][0]), x.invert(s[1][0]) ]);
        y.domain([ y.invert(s[1][1]), y.invert(s[0][1]) ]);
        scatter.select(".brush").call(brush.move, null);
    }
    zoom();
}

function idled() {
    idleTimeout = null;
}

function isBrushed(brush_coords, cx, cy) {
   let x0 = brush_coords[0][0],
       x1 = brush_coords[1][0],
       y0 = brush_coords[0][1],
       y1 = brush_coords[1][1];
  // This return TRUE or FALSE depending on if the points is in the selected area
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
}

function zoom() {
    let tr = scatter.transition().duration(750);
    svg.select("#axis--x").transition(tr).call(xAxis);
    svg.select("#axis--y").transition(tr).call(yAxis);

    scatter.selectAll("circle").transition(tr)
    .attr("cx", function (d) { return x(d.x); })
    .attr("cy", function (d) { return y(d.y); });
}

// HOVER DATA ON SCATTERPLOT

var tooltip = d3.select("#tooltip")

// change the tooltip and circle when user hover over a circle
var mouseover = function(d) {
  tooltip
    .html("hover |<br>  " + d.title)
  d3.select(this)
  .classed("hovered", true);
}

// change the tooltip and circle when user leave a circle
var mouseleave = function(d) {
  tooltip
    .html("hover |<br><br>")
  d3.select(this)
    .classed("hovered", false);
}

// PICKED DATA ON SCATTERPLOT

// change when user clicks a circle
var click = function(d) {
  // clear previously picked point
  scatter.selectAll(".picked").classed("picked", false);
  // pick new point
  d3.select(this)
    .classed("picked", true);
  // update dependant values
  generalPick(d.title, d.altText, d.imageUrl, d.sn)
}

// attach listner to inputPick
d3.select("#inputPick").on("change", function () {
  var inputData = d3.select(this).property('value');
  // clear previously picked point
  scatter.selectAll(".picked").classed("picked", false);
  // pick new point
  var pickedPoint = d3.selectAll(".dot")
    .filter(function(d) { return d.sn == inputData })
    .classed("picked", true);
  // update dependant values
  generalPick(pickedPoint.datum().title, pickedPoint.datum().altText, pickedPoint.datum().imageUrl, inputData)
})
