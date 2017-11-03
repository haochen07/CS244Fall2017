const fs = require('fs');

module.exports.recordFeatures = function(data) {
  var filepath = "./data/features.csv";
  var header = "IR, RED, heart_rate, respiration_rate, SPO2\n";
  fs.writeFile(filepath, header);

  for(i = 0; i < data.IR.length; i++) {
    var line = data.IR[i] + ',' + data.RED[i] + ',' + data.heartRate[i] + ',' + data.respirationRate[i] + ',' + data.spo2[i] + '\n';
    fs.appendFile(filepath, line);
  }
}

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

module.exports.makeRecord = function(listData) {
  return listData.join(',') + '\n';
}
