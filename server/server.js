const logger = require('./logger.js');
const rest = require('./rest.js');
var express = require("express");

var motionOutputFile = logger.prepareStorageFor("motion");
var ppgOutputFile = logger.prepareStorageFor("ppg");
var ppg_motionOutputFile = logger.prepareStorageFor("ppg_motion");

var app = express();

app.post('/motion', function(req, res) {
  rest.handle("motion", req, res, motionOutputFile, 0);
});

app.post('/ppg', function(req, res) {
  rest.handle("ppg", req, res, ppgOutputFile, 0);
});

app.post('/ppg_motion', function(req, res) {
  rest.handle("ppg_motion", req, res, ppg_motionOutputFile, 0);
});

app.listen(8888);
