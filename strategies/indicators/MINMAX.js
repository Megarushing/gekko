// required indicators

var config = require('../../core/util.js').getConfig();
var Indicator = function(settings) {
  this.prices = [];
  this.min = 999999999999;
  this.max = 0;
  this.recentmin = 999999999999;
  this.recentmax = 0;
  this.maxsize = settings.daysbehind*24*(60/config.tradingAdvisor.candleSize);
  this.recentcandles = settings.recenthours*(60/config.tradingAdvisor.candleSize);
  this.ignoremostrecent = settings.ignoremostrecenthours*(60/config.tradingAdvisor.candleSize)
}

Indicator.prototype.update = function(price) {
  this.prices.push(price);
  if (this.prices.length > this.maxsize) {
      var removed = this.prices.shift();
      //if ((removed.low == this.min) || (removed.high == this.max)) this.updateminmax();
  }
  //only update low and high if it was removed from array or new high has appeared
  //if ((price.low < this.min) || (price.high > this.max)) this.updateminmax();
    this.updateminmax();
}

Indicator.prototype.updateminmax = function() {
    this.min = 999999999999;
    this.max = 0;
    this.recentmin = 999999999999;
    this.recentmax = 0;
    for (var i in this.prices)
    {
      if (i < this.maxsize-this.recentcandles) { //ignore most recent candles
          if (this.prices[i].low < this.min) this.min = this.prices[i].low;
          if (this.prices[i].high > this.max) this.max = this.prices[i].high;
      } else if (this.maxsize-this.recentcandles < i < this.maxsize-this.ignoremostrecent){
          if (this.prices[i].low < this.recentmin) this.recentmin = this.prices[i].low;
          if (this.prices[i].high > this.recentmax) this.recentmax = this.prices[i].high;
      }
    }
}

module.exports = Indicator;
