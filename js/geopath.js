$(document).ready(function() {
  
  var margin = {top: 50, right: 100, bottom: 50, left: 100}
  var width=1600;
  var height=1200;

  var svg = d3.select("body").append("svg")
    .attr("id", "mapContainer")
    .attr("width", width)
    .attr("height", height);
    
  var x = d3.scaleLinear().range([0, width-margin.left-margin.right]).domain([-180, 180]);
  var y = d3.scaleLinear().range([height-margin.top-margin.bottom, 0]).domain([-90, 90]);
   
  function getCoordinates(geoObj, coordinate) {
    
    if (!geoObj) { return 0; }
    
    if (coordinate === 'long') { return geoObj.coordinates[0]; }
    else if (coordinate === 'lat') { return geoObj.coordinates[1]; }
    
    return -1;
    
  }
  
  d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json', function(error, data) {
    if (error) throw error;
  
    console.log(data.features);
    
    var meteorSizes = 
      data.features.reduce(function(prev, curr) {
                            if (curr.properties.mass) {
                              prev.push(+curr.properties.mass);
                            }
                            return prev;
                           }, []);
    console.log(meteorSizes);
    console.log("Extent:" );
    console.log(d3.extent(meteorSizes));

    var meteorRange = d3.scalePow().range([2, 100]).domain(d3.extent(meteorSizes)).exponent(0.3);
    
    console.log(meteorRange(0.15));
    console.log(meteorRange(23000000));
    
    svg.selectAll("circle")
       .data(data.features)
       .enter().append("circle")
       .attr("cx", function(d) { return x(getCoordinates(d.geometry, 'long')); })
       .attr("cy", function(d) { return y(getCoordinates(d.geometry, 'lat')); })        
       .attr("r", function(d) { return meteorRange(+d.properties.mass) });

    /*{
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          6.08333,
          50.775
        ]
      },
      "properties": {
        "mass": "21",
        "name": "Aachen",
        "reclong": "6.083330",
        "geolocation_address": null,
        "geolocation_zip": null,
        "year": "1880-01-01T00:00:00.000",
        "geolocation_state": null,
        "fall": "Fell",
        "id": "1",
        "recclass": "L5",
        "reclat": "50.775000",
        "geolocation_city": null,
        "nametype": "Valid"
      }
    }*/
    
    
  });


});
