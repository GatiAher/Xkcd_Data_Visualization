class Barchart extends Chart {
  constructor(div, id_label) {
    super(div, id_label);

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

    this.labels = ["picked", "selected", "all"];
  }

  update(chart_data) {
    let chart_obj = this;
    let data = []
    for (const idx in chart_data[0]) {
      let arr = chart_data[0][idx];
      data.push({"name":arr.name,
        [chart_obj.labels[0]]:arr.value[0],
        [chart_obj.labels[1]]:arr.value[1],
        [chart_obj.labels[2]]:arr.value[2]});
    }
    chart_obj.data = data;
    chart_obj.draw();
  }

  draw() {
    let chart_obj = this;

    // calculate max domain x
    let max_domain_x = [0];
    d3.selectAll(".checkboxBarchart").each(function(d) {
      let checkbox = d3.select(this);
      if(checkbox.property("checked")) {
        let group = checkbox.property("value");
        let max_val = d3.max(chart_obj.data, function(d) {return d[group]; });
        max_domain_x.push(max_val);
      }
    });
    chart_obj.x.domain([0, d3.max(max_domain_x)]);
    chart_obj.y.domain(chart_obj.data.map(function (d) {return d.name; }));

    // redraw bars
    let len_labels = chart_obj.labels.length-1; // get length of labels-1
    for (const idx in chart_obj.labels) {
      let group = chart_obj.labels[len_labels-idx]; // want in reverse order

      let unchecked = !d3.select("#" + [group] + "_CheckBox").property("checked");

      let bars = chart_obj.svg.selectAll(".bar_" + [group])
        .data(chart_obj.data);

      // new data
      bars
        .enter().append("rect")
        .attr("class", "bar_" + [group])
        .attr("y", function (d) { return chart_obj.y(d.name); })
        .attr("height", function(d) { return chart_obj.y.bandwidth(); })
        .attr("x", function (d) {
          if (unchecked) { return 0; }
          return chart_obj.x(d[group]); })
        .attr("width", function (d) {
          if (unchecked) { return 0; }
          return chart_obj.width - (chart_obj.x(d[group])); });

      bars.exit().remove();

      // updated data:
      bars.transition()
        .duration(750)
        .attr("y", function (d) { return chart_obj.y(d.name); })
        .attr("height", function(d) { return chart_obj.y.bandwidth(); })
        .attr("x", function(d) {
          if (unchecked) { return 0; }
          return chart_obj.margin.left })
        .attr("width", function (d) {
          if (unchecked) { return 0; }
          return chart_obj.x(d[group]) - chart_obj.margin.left; });
    }

    // update axes
    chart_obj.svg.select("#axis--y" + chart_obj.id_label).transition().duration(750).call(chart_obj.yAxis)
    chart_obj.svg.select("#axis--x" + chart_obj.id_label).transition().duration(750).call(chart_obj.xAxis)
  }
}

var barchart = new Barchart("#barchartDiv", "_barchart");

d3.selectAll(".checkboxBarchart").on("change", function() {
  barchart.draw();
});
