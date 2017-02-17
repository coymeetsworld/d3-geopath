$(document).ready(function() {

	var width=window.innerWidth;
	var height=window.innerHeight;

	var svg = d3.select("svg");

	var zoom = d3.zoom()
							 .scaleExtent([1, 10])
							 .translateExtent([[0,0],[width, height]])
							 .on("zoom", zoomed);

	var ocean = svg.append('rect')
								 .attr('x', 0)
								 .attr('y', 0)
								 .attr('width', width)
								 .attr('height', height)
								 .attr('fill', '#266D98');

	var map = svg.append( "g" ).attr( "id", "map" )
							 .attr("transform", "translate(" + 0 + "," + 0 + ")");
										
	var projection = d3.geoMercator()
										 .scale(250)	
										 .translate([900,500]);
	var geoPath = d3.geoPath()
									.projection( projection );


	d3.json("https://dl.dropboxusercontent.com/u/26748984/web-project-resources/freecodecamp/D3-GeoPath/countries.json", function(error, data) {
		map.selectAll("path")
			 .data(data.features)
			 .enter()
			 .append("path")
			 .attr("d", geoPath);
		svg.call(zoom);
	});


	var meteorites = svg.append( "g" )
											.attr( "id", "meteorites" )
											.attr("transform", "translate(" + 0 + "," + 0 + ")");
													
	d3.json('https://dl.dropboxusercontent.com/u/26748984/web-project-resources/freecodecamp/D3-GeoPath/meteorite-strike-data.json', function(error, data) {

		if (error) throw error;

		var meteorSizes = data.features.reduce(function(prev, curr) {
																						if (curr.properties.mass) {	prev.push(+curr.properties.mass); }
																						return prev;
																					}, []);

		var meteorRange = d3.scalePow().range([3, 50]).domain(d3.extent(meteorSizes)).exponent(0.4);
    
		meteorites.selectAll("circle")
							.data(data.features)
							.enter().append("circle")
							.attr("cx", function(d) { return getCoordinates(projection, d.properties, 'long'); })
							.attr("cy", function(d) { return getCoordinates(projection, d.properties, 'lat'); })
							.attr("r", function(d) { return meteorRange(+d.properties.mass) })
							.attr("d", geoPath)
							.attr("class", function(d) { return getRandomColorClass(); })
							.sort(function(a,b) {
								return b.properties.mass-a.properties.mass; // To overlay smaller meteorites over larger ones.
							})
							.on("mouseover", function() {
								var meteoriteData = d3.select(this).datum().properties;
								var xPos = parseFloat(d3.select(this).attr("cx"));
								var yPos = parseFloat(d3.select(this).attr("cy"));
								var radius = parseFloat(d3.select(this).attr("r"));

								var xRect, yRect;	

								// To make sure the tooltip doesn't go out of the window.
								if (xPos+radius+250 > width) { xRect = xPos-radius-250;	}
								else { xRect = xPos+radius; }

								if (yPos+radius+175 > width) { yRect = yPos-radius-175;	}
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
										"<tspan x=" + (xRect+15) + " y=" + (yRect+30) + " class=\"tooltipInfo\">Name: " + meteoriteData.name + "</tspan>"
										+ "<tspan x=" + (xRect+15) + " y=" + (yRect+50) + " class=\"tooltipInfo\">Mass: " + meteoriteData.mass + "</tspan>"
										+ "<tspan x=" + (xRect+15) + " y=" + (yRect+70) + " class=\"tooltipInfo\">Nametype: " + meteoriteData.nametype + "</tspan>"
										+ "<tspan x=" + (xRect+15) + " y=" + (yRect+90) + " class=\"tooltipInfo\">Recclass: " + meteoriteData.recclass + "</tspan>"
										+ "<tspan x=" + (xRect+15) + " y=" + (yRect+110) + " class=\"tooltipInfo\">Reclat: " + meteoriteData.reclat + "</tspan>"
										+ "<tspan x=" + (xRect+15) + " y=" + (yRect+130) + " class=\"tooltipInfo\">Year: " + meteoriteData.year + "</tspan>"
										+ "<tspan x=" + (xRect+15) + " y=" + (yRect+150) + " class=\"tooltipInfo\">Fall: " + meteoriteData.fall + "</tspan>");
								})
								.on('mouseout', function(d) {
									svg.selectAll('.tip').remove();
								});

	});

	function zoomed() {
		var translate = "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ")";
		var scale = "scale(" + (d3.event.transform.k) + ")";
		map.attr("transform", translate + " " + scale);
		scale = "scale(" + (d3.event.transform.k) + ")";
		meteorites.attr("transform", translate + " " + scale);
	}
			
			
	function getRandomColorClass() {
		/* 10 colors to choose from. */ 
		var rand = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
		return 'gradient' + rand;
	}


	function getCoordinates(projection, geoObj, coordinate) {
		var point = projection([geoObj.reclong, geoObj.reclat]);
		if (coordinate === 'long') { return point[0]; }
		else if (coordinate === 'lat') { return point[1]; }
		return -1; //Shouldn't get here
	}
});
