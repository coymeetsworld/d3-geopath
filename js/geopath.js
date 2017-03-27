
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const zoomed = () => {
  let translate = "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ")";
  let scale = "scale(" + (d3.event.transform.k) + ")";
  map.attr("transform", translate + " " + scale);
  scale = "scale(" + (d3.event.transform.k) + ")";
  meteorites.attr("transform", translate + " " + scale);
}

const getRandomColorClass = () => {
  /* 10 colors to choose from. */ 
  let rand = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
  return "gradient" + rand;
}

const getCoordinates = (projection, geoObj, coordinate) => {
  let point = projection([geoObj.reclong, geoObj.reclat]);
  if (coordinate === 'long') { return point[0]; }
  else if (coordinate === 'lat') { return point[1]; }
  return -1; //Shouldn't get here
}

let svg = d3.select("svg");

let zoom = d3.zoom()
             .scaleExtent([1, 10])
             .translateExtent([[0,0],[WIDTH, HEIGHT]])
             .on("zoom", zoomed);

const OCEAN = svg.append('rect')
                 .attr('x', 0)
                 .attr('y', 0)
                 .attr('width', WIDTH)
                 .attr('height', HEIGHT)
                 .attr('fill', '#266D98');

let map = svg.append( "g" )
             .attr( "id", "map" )
             .attr("transform", "translate(0,0)");

let projection = d3.geoMercator()
                   .scale(250)  
                   .translate([900,500]);
let geoPath = d3.geoPath()
                .projection( projection );

d3.json("https://coymeetsworld.github.io/d3-geopath/js/countries.json", (error, data) => {
  map.selectAll("path")
     .data(data.features)
     .enter()
     .append("path")
     .attr("d", geoPath);
  svg.call(zoom);
});

let meteorites = svg.append( "g" )
                    .attr( "id", "meteorites" )
                    .attr("transform", "translate(0,0)");

//d3.json("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json", function(error, data) {
d3.json("https://coymeetsworld.github.io/d3-geopath/js/meteorite-strike-data.json", (error, data) => {

  if (error) throw error;

  let meteorSizes = data.features.reduce((prev, curr) => {
                                          if (curr.properties.mass) {  prev.push(+curr.properties.mass); }
                                          return prev;
                                         }, []);

  let meteorRange = d3.scalePow()
                      .range([3, 50])
                      .domain(d3.extent(meteorSizes))
                      .exponent(0.4);
    
  meteorites.selectAll("circle")
            .data(data.features)
            .enter().append("circle")
            .attr("cx", d => getCoordinates(projection, d.properties, 'long'))
            .attr("cy", d => getCoordinates(projection, d.properties, 'lat'))
            .attr("r", d => meteorRange(+d.properties.mass))
            .attr("d", geoPath)
            .attr("class", d => getRandomColorClass())
            .sort((a,b) => b.properties.mass-a.properties.mass)
            // To overlay smaller meteorites over larger ones.
            .on("mouseover", function() {
              let meteoriteData = d3.select(this).datum().properties;
              let xPos = parseFloat(d3.select(this).attr("cx"));
              let yPos = parseFloat(d3.select(this).attr("cy"));
              let radius = parseFloat(d3.select(this).attr("r"));

              let xRect, yRect;

              // To make sure the tooltip doesn't go out of the window.
              if (xPos+radius+250 > WIDTH) { xRect = xPos-radius-250;  }
              else { xRect = xPos+radius; }

              if (yPos+radius+175 > WIDTH) { yRect = yPos-radius-175;  }
              else { yRect = yPos+radius; }

              svg.append('rect')
                 .attr('class', 'tip')
                 .attr('x', xRect)
                 .attr('y', yRect)
                 .attr('width', 250)
                 .attr('height', 175);

              svg.append('text')
                 .attr('class', 'tip')
                 .html(
                   `<tspan x=${xRect+15} y=${yRect+30} class="tooltipInfo">Name: ${meteoriteData.name}</tspan>`
                   + `<tspan x=${xRect+15} y=${yRect+50} class="tooltipInfo">Mass: ${meteoriteData.mass}</tspan>`
                   + `<tspan x=${xRect+15} y=${yRect+70} class="tooltipInfo">Nametype: ${meteoriteData.nametype}</tspan>`
                   + `<tspan x=${xRect+15} y=${yRect+90} class="tooltipInfo">Recclass: ${meteoriteData.recclass}</tspan>`
                   + `<tspan x=${xRect+15} y=${yRect+110} class="tooltipInfo">Reclat: ${meteoriteData.recclat}</tspan>`
                   + `<tspan x=${xRect+15} y=${yRect+130} class="tooltipInfo">Year: ${meteoriteData.year}</tspan>`
                   + `<tspan x=${xRect+15} y=${yRect+150} class="tooltipInfo">Fall: ${meteoriteData.fall}</tspan>`);
              })
              .on('mouseout', d => svg.selectAll('.tip').remove());

});
