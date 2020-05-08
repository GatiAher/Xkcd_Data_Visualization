/////////////////////////
// GENERAL UPDATE CODE //
/////////////////////////

var sn_nums_store = []

// general update values when new point is picked
function generalPick(title, altText, imageUrl, sn) {
  d3.select("#inputPick")
    .property('value', parseInt(sn));
  d3.select("#xkcdImage")
    .attr("src", imageUrl)
    .attr("alt", title);
  document.getElementById("xkcdImageTitle")
    .textContent = title;
  document.getElementById("xkcdImageAltText")
    .textContent = altText;

  document.getElementById("xkcdBarChartPickedTitle")
    .textContent = title;
  // send picked sn_num to backend
  sendPicked(parseInt(sn))
  sendSelected(sn_nums_store)
}

function sendPicked(sn) {
  d3.json("/picked-data")
    .header("Content-Type", "application/json")
    .post(
        JSON.stringify({sn_num:sn}),
        redrawBarchartPicked);
}

function sendSelected(sn_nums) {
  sn_nums_store = sn_nums
  d3.json("/selected-data")
    .header("Content-Type", "application/json")
    .post(
        JSON.stringify({sn_nums:sn_nums}),
        redrawBarchartSelected);
}

function redrawBarchartPicked(err, chart_data) {
  drawBarchartPicked(chart_data)
}

function redrawBarchartSelected(err, result) {
  drawBarchartSelected2(result)
}
