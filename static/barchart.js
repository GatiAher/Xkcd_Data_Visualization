class Barchart extends Chart {
  constructor(div_id) {
    super(div_id);

    //////////
    // AXES //
    //////////

    this.x = d3.scaleLinear()
      .range([this.margin.left, this.width - this.margin.right]);

    this.y = d3.scaleBand()
      .rangeRound([this.height - this.margin.bottom, this.margin.top])
      .padding(0.1);

    this.xAxis = d3.axisBottom(this.x).ticks(10);
    this.yAxis = d3.axisLeft(this.y).ticks(0);

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

    this.labels = ["picked", "selected", "all"];

    d3.selectAll(".checkbox-barchart").on("change", () => {
      this.draw();
    });

  }

  update_and_draw(chart_data) {
    let data = []
    for (const idx in chart_data[0]) {
      let arr = chart_data[0][idx];
      data.push({"name":arr.name,
        [this.labels[0]]:arr.value[0],
        [this.labels[1]]:arr.value[1],
        [this.labels[2]]:arr.value[2]});
    }
    this.data = data;
    this.draw();
  }

  draw() {
    // calculate max domain x
    let max_domain_x = [0];
    d3.selectAll(".checkbox-barchart").each((d, i, nodes) => {
      let checkbox = d3.select(nodes[i]);
      if(checkbox.property("checked")) {
        let group = checkbox.property("value");
        let max_val = d3.max(this.data, (d) => {return d[group]; });
        max_domain_x.push(max_val);
      }
    });
    this.x.domain([0, d3.max(max_domain_x)]);
    this.y.domain(this.data.map((d) => {return d.name; }));

    // redraw bars
    for (const idx in this.labels) {
      // draw group in reverse order (slice makes new array so original is not modified)
      let group = this.labels.slice().reverse()[idx];
      // ex: checkbox-barchart-picked
      let unchecked = !d3.select("#checkbox-barchart-" + [group]).property("checked");

      let bars = this.svg.selectAll(".bar_" + [group])
        .data(this.data);

      // new data (optical illusion animation, bars are inverse)
      bars
        .enter().append("rect")
        .attr("class", "bar_" + [group])
        .attr("y", (d) => { return this.y(d.name); })
        .attr("height", (d) => { return this.y.bandwidth(); })
        .attr("x", (d) => {
          if (unchecked) { return 0; }
          return this.x(d[group]); })
        .attr("width", (d) => {
          if (unchecked) { return 0; }
          return this.width - (this.x(d[group])); });

      bars.exit().remove();

      // updated data:
      bars.transition()
        .duration(750)
        .attr("y", (d) => { return this.y(d.name); })
        .attr("height", (d) => { return this.y.bandwidth(); })
        .attr("x", (d) => {
          if (unchecked) { return 0; }
          return this.margin.left })
        .attr("width", (d) => {
          if (unchecked) { return 0; }
          return this.x(d[group]) - this.margin.left; });
    }

    // update axes
    this.svg.select("#axis--y-" + this.div_id).transition().duration(750).call(this.yAxis)
    this.svg.select("#axis--x-" + this.div_id).transition().duration(750).call(this.xAxis)
  }
}
