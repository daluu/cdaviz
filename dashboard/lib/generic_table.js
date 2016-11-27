//based off...
//http://www.d3noob.org/2013/02/add-html-table-to-your-d3js-graph.html
//http://bl.ocks.org/d3noob/473f0cf66196a008cf99
//http://stackoverflow.com/questions/9268645/creating-a-table-linked-to-a-csv-file

var tableStyle = "font: 10px sans-serif;";

function renderGenericTable(baseElementIdToRenderInside,data,columns) {
    var table = d3.select("#"+baseElementIdToRenderInside).append("table").attr("border","1"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
            .text(function(column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .attr("style", tableStyle)
            .html(function(d) { return d.value; });

    return table;
}
