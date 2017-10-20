// import { write_to } from "output.js"
const output = require('./output.js');
const http = require('http');
const fs = require('fs');

var filepath = "/Users/shayangzang/Desktop/octaCat/CS244Fall2017/project/server/testOut.csv";

header = "RED,IR\n"
output.write_to(filepath, header);

http.createServer((request, response) => {
  const { headers, method, url } = request;
  let requestBody = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    requestBody.push(chunk);
  }).on('end', () => {
    requestBody = Buffer.concat(requestBody).toString();

  // console.log("headers: " + headers)
  // console.log("method: " + method)
  // console.log("url: " + url)
  // console.log("requestBody: " + requestBody);

  JSON.parse(requestBody, (key, value) => {
    console.log("parsing " + key);
    if (key == "Red") {
      console.log("Red value: " + value);
      // rArr.push(value);
      var rVal = value;
    }
    else if (key == "IR") {
      console.log("IR value: " + value);
      // irArr.push(value);
      var irVal = value;
    }
    else if (key == "time") {
      console.log("time: " + value);
      var time = value;
    }
    // JSON.parse will not stop parsing until it hits the point where key == ""
    else {
      console.log("Request Parsing Done.");
    }
  })
  var record = rVal + "," + irVal + "," + time + "\n";
  output.append_to(filepath, record)


  response.on('error', (err) => {
    console.error(err);
  });

  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json');
  // Note: the 2 lines above could be replaced with this next one:
  // response.writeHead(200, {'Content-Type': 'application/json'})
  let responseBody = "Greeting from the Cloud.";
  const responseWritable = { headers, method, url, responseBody };

  // response.write(JSON.stringify(responseBody));
  response.write(responseBody);
  response.end();
  });
}).listen(8888); // Activates this server, listening on port 8080.
