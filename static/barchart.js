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
  }

  draw(chart_data) {
    let  chart_obj = this;

    let data = []
    let j = 0;
    while(chart_data[0][j]) {
      let arr = chart_data[0][j]
      data.push({"name":arr.name, "picked":arr.value[0], "selected":arr.value[1], "all":arr.value[2]})
      j = j+1;
    }

    chart_obj.x.domain([0, d3.max(data, function (d) { return d.all; })]);
    chart_obj.y.domain(data.map(function (d) {return d.name; }));

    chart_obj.svg.selectAll(".bar_basic")
      .remove()
      .exit()
      .data(data)
      .enter().append("rect")
      .attr("class", "bar_basic")
      .attr("y", function (d) { return chart_obj.y(d.name); })
      .attr("height", chart_obj.y.bandwidth())
      .attr("x", chart_obj.margin.left)
      .attr("width", function (d) { return chart_obj.x(d.all) - chart_obj.margin.left; });

    chart_obj.svg.selectAll(".bar_selected")
      .remove()
      .exit()
      .data(data)
      .enter().append("rect")
      .attr("class", "bar_selected")
      .attr("y", function (d) { return chart_obj.y(d.name); })
      .attr("height", chart_obj.y.bandwidth())
      .attr("x", chart_obj.margin.left)
      .attr("width", function (d) { return chart_obj.x(d.selected) - chart_obj.margin.left; });

    chart_obj.svg.selectAll(".bar_picked")
      .remove()
      .exit()
      .data(data)
      .enter().append("rect")
      .attr("class", "bar_picked")
      .attr("y", function (d) { return chart_obj.y(d.name); })
      .attr("height", chart_obj.y.bandwidth())
      .attr("x", chart_obj.margin.left)
      .attr("width", function (d) { return chart_obj.x(d.picked) - chart_obj.margin.left; });

    chart_obj.svg.select("#axis--y" + chart_obj.id_label).call(chart_obj.yAxis)
    chart_obj.svg.select("#axis--x" + chart_obj.id_label).call(chart_obj.xAxis)
  }

}
