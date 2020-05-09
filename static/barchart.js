class Barchart {
  constructor(div, id_label, alpha, beta) {
    this.div = div;
    this.id_label = id_label;
    this.alpha = alpha;
    this.beta = beta;

    //////////////////////////////
    // SVG AND GRAPH DIMENSIONS //
    //////////////////////////////

    this.svgWidth = 900;
    this.svgHeight = 850;
    this.margin = { top: 15, right: 25, bottom: 15, left: 60 };
    this.width = this.svgWidth - this.margin.left - this.margin.right;
    this.height = this.svgHeight - this.margin.top - this.margin.bottom;

    this.svg = d3.select(this.div)
      .append("div")
      // Container class to make it responsive.
      .classed("svg-container", true)
      .append("svg")
      // Responsive SVG needs these 2 attributes and no width and height attr.
      // .attr("preserveAspectRatio", "xMidYMid none")
      .attr("viewBox", "0 0 " + this.svgWidth + " " + this.svgHeight)
      // Class to make it responsive.
      .classed("svg-content-responsive", true);

    //////////
    // AXES //
    //////////

    this.x = d3.scaleLinear()
      .range([0, this.width]);

    this.y = d3.scaleBand()
      .rangeRound([this.height, 0])
      .padding(0.1);

    this.xAxis = d3.axisBottom(this.x).ticks(10);
    this.yAxis = d3.axisLeft(this.y).ticks(0);

    this.svg.append("g")
      .attr("class", "x axis")
      .attr('id', "axis--x" + this.id_label)
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis);

    this.svg.append("text")
      .style("text-anchor", "end")
      .attr("x", this.width)
      .attr("y", this.height - 8)
      .text("X Axis");

    this.svg.append("g")
      .attr("class", "y_axis")
      .attr('id', "axis--y" + this.id_label)
      // offset to right so ticks are not covered
      .attr("transform", "translate(30,0)")
      .call(this.yAxis)

    this.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .text("Y Axis");
  }
}

var barchart_selected = new Barchart("#barchartSelectedDiv", "_barchart_selected", "selected", "picked");
var barchart_picked = new Barchart("#barchartPickedDiv", "_barchart_picked", "picked", "selected");


///////////////////////////
// DATA DEPENDANT UPDATE //
///////////////////////////


var drawPyramid = function(chart_data, chart_obj) {

  let alpha = chart_obj.alpha;
  let beta = chart_obj.beta;

  let data = []
  for(let i=0; i<5; i++) {
    let arr = chart_data[0][i]
    data.push({"name":arr.name, [alpha]:arr.value[0], [beta]:arr.value[1]})
  }

  chart_obj.x.domain([0, d3.max(data, function (d) { return d[alpha] + d[beta]; })]);
  chart_obj.y.domain(data.map(function (d) {return d.name; }));

  chart_obj.svg.selectAll(".bar_" + alpha)
    .remove()
    .exit()
    .data(data)
    .enter().append("rect")
    .attr("class", "bar_" + alpha)
    .attr("y", function (d) { return chart_obj.y(d.name); })
    .attr("height", chart_obj.y.bandwidth())
    .attr("x", 50)
    .attr("width", function (d) { return chart_obj.x(d[alpha]); });

  chart_obj.svg.selectAll(".bar_" + beta)
    .remove()
    .exit()
    .data(data)
    .enter().append("rect")
    .attr("class", "bar_" + beta)
    .attr("y", function (d) { return chart_obj.y(d.name); })
    .attr("height", chart_obj.y.bandwidth())
    .attr("x", function (d) { return 50 + chart_obj.x(d[alpha]); })
    .attr("width", function (d) { return chart_obj.x(d[beta]); });

  // SAVE
  // add value label to end of each bar
  chart_obj.svg.selectAll(".label")
    .remove()
    .exit()
    .data(data)
    .enter()
    .append("text")
    .attr("class","label")
    .text(function (d) { return d.name; })
    //y position of the label is halfway down the bar
    .attr("y", function (d) { return chart_obj.y(d.name) + chart_obj.y.bandwidth() / 2 + 4; })
    //x position is at end of bar - boundary box of text
    .attr("x", function (d) {
      return chart_obj.x(d[alpha]) + chart_obj.x(d[beta]) - this.getBBox().width;
    });

  chart_obj.svg.select("#axis--y" + chart_obj.id_label).call(chart_obj.yAxis)
  chart_obj.svg.select("#axis--x" + chart_obj.id_label).call(chart_obj.xAxis)
}
