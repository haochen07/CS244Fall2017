const fs = require('fs');

// module.exports is what you need to make the function available to other modules, when they require("./output.js")
module.exports.write_to = function(filepath, content) {
  fs.writeFile(filepath, content, function(err) {
    if(err) {
      return console.log(err);
     }
     console.log("Create file: " + filepath + " and write: " + content);
  });
}

module.exports.append_to = function(filepath, content) {
  fs.appendFile(filepath, content, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("Write: " + content + " to existing file: " + filepath);
  });
}
//
// module.exports.writeArrToCSV = function(filepath, array) {
//   fs.writeFile(filepath, content, function(err) {
//     if(err) {
//       return console.log(err);
//      }
//      console.log("Create file: " + filepath + " and write: " + content);
//   });
// }