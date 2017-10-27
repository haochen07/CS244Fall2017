var fs = require('fs');
var csv = require("fast-csv");
var Fili = require('fili');

module.exports.bandpassFromFile = function(callback) {
  var timeArr = [];
  var irArr = [];
  var redArr = [];

  csvFormatter = {'time':0, 'ir':1, 'red':2};
  //  Instance of a filter coefficient calculator
  var iirCalculator = new Fili.CalcCascades();

  // get available filters
  var availableFilters = iirCalculator.available();

  // calculate filter coefficients
  var iirFilterCoeffs = iirCalculator.bandpass({
   order: 3, // cascade 3 biquad filters (max: 12)
   characteristic: 'butterworth',
   Fs: 50, // sampling frequency
   Fc: 1.5, // cutoff frequency / center frequency for bandpass, bandstop, peak
   BW: 1, // bandwidth only for bandstop and bandpass filters - optional
   gain: 0, // gain for peak, lowshelf and highshelf
   preGain: false // adds one constant multiplication for highpass and lowpass
   // k = (1 + cos(omega)) * 0.5 / k = 1 with preGain == false
    });

  // create a filter instance from the calculated coeffs
  var iirFilter = new Fili.IirFilter(iirFilterCoeffs);


  csv.fromPath("/Users/shayangzang/Downloads/takashin_Homework_sample.csv")
      .on("data", function(data){
        // timeArr.push(data[csvFormatter['time']]);
        if (data[csvFormatter['ir']] != "IR") {
          irArr.push(data[csvFormatter['ir']]);
        }
        // redArr.push(data[csvFormatter['red']]);
      })
      .on("end", function(){
        return callback(iirFilter.multiStep(irArr));
      });
}


function plot(data) {
      var labels = [];
      for(var i = 0; i < data.length; i++)
      {
       labels.push(' ');
      }

    var ctx = document.getElementById('myChart').getContext('2d');
      var myLineChart = new Chart(ctx, {
       type: 'line',
       data: {
        labels: labels,
        datasets: [{
         label: "My First dataset",
         borderColor: 'rgb(255, 99, 132)',
         data: data,
        }]
       },
       options: {
        elements: {
         line: {
          tension: 0, // disables bezier curves
         }
        }
       }
      });
    }
