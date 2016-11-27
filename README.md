# cdaviz - Generic CSV (and data) D3.js-based Dashboard Visualizer

## About this project ##

This is a client-server D3.js-based dashboard solution for visualizing data from CSV files, and in the future other data sources (SQL RDBMS, etc.). It's based on work I did and which I feel is useful to share with the community.

For me, this came from a need to do something like supply an input CSV file (whose fields can vary) and then specify/select a few parameters, click and then see a visualization of the data. Something like Microsoft Excel's charting options but web-based (for easier use and sharing) and better performing in the visualization aspect with large datasets (Excel was real slow to process the data and render the charts (for files 10MB-200MB) - on both physical machine and a virtual machine, perhaps my hardware was not high end enough - but that's hard to come by).

What I found at the time was:

* a bunch of visualization library solutions that you had to incorporate yourself. Some built on top of D3.js, some as alternatives to D3.js. The ones built on top of D3, often had their own APIs and tweaks one had to deal with. I didn't notice any ready made solution. Many seemed like client side solutions, you had to deploy your own server component to match it if you needed one.

* Several online services that gave you options to upload CSV or call their API to visualize data. But they seemed to have restrictions, and/or were not good with speed performance in rendering large datasets (e.g. 10-300 MB CSV). These services had paid commercial options, but we always start off with free right? ;-)

* non-web based solution like Python data plotting options. But they weren't as pretty as D3, and I still had to write scripts to do the processing and chart generation, nothing nicely premade. And they're not web-based.

And so finding things a bit lacking and hard to work with, I built my own solution with server component to take in uploaded CSVs and offer a simple management interface for them (select, download back, delete). And client side visualization using native d3.js.

At the moment, what is offered is a rough slightly dumbed down dashboard (simplified from code I've used for work). Much could be improved like:

* better UI - I'm not a UI/UX person, so my UIs are comparatively 1990s basic.
* better file management, user account management, and authentication/security for those - for enterprise and shared user usage
* performance enhancements to better deal with really large datasets, maybe caching, as it still takes a while to load
* saving visualized output so not need to rerender, when sharing the result with others, etc. e.g. export to SVG, PNG, PDF
* visualization of data from other sources or formats (generically though, e.g. JSON, SQL/RDBMS, REST APIs, various noSQL DBs, space/tab-delimited data)
* add (generic) support for other visualizations/plots/charts (x/y line/scatter plots, more histograms, pie charts, etc.) besides what we currently offer (timeseries, histogram, table views)
* improve existing visualization options (timeseries, histogram, table views) - giving them more options for visualization/rendering in terms of labeling, chart sizing, colors, fonts, line/bar sizing, etc.

But it's at least a proof of concept and starting solution to work with. What I envision is a pluggable visual dashboard framework, where we have generic visualization modules and you can add which ones you need and visualize against your own dataset (ideally/generically in CSV but could be in other formats).

## Requirements and Installation ##

1. Clone this repo
2. Run ```npm install``` from the cloned local repo
3. You will also want to read the README file under `dashboard/lib` as there are some 3rd party client side JS files to place there that are not bundled with the repo.
4. Run ```npm start``` to start up the server, then point your browser to http://localhost:8080 to get started. Run the server with ```node cdaviz.js -h``` for details on arguments to customize server startup.

The dashboard should be roughly intuitive and self explanatory to use. Or just use trial and error. Someone can write up a tutorial for it later on.

## Sample files for demo ##

The repo includes some sample data files for visual rendering demo (although you can find others online or use your own dataset). Below are some tips for the timeseries view (for what (custom) timestamp format to use/specify) and histogram (min, max bin values) to make it render correctly:

* bl.ocks.org-mbostock-3883245.csv - time format: "%d-%b-%y", histogram min 100, max 600, bin 10
* bl.ocks.org-mbostock-3884955.csv - time format: "%Y%m%d", histogram min 50, max 90, bin 10
* somewhat-big-dataset.csv - time format: milliseconds, or ISO8601 "%Y-%m-%dT%H:%M:%S.%LZ", histogram min 0, max 10, bin 10

For testing out the histogram view, be sure to set the min & max bin values appropriately

**NOTE:** I wish I could offer a large dataset example, but I don't really have one at the moment besides "somewhat-big-dataset.csv". But I've worked with datasets in range of 10MB-200MB with this dashboard solution. Datasets larger than 100-200MB, and we have problems serving the data server side and rendering client side.
