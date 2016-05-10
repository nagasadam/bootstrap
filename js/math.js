
  //group by aggregation on json using JS underscore
  //var _ = require("underscore");
  function sum(numbers) {
      return _.reduce(numbers, function(result, current) {
          return result + parseFloat(current);
      }, 0);
  }
  function average(xs) { return sum(xs) / xs.length;}
  /*function arrayAverage(arr) {
        return _.reduce(arr, function(memo, num) {
          return memo + num;
        }, 0) / (arr.length === 0 ? 1 : arr.length);
      }*/
  function round2dec(num) { 
    return Math.round(num * 100) / 100
  }
