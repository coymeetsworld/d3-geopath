$(document).ready(function() {
  
  var width=1500;
  var height=1200;

  var svg = d3.select("body").append("svg")
    .attr("id", "mapContainer")
    .attr("width", width)
    .attr("height", height);
    
  var x = d3.scaleLinear().range([0, width]).domain([-180, 180]);
  var y = d3.scaleLinear().range([height, 0]).domain([-90, 90]);
   
  function getCoordinates(geoObj, coordinate) {
    
    if (!geoObj) { return 0; }
    
    if (coordinate === 'long') { return geoObj.coordinates[0]; }
    else if (coordinate === 'lat') { return geoObj.coordinates[1]; }
    
    return -1;
    
  }
  
  d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json', function(error, data) {
    if (error) throw error;
  
    console.log(data.features);
    
    svg.selectAll("circle")
       .data(data.features)
       .enter().append("circle")
       .attr("cx", function(d) { return x(getCoordinates(d.geometry, 'long')); })
       .attr("cy", function(d) { return y(getCoordinates(d.geometry, 'lat')); })        
       .attr("r", 10);
      
  });


});
