class Scatterplot extends Chart {
  constructor(div_id) {
    super(div_id);

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
      .attr('id', "axis--x-" + this.div_id)
      .attr("transform", "translate(0," + (this.height - this.margin.bottom) + ")")
      .call(this.xAxis);

    this.svg.append("g")
      .attr("class", "y_axis")
      .attr('id', "axis--y-" + this.div_id)
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
      .attr("id", "scatter")
      .attr("clip-path", "url(#clip)");

    // prevent scrolling on body when brushing on chart
    document.getElementById(this.div_id)
      .addEventListener('touchmove', function(e) {e.preventDefault(); }, false);

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
        this.svg.select("#axis--x-" + this.div_id).transition(tr).call(this.xAxis);
        this.svg.select("#axis--y-" + this.div_id).transition(tr).call(this.yAxis);

        this.scatter.selectAll("circle").transition(tr)
          .attr("cx", (d) => { return this.x(d.x); })
          .attr("cy", (d) => { return this.y(d.y); });
      });

    this.idleTimeout = null;
    this.idleDelay = 350;

    // on mouseover on scatter's dots, display comic title name
    this.tooltip = d3.select("#" + this.div_id)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // attach listener to form-scatterplot-picked
    d3.select("#form-scatterplot-picked").on("change", (d, i, nodes) => {
      let inputData = d3.select(nodes[i]).property('value');
      // clear previously picked point
      this.scatter.select(".dot_picked").classed("dot_picked", false);
      // pick new point
      let pickedPoint = d3.selectAll("circle")
        .filter((d) => { return d.sn == inputData })
        .classed("dot_picked", true)
        .datum();
      // update dependant values
      generalPick(pickedPoint.title, pickedPoint.altText, pickedPoint.imageUrl, inputData)
    });
  }

  update_and_draw(chart_data) {
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
      .on("mouseover", (d, i, nodes) => {
        d3.select(nodes[i]).classed("dot_hovered", true);
        this.tooltip.transition().duration(200).style("opacity", .9);
        this.tooltip.html(d.title)
          .style("left", d3.mouse(nodes[i])[0]+"px")
          .style("top", d3.mouse(nodes[i])[1]+"px")
      })
      .on("mouseleave", (d, i, nodes) => {
        d3.select(nodes[i]).classed("dot_hovered", false);
        this.tooltip.transition().duration(500).style("opacity", 0)
      })

      .on("click", (d, i, nodes) => {
        // clear previously picked point
        this.scatter.select(".dot_picked").classed("dot_picked", false);
        // pick new point
        d3.select(nodes[i])
          .classed("dot_picked", true);
        // update dependant values
        generalPick(d.title, d.altText, d.imageUrl, d.sn)
      });
  }
}


// helper function for brushing
function isBrushed(brush_coords, cx, cy) {
   let x0 = brush_coords[0][0],
       x1 = brush_coords[1][0],
       y0 = brush_coords[0][1],
       y1 = brush_coords[1][1];
  // This return TRUE or FALSE depending on if the points is in the selected area
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
}
