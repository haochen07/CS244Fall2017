const fs = require('fs');

module.exports.recordFeatures = function(data) {
  var filepath = "./data/features.csv";
  var header = "IR, RED, heart_rate, respiration_rate, SPO2\n";
  fs.writeFile(filepath, header);

  for(i = 0; i < data.IR.length; i++) {
    var line = data.IR[i] + ',' + data.RED[i] + ',' + data.heartRate[i] + ',' + data.respirationRate[i] + ',' + data.spo2[i] + '\n';
    fs.appendFileSync(filepath, line);
  }
}

// module.exports is what you need to make the function available to other modules, when they require("./output.js")
write_to = function(filepath, content) {
  fs.writeFileSync(filepath, content);
  console.log("Create file: " + filepath + " and write: " + content);
}

module.exports.append_to = function(filepath, content) {
  fs.appendFileSync(filepath, content);
  console.log("Append: " + content + " to existing file: " + filepath);
}

module.exports.makeCsvRecord = function(listData) {
  return listData.join(',') + '\n';
}
module.exports.log_ppg_motion_records = function(data) {
  var rst = "";
  var time = data['time'];
  var Red = data['Red'];
  var IR = data['IR'];
  var X = data['X'];
  var Y = data['Y'];
  var Z = data['Z'];
  for(var i = 0; i < time.length; i++) {
    rst += time[i] + ','
         + Red[i] + ','
         + IR[i] + ','
         + X[i] + ','
         + Y[i] + ','
         + Z[i] + '\n'
  }
  return rst;
}

module.exports.prepareStorageFor = function(mode) {
  if (mode == "ppg") {
    // prepare local storage for PPG device data
    var ppgOutputFile = "./data/ppgData.csv";
    var ppGHeader = "IR,RED,time\n";
    write_to(ppgOutputFile, ppGHeader);
    return ppgOutputFile;
  }
  else if (mode == "motion") {
    // prepare local storage for motion device data
    var motionOutputFile = "./data/motionData.csv"
    var motionHeader = "X,Y,Z\n";
    write_to(motionOutputFile, motionHeader);
    return motionOutputFile;
  }
  else if (mode == "ppg_motion") {
    // prepare local storage for ppg+motion ppgData
    var ppg_motionOutputFile = "./data/ppg_motionData.csv"
    var ppg_motionHeader = "time,Red,IR,X,Y,Z\n"
    write_to(ppg_motionOutputFile, ppg_motionHeader);
    return ppg_motionOutputFile;
  }
  else {;}
}