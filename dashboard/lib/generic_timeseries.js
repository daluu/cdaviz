//based off
//http://bl.ocks.org/mbostock/3883245
//http://bl.ocks.org/ZJONSSON/3918369

//Define default/general dimensions
var chartSizing = {'margins': {}, 'width': 0, 'height': 0};
chartSizing.margins = {top: 20, right: 80, bottom: 30, left: 50};
chartSizing.width = 960 - chartSizing.margins.left - chartSizing.margins.right;
chartSizing.height = 500 - chartSizing.margins.top - chartSizing.margins.bottom;

function renderGenericTimeseries(baseElementIdToRenderInside,dataset,timestampField,dataFields,tsFormat,settings){

  if(settings.width != null){
    chartSizing.width = settings.width - chartSizing.margins.left - chartSizing.margins.right;
  }

  if(settings.height != null){
    chartSizing.height = settings.height - chartSizing.margins.top - chartSizing.margins.bottom;
  }

  //preprocess the dataset before visualizing
  var tsFormatToUse = "%Y-%m-%dT%H:%M:%S.%LZ";
  if(tsFormat != "seconds" && tsFormat != "ms" && tsFormat != ""){
    tsFormatToUse = tsFormat;
  }
  var parseDate = d3.time.format.utc(tsFormatToUse).parse;
  dataset.forEach(function(d) {
    //parse the timestamp as needed
    if(!(d[timestampField] instanceof Date)){
      switch(tsFormat){
      case "seconds":
        d[timestampField] = new Date(+d[timestampField]*1000);
        break;
      case "ms":
        d[timestampField] = new Date(+d[timestampField]);
        break;
      default:
        d[timestampField] = parseDate(d[timestampField]);
      }
    }
    //typecast to # if needed
    for(var i = 0; i < dataFields.length; i++){
      if(typeof d[dataFields[i]] !== 'number'){
          d[dataFields[i]] = +d[dataFields[i]];
      }
    }
  });

  //sort data by date/time in case they don't come pre-sorted
  dataset.sort(function(a,b) {
    return a[timestampField] - b[timestampField];
  });

  var color = d3.scale.category20();
  color.domain(dataFields);

  var x = d3.time.scale().range([0, chartSizing.width]);
  var y = d3.scale.linear().range([chartSizing.height, 0]);
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

  var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.dataField); });

  var svg = d3.select("#"+baseElementIdToRenderInside).append("svg")
      .attr("width", chartSizing.width + chartSizing.margins.left + chartSizing.margins.right)
      .attr("height", chartSizing.height + chartSizing.margins.top + chartSizing.margins.bottom)
      .append("g")
      .attr("transform", "translate(" + chartSizing.margins.left + "," + chartSizing.margins.top + ")")
      .style("font", "10px sans-serif");

  var fieldsToPlot = color.domain().map(function(name) {
    return {
      name: name,
      values: dataset.map(function(d) {
        return {date: d[timestampField], dataField: parseFloat(d[name].toFixed(2))};
      })
    };
  });

  x.domain(d3.extent(dataset, function(d) { return d[timestampField]; }));

  y.domain([
    d3.min(fieldsToPlot, function(c) { return d3.min(c.values, function(v) { return v.dataField; }); }),
    d3.max(fieldsToPlot, function(c) { return d3.max(c.values, function(v) { return v.dataField; }); })
  ]);

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

  var plotFields = svg.selectAll(".fields-to-plot")
      .data(fieldsToPlot)
      .enter().append("g")
      .attr("class", "fields-to-plot");

  plotFields.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .attr("data-legend", function(d) { return d.name})
      .style("stroke", function(d) { return color(d.name); })
      .style("stroke-width", "1.5px")
      .style("fill", "none");

  plotFields.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.dataField) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

  legend = svg.append("g")
      .attr("class","legend")
      .attr("transform","translate(50,30)")
      .style("font-size","12px")
      .call(d3.legend);
}
