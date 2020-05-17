class Scatterplot extends Chart {
  constructor(customId,
              selectOnBrushFlag=true,
              pickOnClickFlag=true,
              pickOnFormFlag=true,
              selectOnSelectMenuFlag=false) {
    super(customId);

    this.selectOnBrushFlag = selectOnBrushFlag;
    this.pickOnClickFlag = pickOnClickFlag;
    this.pickOnFormFlag = pickOnFormFlag;
    this.selectOnSelectMenuFlag = selectOnSelectMenuFlag;

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
    document.getElementById("chart-"+this.customId)
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

            if (this.selectOnBrushFlag) {
              // color selection, do before zoom changes range of chart
              this.scatter.selectAll("circle").classed("dot-selected", (d) => {
                return isBrushed(s, this.x(d.x), this.y(d.y))
              });

              // get list of sn of selected comics, selection logic
              let brushSelection = [];
              this.scatter.selectAll(".dot-selected")
                .each( (d) => {
                  brushSelection.push(d.sn);
                });
              generalSelect(brushSelection);
            }

            // adjust axes to selected data
            this.x.domain([ this.x.invert(s[0][0]), this.x.invert(s[1][0]) ]);
            this.y.domain([ this.y.invert(s[1][1]), this.y.invert(s[0][1]) ]);
            this.scatter.select(".brush").call(this.brush.move, null);
        }
        // zoom
        let tr = this.scatter.transition().duration(750);
        this.svg.select("#axis--x-" + this.customId).transition(tr).call(this.xAxis);
        this.svg.select("#axis--y-" + this.customId).transition(tr).call(this.yAxis);

        this.scatter.selectAll("circle").transition(tr)
          .attr("cx", (d) => { return this.x(d.x); })
          .attr("cy", (d) => { return this.y(d.y); });
      });

    this.idleTimeout = null;
    this.idleDelay = 350;

    // on mouseover on scatter's dots, display comic title name
    this.tooltip = d3.select("#chart-" + this.customId)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    if (this.pickOnFormFlag) {
      // attach listener
      this.form = d3.select("#form-"+ this.customId +"-picked")
        .on("change", (d, i, nodes) => {
          let inputData = d3.select(nodes[i]).property('value');
          // clear previously picked point
          this.scatter.select(".dot-picked").classed("dot-picked", false);
          // pick new point
          let pickedPoint = d3.selectAll("circle")
            .filter((d) => { return d.sn == inputData })
            .classed("dot-picked", true)
            .datum();
          // update dependant values
          generalPick(pickedPoint.title, pickedPoint.altText, pickedPoint.imageUrl, inputData)
        });
    }

    if (this.selectOnSelectMenuFlag) {
      d3.select('#select-featureDistribution')
        .on("change", (d, i, nodes) => {

          let text = Array.from(nodes[i].querySelectorAll("option:checked"), e=>e.text);
          document.getElementById('selected-featureDistribution')
            .textContent = text.join(" ");

          let values = Array.from(nodes[i].querySelectorAll("option:checked"), e=>e.value);
          requestFeatureDistribution(values);
        });
    }

  }

  updateAndDraw(chartData) {
    this.data = chartData;
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
    let dots = this.scatter.selectAll(".dot-basic")
      .data(this.data)
      .enter().append("circle")
      .attr("class", "dot-basic")
      .attr("r", 4)
      .attr("cx", (d) => { return this.x(d.x); })
      .attr("cy", (d) => { return this.y(d.y); })
      .attr('sn', (d) => { return d.sn })
      .on("mouseover", (d, i, nodes) => {
        d3.select(nodes[i]).classed("dot-hovered", true);
        this.tooltip.transition().duration(200).style("opacity", .9);
        this.tooltip.html(d.title)
          .style("left", d3.mouse(nodes[i])[0]+"px")
          .style("top", d3.mouse(nodes[i])[1]+"px")
      })
      .on("mouseleave", (d, i, nodes) => {
        d3.select(nodes[i]).classed("dot-hovered", false);
        this.tooltip.transition().duration(500).style("opacity", 0)
      });

      if (this.pickOnClickFlag) {
        dots.on("click", (d, i, nodes) => {
          // clear previously picked point
          d3.selectAll(".dot-picked").classed("dot-picked", false);
          // pick new point
          d3.select(nodes[i])
            .classed("dot-picked", true);
          // update dependant values
          generalPick(d.title, d.altText, d.imageUrl, d.sn)
        });
      }
  }
}


// helper function for brushing
function isBrushed(brushCoords, cx, cy) {
   let x0 = brushCoords[0][0],
       x1 = brushCoords[1][0],
       y0 = brushCoords[0][1],
       y1 = brushCoords[1][1];
  // This return TRUE or FALSE depending on if the points is in the selected area
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
}

// helper funtion for populating select menu
function addOptionToSelect(sel, txt, val) {
    var opt = document.createElement('option');
    opt.appendChild( document.createTextNode(txt) );

    if ( typeof val === 'string' ) {
        opt.value = val;
    }
    sel.appendChild(opt);
}
