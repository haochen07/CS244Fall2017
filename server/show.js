const filter = require('./filter.js');
const logger = require('./logger.js');
var ejs = require('ejs');
var path = require('path');
var express = require("express");

// calculate HR, RespR, SOP2 using local data
var features;
// var inputfile = "./data/sample.csv";
var inputfile = "./data/sitting_all.csv"

// Configure & start server
var app = express();
app.engine('html', ejs.renderFile);
app.use('/views', express.static(path.join(__dirname, 'views')));

// render HR/Resp/SOP2 graph
app.get('/graph', function(req, res) {

  filter.extractFeatures(inputfile, function(data) {
    features = data;
    logger.recordFeatures(features);
    console.log("Features recorded in file.");
    
    res.render("index.html", {
      time:         JSON.stringify(features.time),
      IR:           JSON.stringify(features.IR),
      RED:          JSON.stringify(features.RED),
      heart:        JSON.stringify(features.heartRate),
      respiration:  JSON.stringify(features.respirationRate),
      spo2:         JSON.stringify(features.spo2)
    });
    console.log("Web page rendered.");
  });

});

app.listen(9999);
