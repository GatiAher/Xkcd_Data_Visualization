class Barchart extends Chart {
  constructor(customId) {
    super(customId);

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
      .attr('id', "axis--x-" + this.customId)
      .attr("transform", "translate(0," + (this.height - this.margin.bottom) + ")")
      .call(this.xAxis);

    this.svg.append("g")
      .attr('id', "axis--y-" + this.customId)
      // offset to right so ticks are not covered
      .attr("transform", "translate(" + (this.margin.left) + ",0)")
      .call(this.yAxis)

    /////////////
    // SPECIAL //
    /////////////

    this.labels = ["picked", "selected", "all"];

    d3.selectAll(".checkbox-" + this.customId).on("change", () => {
      this.draw();
    });

  }

  updateAndDraw(chartData) {
    let data = []
    for (const idx in chartData[0]) {
      let arr = chartData[0][idx];
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
    let maxDomainXList = [0];
    d3.selectAll(".checkbox-" + this.customId).each((d, i, nodes) => {
      let checkbox = d3.select(nodes[i]);
      if(checkbox.property("checked")) {
        let group = checkbox.property("value");
        let maxVal = d3.max(this.data, (d) => {return d[group]; });
        maxDomainXList.push(maxVal);
      }
    });
    this.x.domain([0, d3.max(maxDomainXList)]);
    this.y.domain(this.data.map((d) => {return d.name; }));

    // redraw bars
    for (const idx in this.labels) {
      // draw group in reverse order (slice makes new array so original is not modified)
      let group = this.labels.slice().reverse()[idx];
      // ex: checkbox-barchart-picked
      let unchecked = !d3.select("#checkbox-"+ this.customId + "-" + [group]).property("checked");

      let bars = this.svg.selectAll(".bar-" + [group])
        .data(this.data);

      // new data (optical illusion animation, bars are inverse)
      bars
        .enter().append("rect")
        .attr("class", "bar-" + [group])
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
    this.svg.select("#axis--y-" + this.customId).transition().duration(750).call(this.yAxis)
    this.svg.select("#axis--x-" + this.customId).transition().duration(750).call(this.xAxis)
  }
}
