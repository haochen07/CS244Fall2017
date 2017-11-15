var csv = require("fast-csv");
var Fili = require('fili');

module.exports.extractFeatures = function(inputfile, callback) {
  var ppg = {
    time: [], //column "time(second)"
    RED:   [], //column "RED"
    IR:  [] //column "IR"
  };

  csv.fromPath(inputfile)
     .on("data", function(data){
        if (data[0] != "time") {
          ppg.time.push(Number(data[0]));
        }
        if (data[1] != "Red") {
          ppg.RED.push(Number(data[1]));
        }
        if (data[2] != "IR") {
          ppg.IR.push(Number(data[2]));
        }
      })
      .on("end", function() {
        for(i=0; i< ppg.time.length;i++) {
          ppg.time[i] = ppg.time[i] / 1000.0;
        }
        return callback(getFeatures(ppg));
      });
}

function getFeatures(ppg) {
  return {
    time:             ppg.time,
    RED:              ppg.RED,
    IR:               ppg.IR,
    heartRate:        getHeartRate(ppg),
    respirationRate:  getRespirationRate(ppg),
    spo2:             getSpo2(ppg)
  };
}

function getHeartRate(ppg) {
  var filtered = applyBandPassFilter(ppg.IR, 1.25, 0.5);
  return calculatePeakRate(ppg.time, filtered);
}

function getRespirationRate(ppg) {
  var filtered = applyBandPassFilter(ppg.IR, 0.25, 0.2);
  return calculatePeakRate(ppg.time, filtered);
}

function getSpo2(ppg) {
  var filteredIR = applyBandPassFilter(ppg.IR, 1.25, 0.5);
  var filteredRED = applyBandPassFilter(ppg.RED, 1.25, 0.5);

  var maxIR = detectPeak(ppg.time, filteredIR);
  var maxRED = detectPeak(ppg.time, filteredRED);
  var minIR = detectValley(ppg.time, filteredIR);
  var minRED = detectValley(ppg.time, filteredRED);

  var ACIR = [];
  var DCIR = [];
  var ACRED = [];
  var DCRED = [];
  var occurTime = [];

  for (var i = 0; i < minRED.time.length - 1; i++) {
    var x1 = minRED.time[i];
    var y1 = minRED.valley[i];
    var x2 = minRED.time[i+1];
    var y2 = minRED.valley[i+1];
    var x0 = maxRED.time[i+1];
    var y0 = maxRED.peak[i+1];
    var result = getACDC(x1, y1, x2, y2, x0, y0);
    occurTime.push(x0);
    ACRED.push(result.AC);
    DCRED.push(result.DC);
  }

  for (var i = 0; i < minIR.time.length - 1; i++) {
    var x1 = minIR.time[i];
    var y1 = minIR.valley[i];
    var x2 = minIR.time[i+1];
    var y2 = minIR.valley[i+1];
    var x0 = maxIR.time[i+1];
    var y0 = maxIR.peak[i+1];
    var result = getACDC(x1, y1, x2, y2, x0, y0);
    ACIR.push(result.AC);
    DCIR.push(result.DC);
  }

  var spo2 = [];
  for (var i = 0; i < ACRED.length; i++) {
    var R = ACRED[i] * DCIR[i] / (ACIR[i] * DCRED[i]);
    spo2.push(-45.060 * R * R + 30.354 * R + 94.845);
  }

  return flatRateOverTime(ppg.time, occurTime, spo2);
}

function applyBandPassFilter(data, fc, bw) {
  var iirFilterCoeffs = new Fili.CalcCascades().bandpass({
    order:          9, // cascade 3 biquad filters (max: 12)
    characteristic: 'butterworth',
    Fs:             50, // sampling frequency
    Fc:             fc, // cutoff frequency / center frequency for bandpass, bandstop, peak
    BW:             bw, // bandwidth only for bandstop and bandpass filters - optional
    gain:           0, // gain for peak, lowshelf and highshelf
    preGain:        false // adds one constant multiplication for highpass and lowpass
  });
  return new Fili.IirFilter(iirFilterCoeffs).multiStep(data);
}

function calculatePeakRate(time, data) {
  var peaks = detectPeak(time, data);
  var peaksTime = peaks.time;
  var rate = [];
  var occurTime = [];
  var i = 1;
  for (var i = 1; i < peaksTime.length; i++) {
    var currentRate = 60/(peaksTime[i] - peaksTime[i-1]);
    occurTime.push(peaksTime[i]);
    rate.push(currentRate);
  }
  return flatRateOverTime(time, occurTime, rate);
}

function detectPeak(time, data) {
  var peaksTime = [];
  var peaks = [];
  for (var i = 1; i < data.length; i++) {
    if (i+1 < data.length && data[i-1] < data[i] && data[i] > data[i+1]) {
      peaksTime.push(time[i]);
      peaks.push(data[i]);
    }
  }
  return {
    time: peaksTime,
    peak: peaks
  };
}

function detectValley(time, data) {
  var valleyTime = [];
  var valleys = [];
  for (var i = 1; i < data.length; i++) {
    if (i+1 < data.length && data[i-1] > data[i] && data[i] < data[i+1]) {
      valleyTime.push(time[i]);
      valleys.push(data[i]);
    }
  }
  return {
    time: valleyTime,
    valley: valleys
  };
}

function getACDC(x1, y1, x2, y2, x0, y0) {
  var y = (y2-y1) / (x2-x1) * (x0-x1) + y1;
  return {
    DC: y,
    AC: y0 - y
  };
}

function flatRateOverTime(time, dataTime, data) {
  var flatData = [];
  var i = 0;
  var j = 0;
  while (j < dataTime.length) {
    while (i < time.length && time[i] < dataTime[j]) {
      flatData.push(data[j]);
      i++;
    }
    j++;
  }
  while (i < time.length) {
    flatData.push(data[data.length-1]);
    i++;
  }
  return flatData;
}
