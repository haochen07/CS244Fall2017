var csv = require("fast-csv");
var Fili = require('fili');

module.exports.extractFeatures = function(callback) {
  var ppg = {
    time: [], //column "time(second)"
    IR:   [], //column "IR"
    RED:  [] //column "RED"
  };

  //TODO: optimize input code.
  csv.fromPath("./data/sample.csv")
     .on("data", function(data){
        if (data[0] != "time(second)") {
          ppg.time.push(Number(data[0]));
        }
        if (data[1] != "IR") {
          ppg.IR.push(Number(data[1]));
        }
        if (data[2] != "RED") {
          ppg.RED.push(Number(data[2]));
        }
      })
      .on("end", function(){
        return callback(getFeatures(ppg));
      });
}

function getFeatures(ppg) {
  return {
    time:             ppg.time,
    IR:               ppg.IR,
    RED:              ppg.RED,
    heartRate:        getHeartRate(ppg),
    respirationRate:  getRespirationRate(ppg),
    spo2:             getSpo2(ppg)
  };
}

function getHeartRate(ppg) {
  var filtered = applyBandPassFilter(ppg.IR, 1.25, 0.5);
  return calculateRate(ppg.time, filtered);
}

function getRespirationRate(ppg) {
  var filtered = applyBandPassFilter(ppg.IR, 0.25, 0.2);
  return calculateRate(ppg.time, filtered);
}

function getSpo2(ppg) {
  return [0,0];
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

function calculateRate(time, data) {
  var peaksTime = [];
  for (var i = 0; i < data.length; i++) {
    if (i > 0 && i+1 < data.length && data[i-1] < data[i] && data[i] > data[i+1]) {
      peaksTime.push(time[i]);
    }
  }
  var rate = [];
  var i = 1;
  var j = 0;
  while (i < peaksTime.length) {
    var currentRate = 60/(peaksTime[i] - peaksTime[i-1]);
    while (j < time.length && time[j] <= peaksTime[i]) {
      rate.push(currentRate);
      j++;
    }
    i++;
  }
  var lastRate = rate[j-1];
  while (j < time.length) {
    rate.push(lastRate);
    j++;
  }
  return rate;
}

