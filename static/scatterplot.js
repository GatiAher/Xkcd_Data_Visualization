class Scatterplot extends Chart {
  constructor(div, id_label) {
    super(div, id_label);

    //////////
    // AXES //
    //////////

    this.x = d3.scaleLinear()
      .range([this.margin.left, this.width - this.margin.right]).nice();

    this.y = d3.scaleLinear()
      .range([this.height - this.margin.bottom, this.margin.top]).nice();

    this.xAxis = d3.axisBottom(this.x).ticks(10);
    this.yAxis = d3.axisLeft(this.y).ticks(10);

    this.svg.append("g")
      .attr("class", "x axis")
      .attr('id', "axis--x" + this.id_label)
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis);

    this.svg.append("g")
      .attr("class", "y_axis")
      .attr('id', "axis--y" + this.id_label)
      // offset to right so ticks are not covered
      .attr("transform", "translate(30,0)")
      .call(this.yAxis)

    /////////////
    // SPECIAL //
    /////////////

    this.clip = this.svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", this.width )
      .attr("height", this.height )
      .attr("x", 0)
      .attr("y", 0);

    this.scatter = this.svg.append("g")
      .attr("id", "scatterplot")
      .attr("clip-path", "url(#clip)");

    this.brush = d3.brush()
      .extent([[0, 0], [this.width, this.height]])
      .on("end", brushended);

    this.idleTimeout = null;
    this.idleDelay = 350;
  }

  draw(data) {
    let chart_obj = this;

    chart_obj.data = data;

    // first set domain based off of data domain
    chart_obj.x.domain(d3.extent(chart_obj.data, function (d) { return d.x; })).nice()
    chart_obj.y.domain(d3.extent(chart_obj.data, function (d) { return d.y; })).nice()

    // append brush before points so tooltips work
    chart_obj.scatter.append("g")
      .attr("class", "brush")
      .call(chart_obj.brush);

    // append points
    chart_obj.scatter.selectAll(".dot_basic")
      .data(chart_obj.data)
      .enter().append("circle")
      .attr("class", "dot_basic")
      .attr("r", 4)
      .attr("cx", function (d) { return chart_obj.x(d.x); })
      .attr("cy", function (d) { return chart_obj.y(d.y); })
      .attr('sn', function(d) { return d.sn })
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)
      .on("click", click)
  }
}


function brushended() {
  let s = d3.event.selection;

  if (!s) {
      // if nothing selected, reset axes
      if (!scatterplot.idleTimeout) {
        return scatterplot.idleTimeout = setTimeout(idled, scatterplot.idleDelay);
      }
      scatterplot.x.domain(d3.extent(scatterplot.data, function (d) { return d.x; })).nice();
      scatterplot.y.domain(d3.extent(scatterplot.data, function (d) { return d.y; })).nice();

  } else {
      // make the selection, do before zoom changes range of chart
      scatterplot.scatter.selectAll("circle").classed("dot_selected", function(d){
        return isBrushed(s, scatterplot.x(d.x), scatterplot.y(d.y))
      });

      // get list of sn of selected comics
      let my_selection = [];
      scatterplot.scatter.selectAll(".dot_selected")
        .each(function(d) {
          my_selection.push(d.sn);
        });
      generalSelect(my_selection);

      // adjust axes to selected data
      scatterplot.x.domain([ scatterplot.x.invert(s[0][0]), scatterplot.x.invert(s[1][0]) ]);
      scatterplot.y.domain([ scatterplot.y.invert(s[1][1]), scatterplot.y.invert(s[0][1]) ]);
      scatterplot.scatter.select(".brush").call(scatterplot.brush.move, null);
  }
  zoom();
}

function idled() {
  scatterplot.idleTimeout = null;
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
  let tr = scatterplot.scatter.transition().duration(750);
  scatterplot.svg.select("#axis--x" + scatterplot.id_label).transition(tr).call(scatterplot.xAxis);
  scatterplot.svg.select("#axis--y" + scatterplot.id_label).transition(tr).call(scatterplot.yAxis);

  scatterplot.scatter.selectAll("circle").transition(tr)
    .attr("cx", function (d) { return scatterplot.x(d.x); })
    .attr("cy", function (d) { return scatterplot.y(d.y); });
}

// HOVER DATA ON SCATTERPLOT

var tooltip = d3.select("#tooltip")

// change the tooltip and circle when user hover over a circle
var mouseover = function(d) {
  tooltip
    .html("hover |<br>  " + d.title)
  d3.select(this)
    .classed("dot_hovered", true);
}

// change the tooltip and circle when user leave a circle
var mouseleave = function(d) {
  tooltip
    .html("hover |<br><br>")
  d3.select(this)
    .classed("dot_hovered", false);
}

// PICKED DATA ON SCATTERPLOT

// change when user clicks a circle
var click = function(d) {
  // clear previously picked point
  scatterplot.scatter.selectAll(".dot_picked").classed("dot_picked", false);
  // pick new point
  d3.select(this)
    .classed("dot_picked", true);
  // update dependant values
  generalPick(d.title, d.altText, d.imageUrl, d.sn)
}

// attach listner to inputPick
d3.select("#inputPick").on("change", function () {
  var inputData = d3.select(this).property('value');
  // clear previously picked point
  scatterplot.scatter.selectAll(".dot_picked").classed("dot_picked", false);
  // pick new point
  var pickedPoint = d3.selectAll("circle")
    .filter(function(d) { return d.sn == inputData })
    .classed("dot_picked", true);
  // update dependant values
  generalPick(pickedPoint.datum().title, pickedPoint.datum().altText, pickedPoint.datum().imageUrl, inputData)
})
