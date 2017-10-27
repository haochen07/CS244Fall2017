const output = require('./output.js');
const input = require('./input.js');
const http = require('http');
const fs = require('fs');

var express = require("express");
var app = express();


var result;
input.bandpassFromFile(function(data) {
  result = JSON.stringify(data);
});



app.get('/', function(request, response) {
  // const { headers, method, url } = request;
  // let requestBody = [];
  // request.on('error', (err) => {
  //   console.error(err);
  // }).on('data', (chunk) => {
  //   requestBody.push(chunk);
  // }).on('end', () => {
  //   requestBody = Buffer.concat(requestBody).toString();

  response.on('error', (err) => {
    console.error(err);
  });

  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json');
  // Note: the 2 lines above could be replaced with this next one:
  // response.writeHead(200, {'Content-Type': 'application/json'})

  response.write(result);
  response.end();
  });

app.listen(8888);
