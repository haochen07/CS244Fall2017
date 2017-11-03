var request = require("request");

var url = "http://128.195.66.253:8888";

var ppgData = { "request": {"Red" : "red",
                         "IR": "ir",
                         "time": "time"}
                };

var motionData = { "request": {"X" : "1",
                         "Y": "2",
                         "Z": "3"}
                };

request({
  url: url + "/motion",
  method: "GET",
  json: motionData
  }, function(error, response, body) {
  console.log(body);
});
