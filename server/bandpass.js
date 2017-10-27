const input = require('./input.js');
const output = require('./output.js');
var express = require("express");
var ejs = require('ejs');


var app = express();

app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);


var header = "IR\n"
var filepath = "/Users/shayangzang/Desktop/octaCat/CS244Fall2017/server/ir.csv";
output.write_to(filepath, header);

var result;
input.bandpassFromFile(function(data) {
  result = JSON.stringify(data);
  for(i = 0; i < data.length; i++) {
    output.append_to(filepath, data[i] + '\n');
  }
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

  // response.statusCode = 200;
  // response.setHeader('Content-Type', 'application/json');
  //
  // response.write(result);
  // response.end();

  response.render("index.html", {data: result});

  });

app.listen(8888);
