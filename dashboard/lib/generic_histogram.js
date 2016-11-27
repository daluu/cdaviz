//based off http://bl.ocks.org/jltran/bcd2a30fd9c08f8b9f87

//Define general dimensions
var histogramSizing = {'margins': {}, 'width': 0, 'height': 0};
histogramSizing.margins = {top: 50, right: 50, bottom: 50, left: 50};
histogramSizing.width = 960 - histogramSizing.margins.left - histogramSizing.margins.right;
histogramSizing.height = 500 - histogramSizing.margins.top - histogramSizing.margins.bottom;

function renderGenericHistogram(baseElementIdToRenderInside,dataset,binDomain,binSize){

  //preprocess the dataset before visualizing
  dataset.forEach(function(d) {
    //typecast to # if needed
    if(typeof d !== 'number'){
        d = +d;
    }
  });

  var x = d3.scale.linear().domain([binDomain.min, binDomain.max]).range([0, histogramSizing.width]);

  var n = dataset.length;
  var data = d3.layout.histogram().bins(x.ticks(binSize))(dataset);

  //Calculate cdf
  var jstat = this.jStat(dataset);
  for(var i = 0; i < data.length; i++){
    data[i]['cum'] = jstat.normal(jstat.mean(), jstat.stdev()).cdf(data[i].x);
  }

  //Axes and scales
  var yhist = d3.scale.linear()
                  .domain([0, d3.max(data, function(d) { return d.y; })])
                  .range([histogramSizing.height, 0]);

  var ycum = d3.scale.linear().domain([0, 1]).range([histogramSizing.height, 0]);

  var xAxis = d3.svg.axis().scale(x).orient('bottom');
  var yAxis = d3.svg.axis().scale(yhist).orient('left');
  var yAxis2 = d3.svg.axis().scale(ycum).orient('right');

  //Draw svg
  var svg = d3.select("#"+baseElementIdToRenderInside).append("svg")
              .attr("width", histogramSizing.width + histogramSizing.margins.left + histogramSizing.margins.right)
              .attr("height", histogramSizing.height + histogramSizing.margins.top + histogramSizing.margins.bottom)
              .append("g")
              .attr("transform", "translate(" + histogramSizing.margins.left + "," + histogramSizing.margins.top + ")")
              .style("font", "10px sans-serif");

  //Draw histogram
  var bar = svg.selectAll(".bar")
                .data(data)
                .enter().append("g")
                .attr("class", "bar")
                .attr("transform", function(d) { return "translate(" + x(d.x) + "," + yhist(d.y) + ")"; });

  bar.append("rect")
      .style("fill", "steelblue")
      .style("shape-rendering", "crispEdges")
      .attr("x", 1)
      .attr("width", histogramSizing.width/binSize/1.3)
      .attr("height", function(d) { return histogramSizing.height - yhist(d.y); });


  //Draw CDF line
  var guide = d3.svg.line()
                .x(function(d){ return x(d.x) })
                .y(function(d){ return ycum(d.cum) })
                .interpolate('basis');

  var line = svg.append('path')
                .datum(data)
                .attr('d', guide)
                .attr('class', 'line')
                .style("fill", "none")
                .style("stroke", "purple")
                .style("stroke-width", "1.5px");


  //Draw axes
  svg.append("g")
      .style("shape-rendering", "crispEdges")
      .style("fill", "none")
      .style("stroke", "#000")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + histogramSizing.height + ")")
      .call(xAxis);

  svg.append("g")
      .style("shape-rendering", "crispEdges")
      .style("fill", "none")
      .style("stroke", "#000")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Count (Histogram)");

  svg.append("g")
      .style("shape-rendering", "crispEdges")
      .style("fill", "none")
      .style("stroke", "#000")
      .attr("class", "y axis")
      .attr("transform", "translate(" + [histogramSizing.width, 0] + ")")
      .call(yAxis2)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 4)
      .attr("dy", "-.71em")
      .style("text-anchor", "end")
      .text("CDF");
}
