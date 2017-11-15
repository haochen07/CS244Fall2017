const logger = require('./logger.js');

module.exports.handle = function(mode, req, res, outputfile, debug) {
  if (mode == "ppg") {
    handlePPG(req, res, outputfile, debug);
  }
  else if (mode == "motion") {
    handleMotion(req, res, outputfile, debug);
  }
  else if (mode == "ppg_motion") {
    handleBoth(req, res, outputfile, debug);
  }
  else {;}
};

handleBoth = function(req, res, outputfile, debug) {
  const { headers, method, url } = req;
  if (debug == 1) {
    console.log("headers: " + headers)
    console.log("method: " + method)
    console.log("url: " + url)
  }
  var reqBody = [];
  req.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    reqBody.push(chunk);
  }).on('end', () => {
    reqBody = Buffer.concat(reqBody).toString();
    if (debug == 1) { console.log(reqBody); }

    var ppg_motion;
    jsonParseBoth(reqBody, debug, function(data) {
      ppg_motion = data;
    });

    var record = logger.makeCsvRecord([ppg_motion.time, ppg_motion.Red, ppg_motion.IR, ppg_motion.X, ppg_motion.Y, ppg_motion.Z]);
    if (debug == 1) { console.log(record); }

    logger.append_to(outputfile, record)

    makeResponse(res);
  })
}

jsonParseBoth = function(str, debug, callback) {
  var ppg_motion = {
    time : null,
    Red : null,
    IR : null,
    X : null,
    Y : null,
    Z : null
  };
  JSON.parse(str, (key, value) => {
    if (debug == 1) { console.log("parsing " + key + " with value " + value); }
    if (key == "time") {
      ppg_motion.time = value;
    }
    else if (key == "Red") {
      ppg_motion.Red = value;
    }
    else if (key == "IR") {
      ppg_motion.IR = value;
    }
    else if (key == "X") {
      ppg_motion.X = value;
    }
    else if (key == "Y") {
      ppg_motion.Y = value;
    }
    else if (key == "Z") {
      ppg_motion.Z = value;
    }
    else {
      ;
    }
  })
  console.log("Request Parsing Done.");
  return callback(ppg_motion);
}

handlePPG = function(req, res, outputfile, debug) {
  const { headers, method, url } = req;
  if (debug == 1) {
    console.log("headers: " + headers)
    console.log("method: " + method)
    console.log("url: " + url)
    console.log("reqBody: " + reqBody);
  }

  var reqBody = [];
  req.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    reqBody.push(chunk);
  }).on('end', () => {
    reqBody = Buffer.concat(reqBody).toString();

    if (debug == 1) { console.log(reqBody); }

    var ppg;
    jsonParsePPG(reqBody, debug, function(data) {
      ppg = data;
    });

    var record = logger.makeCsvRecord([ppg.IR, ppg.RED, ppg.time]);

    if (debug == 1) { console.log(record); }

    logger.append_to(outputfile, record)

    makeResponse(res);
  })
};

handleMotion = function(req, res, outputfile, debug) {
  const { headers, method, url } = req;
  if (debug == 1) {
    console.log("headers: " + headers)
    console.log("method: " + method)
    console.log("url: " + url)
    console.log("reqBody: " + reqBody);
  }

  var reqBody = [];
  req.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    reqBody.push(chunk);
  }).on('end', () => {
    reqBody = Buffer.concat(reqBody).toString();

    if (debug == 1) { console.log(reqBody); }

    var motion;
    jsonParseMotion(reqBody, debug, function(data) {
      motion = data;
    });

    var record = logger.makeCsvRecord([motion.X, motion.Y, motion.Z]);

    if (debug == 1) { console.log(record); }

    logger.append_to(outputfile, record)

    makeResponse(res);
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
  console.log("req Parsing Done.");
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

makeResponse = function(res) {
  res.on('error', (err) => {
    console.error(err);
  });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  var resBody = "Greeting from the Cloud.";
  res.end(resBody);
}
