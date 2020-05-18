/////////////////////////
// GENERAL UPDATE CODE //
/////////////////////////

var dataStore = {
  picked_sn:221,
  selected_sn:[12, 19, 113, 190, 202, 216, 221, 300, 369, 384, 458, 512, 539,
    602, 718, 773, 849, 899, 904, 944, 1047, 1053, 1129, 1155, 1179, 1189,
    1213, 1224, 1236, 1254, 1277, 1279, 1310, 1330, 1399, 1597, 1724, 1768,
    1789, 1804, 1935, 2006, 2016, 2028, 2034, 2059, 2137]
  };

function initializeValues(comic_data, feature_names) {
  // add features to feature distribution menu
  for (const idx in feature_names) {
    $('#select-featureDistribution').append($('<option>', {value:idx, text:feature_names[idx]}));
  }

  // draw scatterplot
  featureScatterplot.updateAndDraw(comic_data);

  // // initial state of feature selection menu
  // $("#select-featureDistribution").val(["3301", "3849"]);
  // $('#selected-featureDistribution').text("number (200), random (71)");
  // requestFeatureDistribution(["3301", "3849"]);

  // draw scatterplot
  scatterplot.updateAndDraw(comic_data);

  // initial coloring of selected dots
  scatterplot.scatter.selectAll("circle")
    .filter(function(d) { return dataStore.selected_sn.includes(d.sn); })
    .classed("dot-selected", true);

  // initial coloring of picked dot
  scatterplot.scatter.selectAll("circle")
    .filter(function(d) { return d.sn == dataStore.picked_sn })
    .classed("dot-picked", true);

  // initial state of pick elements
  generalPick("221: Random Number",
    "RFC 1149.5 specifies 4 as the standard IEEE-vetted random number.",
    "https://www.explainxkcd.com/wiki/images/f/fe/random_number.png", 221);

  // initial state of select elements
  generalSelect(dataStore.selected_sn);

  requestBarchartData(); // BUG: call again to fix incomplete draw barchart
}

// general update values when new point is picked
function generalPick(title, altText, imageUrl, sn) {
  scatterplot.form.property('value', parseInt(sn));
  $("#xkcdImage").attr("src", imageUrl).attr("alt", title);
  $("#xkcdImageTitle").text(title);
  $("#xkcdImageAltText").text(altText);
  // send picked sn_num to backend
  dataStore.picked_sn = parseInt(sn);
  requestBarchartData();
}

function generalSelect(sn_nums) {
  $("#checkbox-barchart-selected-label")
    .text("Selected (" + sn_nums.length + ")");
  dataStore.selected_sn = sn_nums;
  requestBarchartData()
}

function requestBarchartData() {
  d3.json("/barchart-data")
    .header("Content-Type", "application/json")
    .post(
        JSON.stringify(
          {picked_sn:dataStore.picked_sn,
          selected_sn:dataStore.selected_sn}
        ),
        updateBarchart);
}

function updateBarchart(err, data) {
  barchart.updateAndDraw(data);
}

function requestFeatureDistribution(feature_idx_list) {
  d3.json("/feature-data")
    .header("Content-Type", "application/json")
    .post(
        JSON.stringify(
          {feature_idx_list:feature_idx_list}
        ),
        updateFeatureDistribution);
}

function updateFeatureDistribution(err, data) {

  single_list = data[0].single.map(x=>+x);
  both_list = data[0].both.map(x=>+x);

  $("#overlapnum-featureDistribution")
    .text("Overlapped: " + both_list.length);

  // deselect previous
  featureScatterplot.scatter.selectAll("circle")
    .classed("dot-single-feature", false)
    .classed("dot-both-feature", false);

  // select new
  featureScatterplot.scatter.selectAll("circle")
    .filter(function(d) { return single_list.includes(d.sn); })
    .classed("dot-single-feature", true);

  featureScatterplot.scatter.selectAll("circle")
    .filter(function(d) { return both_list.includes(d.sn); })
    .classed("dot-both-feature", true);
}
