const logger = require('./logger.js');

module.exports.handle = function(mode, request, response, outputfile, debug) {
  if (mode == "ppg") {
    handlePPG(request, response, outputfile, debug);
  }
  else if (mode == "motion") {
    handleMotion(request, response, outputfile, debug);
  }
  else {;}

};

handlePPG = function(request, response, outputfile, debug) {
  const { headers, method, url } = request;
  if (debug == 1) {
    console.log("headers: " + headers)
    console.log("method: " + method)
    console.log("url: " + url)
    console.log("requestBody: " + requestBody);
  }

  var requestBody = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    requestBody.push(chunk);
  }).on('end', () => {
    requestBody = Buffer.concat(requestBody).toString();

    if (debug == 1) { console.log(requestBody); }

    var ppg;
    jsonParsePPG(requestBody, debug, function(data) {
      ppg = data;
    });

    var record = logger.makeCsvRecord([ppg.IR, ppg.RED, ppg.time]);

    if (debug == 1) { console.log(record); }

    logger.append_to(outputfile, record)

    makeResponse(response);
  })
};

handleMotion = function(request, response, outputfile, debug) {
  const { headers, method, url } = request;
  if (debug == 1) {
    console.log("headers: " + headers)
    console.log("method: " + method)
    console.log("url: " + url)
    console.log("requestBody: " + requestBody);
  }

  var requestBody = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    requestBody.push(chunk);
  }).on('end', () => {
    requestBody = Buffer.concat(requestBody).toString();

    if (debug == 1) { console.log(requestBody); }

    var motion;
    jsonParseMotion(requestBody, debug, function(data) {
      motion = data;
    });

    var record = logger.makeCsvRecord([motion.X, motion.Y, motion.Z]);

    if (debug == 1) { console.log(record); }

    logger.append_to(outputfile, record)

    makeResponse(response);
  })
};

jsonParsePPG = function(str, debug, callback) {
  var ppg = {
    time : null,
    IR : null,
    RED: null
  };
  JSON.parse(str, (key, value) => {
    if (debug == 1) { console.log("parsing " + key + " with value " + value); }
    if (key == "Red") {
      ppg.RED = value;
    }
    else if (key == "IR") {
      ppg.IR = value;
    }
    else if (key == "time") {
      ppg.time = value;
    }
    // JSON.parse will not stop parsing until it hits the point where key == ""
    else {
      ;
    }
  })
  console.log("Request Parsing Done.");
  return callback(ppg);
}

jsonParseMotion = function(str, debug, callback) {
  var motion = {
    X : null,
    Y : null,
    Z: null
  };
  JSON.parse(str, (key, value) => {
    if (debug == 1) { console.log("parsing " + key + " with value " + value); }
    if (key == "X") {
      motion.X = value;
    }
    else if (key == "Y") {
      motion.Y = value;
    }
    else if (key == "Z") {
      motion.Z = value;
    }
    else {
      ;
    }
  })
  console.log("Request Parsing Done.");
  return callback(motion);
}

makeResponse = function(response) {
  response.on('error', (err) => {
    console.error(err);
  });
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json');
  var responseBody = "Greeting from the Cloud.";
  response.end(responseBody);
}
