const filter = require('./filter.js');
const logger = require('./logger.js');
var express = require("express");
var ejs = require('ejs');
var path = require('path');

var features;
filter.extractFeatures(function(data) {
  features = data;
  logger.recordFeatures(features);
  console.log("Features recorded in file.");
});

// Configure & start server
var app = express();
app.engine('html', ejs.renderFile);
app.use('/views', express.static(path.join(__dirname, 'views')));

app.get('/', function(request, response) {
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

app.listen(8888);
