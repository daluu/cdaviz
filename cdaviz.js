#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var os = require('os');
var dns = require('dns');

//express.js related stuff for web/API server
var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');

var argv = require('yargs')
    .usage('Usage: $0 [options]')
    .example('$0 -p 8080', 'start server listening on port 8080')
    .describe('v', 'verbose/debugging output')
    .default('v', false)
    .alias('v', 'verbose')
    .describe('a', 'hostname or IP address to listen on')
    .nargs('a', 1)
    .default('a', 'localhost')
    .alias('a', 'address')
    .describe('p', 'specify port for server to listen on')
    .nargs('p', 1)
    .default('p', 8080)
    .alias('p', 'port')
    .help('h')
    .describe('h', 'display help/usage info')
    .alias('h', 'help')
    .argv;

var app = express();
app.use(bodyParser.json()); // for parsing application/json

//app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//serve client side dashboard pages that make AJAX calls to this server
app.use('/dashboard', express.static(__dirname + '/dashboard'));

//homepage & other files
app.use(serveStatic('dashboard', {'index': ['index.html', 'index.htm', 'default.html', 'default.htm'], 'dotfiles': 'ignore'}));
app.get('/', function (req, res) {
    res.redirect('/dashboard');
});

//expose uploaded files for download
app.use('/downloads', express.static(__dirname + '/public/uploads'));

//### start dashboard public APIs & server methods that generate HTML web content dynamically
var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname + '_uploaded-at_' + Date.now() + '.csv');
    }
});

/*
function fileFilterFnc (req, file, cb) {
    //if file ends in ".csv", & has commas in the content?
    cb(null, true);
    //else
    cb(null, false);
}
var upload = multer({ storage: storage, fileFilter: fileFilterFnc });
*/
var upload = multer({ storage: storage });

app.get('/api/csv', function (req, res) {
    var fs = require('fs');
    var csvFiles = [];
    fs.readdir('public/uploads/', function(err, items) {
        for(var i = 0; i < items.length; i++) {
          csvFiles.push({'filename': items[i]});
          //if(argv.verbose) console.log(items[i]);
        }
      res.send(JSON.stringify(csvFiles));
    });
});

app.post('/api/csv', upload.single('csvfile'), function (req, res) {
    // req.file is the `csvfile` file
    // req.body will hold the text fields, if there were any
    //var result = {'uploadedFile': req.file.filename};
  	//res.send(JSON.stringify(result));

    /* we do a redirect to force browser client to "refresh" the dashboard
     * upon upload completion to see the new CSV file in the list for selection
     * since we're doing a form POST and not an AJAX call here
     */
    res.redirect('/dashboard/index.htm');
});

app.get('/api/csv/:filename', function (req, res) {
    var fs = require('fs');
    ///* works only for small files up to 100-200 MB
    try{
      var csvData = fs.readFileSync("public/uploads/"+req.params.filename, 'utf8');
      res.send(csvData);
    }catch(err){
      //TODO - log file size for reference... 
      console.log("Problem reading/sending CSV, might be too large filesize?, %s\n",err.message);
      res.send(''); //let the client handle empty data when failed to parse large CSV
    }
    //*/
    //for large files ~ 300+ MB, use these methods?
    //see http://stackoverflow.com/questions/40166844/filesize-limit-in-reading-files-with-node-js-and-serving-output-as-http-response
    /*
    //var stats = fs.statSync(filepath);
    //var fileSizeInBytes = stats["size"];
    //res.setHeader('Content-Length', fileSizeInBytes);
    //res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    const readable = fs.createReadStream("public/uploads/" + req.params.filename);
    readable.on('data', function(chunk){
      res.write(chunk);
    });
    readable.on('end', function(){
      res.end();
    });
    */
    /*
    var filepath = "public/uploads/"+req.params.filename;
    var stats = fs.statSync(filepath);
    var fileSizeInBytes = stats["size"];
    res.setHeader('Content-Length', fileSizeInBytes);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    var stream = fs.createReadStream(filepath);
    stream.pipe(res);
    */
});

app.delete('/api/csv/:filename', function (req, res) {
    var fs = require('fs');
    fs.unlinkSync("public/uploads/"+req.params.filename);
    res.send("[]");
    /* up to the browser client / dashboard to do the refresh to show
     * updated list of CSV files after deletion
     */
});  
//### end APIs

//finally server startup & shutdown procedures
process.on('SIGINT', function() {
    console.log("Attempting graceful shutdown...");
    process.exit();
});

//get app & versioning info
var appInfo = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
console.log("\n%s v%s dashboard", appInfo.name, appInfo.version);

app.listen(argv.port, argv.address, function () {
    console.log("\nListening by default/provided IP/hostname at: http://%s:%s\n", argv.address, argv.port);
});

if(argv.address != "0.0.0.0"){
    try{
	if(typeof os.hostname() !== 'undefined' && argv.address != os.hostname()){
	    dns.lookup(os.hostname(), function(err,address,family){
		if(address != argv.address){
		    app.listen(argv.port, address, function(){
			console.log("\nListening by automatic hostname lookup & it's matching IP at: http://%s:%s & http://%s:%s\n",os.hostname(),argv.port,address,argv.port);
		    });
		}
	    });
	}
    }catch(err){
        //no need to log anything here?
        //console.log(err);
    }
}
