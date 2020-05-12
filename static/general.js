/////////////////////////
// GENERAL UPDATE CODE //
/////////////////////////

var sn_nums_store = [1, 2, 3];

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

  // CHANGED: testing
  sendRequest(parseInt(sn), sn_nums_store);
}

// CHANGED: testing
function sendRequest(sn, sn_nums) {
  sn_nums_store = sn_nums;
  d3.json("/data")
    .header("Content-Type", "application/json")
    .post(
        JSON.stringify({sn_picked:sn, sn_selected:sn_nums}),
        testing);
}

function testing(err, data) {
  console.log("TEST: ", data);
  barchart_test.draw2(data);
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
  barchart_picked.draw(chart_data);
}

function redrawBarchartSelected(err, chart_data) {
  barchart_selected.draw(chart_data);
}
