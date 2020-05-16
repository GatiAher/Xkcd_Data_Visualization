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
      .attr("transform", "translate(0," + (this.height - this.margin.bottom) + ")")
      .call(this.xAxis);

    this.svg.append("g")
      .attr("class", "y_axis")
      .attr('id', "axis--y" + this.id_label)
      // offset to right so ticks are not covered
      .attr("transform", "translate(" + (this.margin.left) + ",0)")
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

    ////////////////////
    // BRUSH BEHAVIOR //
    ////////////////////

    this.brush = d3.brush()
      .extent([[0, 0], [this.width, this.height]])
      .on("end", () => {

        let s = d3.event.selection;

        if (!s) {
            // if double-click, reset axes
            if (!this.idleTimeout) {
              return this.idleTimeout = setTimeout(
                () => {this.idleTimeout = null; },
                this.idleDelay);
            }

            this.x.domain(d3.extent(this.data, (d) => { return d.x; })).nice();
            this.y.domain(d3.extent(this.data, (d) => { return d.y; })).nice();

        } else {
            // color selection, do before zoom changes range of chart
            this.scatter.selectAll("circle").classed("dot_selected", (d) => {
              return isBrushed(s, this.x(d.x), this.y(d.y))
            });

            // get list of sn of selected comics, selection logic
            let my_selection = [];
            this.scatter.selectAll(".dot_selected")
              .each( (d) => {
                my_selection.push(d.sn);
              });
            generalSelect(my_selection);

            // adjust axes to selected data
            this.x.domain([ this.x.invert(s[0][0]), this.x.invert(s[1][0]) ]);
            this.y.domain([ this.y.invert(s[1][1]), this.y.invert(s[0][1]) ]);
            this.scatter.select(".brush").call(this.brush.move, null);
        }
        // zoom
        let tr = this.scatter.transition().duration(750);
        this.svg.select("#axis--x" + this.id_label).transition(tr).call(this.xAxis);
        this.svg.select("#axis--y" + this.id_label).transition(tr).call(this.yAxis);

        this.scatter.selectAll("circle").transition(tr)
          .attr("cx", (d) => { return this.x(d.x); })
          .attr("cy", (d) => { return this.y(d.y); });
      });

    this.idleTimeout = null;
    this.idleDelay = 350;
  }

  update(chart_data) {
    this.data = chart_data;
    this.draw();
  }

  draw() {
    // first set domain based off of data domain
    this.x.domain(d3.extent(this.data, (d) => { return d.x; })).nice()
    this.y.domain(d3.extent(this.data, (d) => { return d.y; })).nice()

    // append brush before points so tooltips work
    this.scatter.append("g")
      .attr("class", "brush")
      .call(this.brush);

    // append points
    this.scatter.selectAll(".dot_basic")
      .data(this.data)
      .enter().append("circle")
      .attr("class", "dot_basic")
      .attr("r", 4)
      .attr("cx", (d) => { return this.x(d.x); })
      .attr("cy", (d) => { return this.y(d.y); })
      .attr('sn', (d) => { return d.sn })
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)
      .on("click", click)
  }
}

//////////////////////////////////////
// SELECTED BEHAVIOR ON SCATTERPLOT //
//////////////////////////////////////

// disable scroll behavior when brushing
// d3.select("#scatterplotDiv")
document.getElementById("scatterplotDiv")
  .addEventListener('touchmove', function(e) {e.preventDefault(); }, false);

// helper function
function isBrushed(brush_coords, cx, cy) {
   let x0 = brush_coords[0][0],
       x1 = brush_coords[1][0],
       y0 = brush_coords[0][1],
       y1 = brush_coords[1][1];
  // This return TRUE or FALSE depending on if the points is in the selected area
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
}

///////////////////////////////////
// HOVER BEHAVIOR ON SCATTERPLOT //
///////////////////////////////////

// on hover, display comic title name
var tooltip = d3.select("#scatterplotDiv")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// change the tooltip and circle when user hover over a circle
var mouseover = function(d) {
  tooltip.transition()
    .duration(200)
    .style("opacity", .9)
  tooltip.html(d.title)
    .style("left", (d3.mouse(this)[0]) + "px")
    // .style("left", (0) + "px")
    .style("top", (d3.mouse(this)[1]) + "px");
  d3.select(this)
    .classed("dot_hovered", true);
}

// change the tooltip and circle when user leave a circle
var mouseleave = function(d) {
  tooltip.transition()
    .duration(500)
    .style("opacity", 0)
  d3.select(this)
    .classed("dot_hovered", false);
}

////////////////////////////////////
// PICKED BEHAVIOR ON SCATTERPLOT //
////////////////////////////////////

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
d3.select("#inputPick").on("change", function() {
  var inputData = d3.select(this).property('value');
  // clear previously picked point
  scatterplot.scatter.selectAll(".dot_picked").classed("dot_picked", false);
  // pick new point
  var pickedPoint = d3.selectAll("circle")
    .filter(function(d) { return d.sn == inputData })
    .classed("dot_picked", true);
  // update dependant values
  generalPick(pickedPoint.datum().title, pickedPoint.datum().altText, pickedPoint.datum().imageUrl, inputData)
});
