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
  // send picked sn_num to backend
  sendPicked(parseInt(sn))
}

function sendPicked(sn) {
  d3.json("/picked-data")
    .header("Content-Type", "application/json")
    .post(
        JSON.stringify({sn_num:sn}),
        redrawBarCharts);
}

function sendSelected(sn_nums) {
  d3.json("/selected-data")
    .header("Content-Type", "application/json")
    .post(
        JSON.stringify({sn_nums:sn_nums}),
        placeholder);
}

function redrawBarCharts(err, chart_data) {
  drawBarchartPicked(chart_data)
  // drawBarchartSelected(chart_data)
}

// TODO: ensure data passed successfully
function placeholder(err, result) {
  drawBarchartSelected(result)
}

var picked_data_tfidf = null;
var selected_data_tfidf = null;

// TODO: initial state code -- start with drawn barchart and picked point
