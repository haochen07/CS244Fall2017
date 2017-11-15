var request = require("request");

var url = "http://169.234.45.241:8888";

var ppgData = { "request": {"Red" : "red",
                         "IR": "ir",
                         "time": "time"}
                };

var motionData = { "request": {"X" : "1",
                         "Y": "2",
                         "Z": "3"}
                };


var ppgMotionData = { "request": {
                          "time": "0",
                          "Red" : "red",
                          "IR" : "IR",
                          "X" : "1",
                          "Y": "2",
                          "Z": "3"}
                };
                                
request({
  url: url + "/ppg_motion",
  method: "GET",
  json: ppgMotionData
  }, function(error, response, body) {
  console.log(body);
});
