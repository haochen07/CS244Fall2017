const filter = require('./filter.js');
const logger = require('./logger.js');
const rest = require('./rest.js');
var express = require("express");
var ejs = require('ejs');
var path = require('path');


// calculate HR, RespR, SOP2 using local data
var features;
filter.extractFeatures(function(data) {
  features = data;
  logger.recordFeatures(features);
  console.log("Features recorded in file.");
});

// prepare local storage for PPG device data
var ppgOutputFile = "./data/ppgData.csv";
var ppGHeader = "IR,RED,time\n";
logger.write_to(ppgOutputFile, ppGHeader);

// prepare local storage for motion device data
var motionOutputFile = "./data/motionData.csv"
var motionHeader = "X,Y,Z\n";
logger.write_to(motionOutputFile, motionHeader);

// Configure & start server
var app = express();
app.engine('html', ejs.renderFile);
app.use('/views', express.static(path.join(__dirname, 'views')));

// render HR/Resp/SOP2 graph
app.get('/graph', function(request, response) {
  response.render("index.html", {
    time:         JSON.stringify(features.time),
    IR:           JSON.stringify(features.IR),
    RED:          JSON.stringify(features.RED),
    heart:        JSON.stringify(features.heartRate),
    respiration:  JSON.stringify(features.respirationRate),
    spo2:         JSON.stringify(features.spo2)
  });
  console.log("Web page rendered.");
});

app.get('/motion', function(request, response) {
  rest.handle("motion", request, response, motionOutputFile, 0);
});


app.get('/ppg', function(request, response) {
  rest.handle("ppg", request, response, ppgOutputFile, 0);
});

app.listen(8888);
