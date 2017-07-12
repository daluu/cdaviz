//based off
//http://bl.ocks.org/benvandyke/8459843
//and perhaps
//http://bl.ocks.org/mbostock/3883245
//http://bl.ocks.org/ZJONSSON/3918369

//Define general dimensions
var chartSizing = {'margins': {}, 'width': 0, 'height': 0};
chartSizing.margins = {top: 20, right: 80, bottom: 30, left: 50};
chartSizing.width = 960 - chartSizing.margins.left - chartSizing.margins.right;
chartSizing.height = 500 - chartSizing.margins.top - chartSizing.margins.bottom;

function renderGenericTrendplot(baseElementIdToRenderInside,dataset,xField,yField,settings){

  if(settings.width != null){
    chartSizing.width = settings.width - chartSizing.margins.left - chartSizing.margins.right;
  }

  if(settings.height != null){
    chartSizing.height = settings.height - chartSizing.margins.top - chartSizing.margins.bottom;
  }

  //preprocess the dataset before visualizing
  var pts = [];
  dataset.forEach(function(d) {
    //typecast to # if needed
    /*
    for(field in d){
      if(typeof d[field] !== 'number'){
        d[field] = +d[field];
      }
    }
    */
    if(typeof d[xField] !== 'number'){
      d[xField] = +d[xField];
    }
    if(typeof d[yField] !== 'number'){
      d[yField] = +d[yField];
    }
    pts.push([parseFloat(d[xField]), parseFloat(d[yField])]);
  });

  //sort data by x-axis in case they don't come pre-sorted
  dataset.sort(function(a,b) {
    return a[xField] - b[xField];
  });

  //do trend analysis
  var linReg = regression('linear', pts);
  var polyReg = regression('polynomial', pts, 2);
  var expoReg = regression('exponential', pts);
  var powReg = regression('power', pts);
  var logReg = regression('logarithmic', pts);

  var linRegEq = "Lin: y = " + linReg.equation[0].toFixed(4) + "x + " + linReg.equation[1].toFixed(2) + ", r2 = " + linReg.r2.toFixed(3);
  var polyRegEq = "Poly: y = " + polyReg.equation[2].toFixed(4) + "x^2 + " + polyReg.equation[1].toFixed(4) + "x + " + polyReg.equation[0].toFixed(2) + ", r2 = " + polyReg.r2.toFixed(3);
  var expoRegEq = "Exp: y = " + expoReg.equation[0].toFixed(4) + "e^(" + expoReg.equation[1].toFixed(4) + "x), r2 = " + expoReg.r2.toFixed(3);
  var powRegEq = "Pow: y = " + powReg.equation[0].toFixed(4) + "x^" + powReg.equation[1].toFixed(2) + ", r2 = " + powReg.r2.toFixed(3);
  var logRegEq = "Log: y = " + logReg.string + ", r2 = " + logReg.r2.toFixed(3);
  var allEqs = "Trends: " + linRegEq + "; " + polyRegEq + "; " + expoRegEq + "; " + powRegEq + "; " + logRegEq;

  //build visualization
  var color = d3.scale.category20();
  var coloredLines = ["linear", "polynomial", "exponential", "power", "logarithmic"];
  color.domain(coloredLines);
  var regressionLinesToPlot = color.domain().map(function(name) {
    return {
      name: name,
      values: function() {
        var extrapolatedPts = [];
        for(var i = 0; i < pts.length; i++){
          var val = pts[i][0];
          switch(name){
            case "polynomial":
              extrapolatedPts.push({x: val, y: polyReg.equation[2] * Math.pow(val,2) + polyReg.equation[1] * val + polyReg.equation[0]});
              break;
            case "exponential":
              extrapolatedPts.push({x: val, y: expoReg.equation[0] * Math.exp(val * expoReg.equation[1])}); //or use numbers.js per https://gist.github.com/zikes/4279121, var regression = numbers.statistic.exponentialRegression(pts);
              break;
            case "power":
              extrapolatedPts.push({x: val, y: powReg.equation[0] * Math.pow(val,powReg.equation[1])});
              break;
            case "logarithmic":
              extrapolatedPts.push({x: val, y: logReg.equation[0] + logReg.equation[1] * Math.log(val)});
              break;
            case "linear":
            default:
              extrapolatedPts.push({x: val, y: linReg.equation[0] * val + linReg.equation[1]});
          }
        }
        return extrapolatedPts;
      }()
    };
  });

  var x = d3.scale.linear()
          .domain([0, d3.max(dataset, function(d) { return d[xField]; })])
          .range([ 0, chartSizing.width ]);
    
  var y = d3.scale.linear()
    	    .domain([0, d3.max(dataset, function(d) { return d[yField]; })])
    	    .range([ chartSizing.height, 0 ]);

  var xAxis = d3.svg.axis().scale(x).orient("bottom");
  var yAxis = d3.svg.axis().scale(y).orient("left");
  yAxis.tickFormat(function(d){
    var reformat;
    if(d < 99.99){
      reformat = d3.format(".2g");
    }else{
      reformat = d3.format(".2s");
    }
    return reformat(d);
  });

  var svg = d3.select("#"+baseElementIdToRenderInside).append("svg")
      .attr("width", chartSizing.width + chartSizing.margins.left + chartSizing.margins.right)
      .attr("height", chartSizing.height + chartSizing.margins.top + chartSizing.margins.bottom)
      .append("g")
      .attr("transform", "translate(" + chartSizing.margins.left + "," + chartSizing.margins.top + ")")
      .style("font", "10px sans-serif");

  var g = svg.append("g")
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
      .text(function(d){
          return settings.yAxisLabel;
      });

  /*
  var maxYAxisWidth = 0;
  g.selectAll('text').each(function(){
    if (this.getBBox().width > maxYAxisWidth) maxYAxisWidth = this.getBBox().width;
  });
  g.attr("transform", "translate(" + (maxYAxisWidth + chartSizing.margins.left) + "," + chartSizing.margins.top + ")");
  */

  svg.append("g")
      .style("shape-rendering", "crispEdges")
      .style("fill", "none")
      .style("stroke", "#000")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + chartSizing.height + ")")
      .call(xAxis);
      /*
      .text(function(d){
          return settings.xAxisLabel;
      });*/

  var plotPts = svg.selectAll("scatter-dots")
      .data(pts)
      .enter().append("svg:circle")
          .attr("cx", function (d,i) { return x(d[0]); } )
          .attr("cy", function (d) { return y(d[1]); } )
          .attr("r", 8);

  var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(d.y); });
      
  var plotFields = svg.selectAll(".lines-to-plot")
      .data(regressionLinesToPlot)
      .enter().append("g")
      .attr("class", "lines-to-plot");

  plotFields.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .attr("data-legend", function(d) { return d.name})
      .style("stroke", function(d) { return color(d.name); })
      .style("stroke-width", "1.5px")
      .style("fill", "none");

  plotFields.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.x) + "," + y(d.value.y) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

  var legend = svg.append("g")
      .attr("class","legend")
      .attr("transform","translate(50,30)")
      .style("font-size","12px")
      .call(d3.legend);
  
  var regLineInfo = svg.append("g")
      .attr("class","legend")
      .attr("transform","translate(20,0)")
      .style("font-size","8px")
      .append("text")
      .text(function() { return allEqs; });
  
}
