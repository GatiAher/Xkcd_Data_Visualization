/////////////////////////
// GENERAL UPDATE CODE //
/////////////////////////

// general update values when new point is picked
function generalPick(title, imageUrl, sn) {
  d3.select("#xkcdImage")
    .attr("src", imageUrl)
    .attr("alt", title);
  document.getElementById("xkcdImageTitle")
    .textContent = title;
  d3.select("#inputPick")
    .attr('value', sn);
  // send picked index_num to backend
  let index_num = sn-1;
  d3.json("/picked-data")
    .header("Content-Type", "application/json")
    .post(
        JSON.stringify({index_num:index_num}),
        drawBarChartPicked);
}

// TODO: initial state code -- start with drawn barchart and picked point
