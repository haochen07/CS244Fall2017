const http = require('http');

http.createServer((request, response) => {
  const { headers, method, url } = request;
  let requestBody = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    requestBody.push(chunk);
  }).on('end', () => {
    requestBody = Buffer.concat(requestBody).toString();

  console.log("headers: " + headers)
  console.log("method: " + method)
  console.log("url: " + url)
  console.log("requestBody: " + requestBody);


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
