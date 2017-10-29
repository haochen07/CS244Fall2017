const fs = require('fs');

module.exports.recordFeatures = function(data) {
  var filepath = "./data/features.csv";
  var header = "IR, RED, heart_rate, respiration_rate, SPO2\n"
  fs.writeFile(filepath, header);

  for(i = 0; i < data.IR.length; i++) {
    var line = data.IR[i] + ',' + data.RED[i] + '\n';
    fs.appendFile(filepath, line);  
  }
}