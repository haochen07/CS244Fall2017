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

// prepare local storage for ESP device data
var filepath = "./data/ppgDataFromDevice.csv";
var header = "IR,RED,time\n";
logger.write_to(filepath, header);

// Configure & start server
var app = express();
app.engine('html', ejs.renderFile);
app.use('/views', express.static(path.join(__dirname, 'views')));

// render HR/Resp/SOP2 graph
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

app.get('/rest', function(request, response) {
  rest.stringifyReqData(request, 0, requestBody);

  rest.jsonParse(requestBody, 0, ppg);

  var record = logger.makeRecord([ppg.IR, ppg.RED, ppg.time]);

  logger.append_to(filepath, record)

  rest.httpResponse(response, 0);
});

app.listen(8888);
