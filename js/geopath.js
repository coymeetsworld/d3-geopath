$(document).ready(function() {
  
  var width=1500;
  var height=1200;

  var svg = d3.select("body").append("svg")
    .attr("id", "mapContainer")
    .attr("width", width)
    .attr("height", height);


  d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json', function(error, data) {
    if (error) throw error;
  
    console.log(data);
  });


});
