class Chart {
  constructor(customId) {
    this.customId = customId;

    //////////////////////////////
    // SVG AND GRAPH DIMENSIONS //
    //////////////////////////////

    this.svgWidth = 450;
    this.svgHeight = 425;
    this.margin = { top: 15, right: 0, bottom: 15, left: 60 };
    this.width = this.svgWidth - this.margin.left - this.margin.right;
    this.height = this.svgHeight - this.margin.top - this.margin.bottom;

    this.svg = d3.select('#chart-'+this.customId)
      .append("div")
      // Container class to make it responsive.
      .classed("svg-container", true)
      .append("svg")
      // Responsive SVG needs these 2 attributes and no width and height attr.
      // .attr("preserveAspectRatio", "xMidYMid none")
      .attr("viewBox", "0 0 " + this.svgWidth + " " + this.svgHeight)
      // Class to make it responsive.
      .classed("svg-content-responsive", true);

    // this.svg.append("text")
    //   .style("text-anchor", "end")
    //   .attr("x", this.width)
    //   .attr("y", this.height - 8)
    //   .text("X Axis");
    //
    // this.svg.append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 6)
    //   .attr("dy", "1em")
    //   .style("text-anchor", "end")
    //   .text("Y Axis");
  }

  updateAndDraw(chartData) {
    console.log("updating data");
    this.draw();
  }

  draw() {
    console.log("drawing data");
  }
}
