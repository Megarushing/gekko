// Let's create our own strategy
var method = {};
// helpers
var _ = require('lodash');
var log = require('../core/log.js');

// configuration
var config = require('../core/util.js').getConfig();

// Prepare everything our strat needs
method.init = function() {
    this.candlesbehind = this.settings.daysbehind*24*(60/config.tradingAdvisor.candleSize)
    this.name = 'notlele';
    this.taketime = 0; //set this variable to stop the bot for x candles
    this.nowdoing = 'waiting';
    this.positionprice = 2300.0;
    this.requiredHistory = this.candlesbehind;
    this.profitstart = 0;
    this.stoponlong = 0; //recent low
    this.stoponshort = 9999999999; //recent top
    this.tponlong = 999999999; //over long time previous top
    this.tponshort = 0; //under long time previous low
    // define the indicators we need
    this.addIndicator('minmax', 'MINMAX', this.settings);
}

// What happens on every new candle?
method.update = function(candle) {
    this.candle = candle;
    var minmax = this.indicators.minmax;
    var tempstoponlong = minmax.recentmin - minmax.recentmin * this.settings.stopspace; //recent low
    var tempstoponshort = minmax.recentmax + minmax.recentmax * this.settings.stopspace; //recent top

    var longcondition = (
        (this.candle.close < this.tponshort) && //hit shorting takeprofit
        (tempstoponlong < this.candle.close) //but only enter if projected stop is behind aka going up
        );
    var shortcondition = (
        (this.candle.close > this.tponlong) && //hit long takeprofit
        (tempstoponshort > this.candle.close) //but only enter if projected stop is behind aka going down
    );

    this.tponlong = minmax.max + minmax.max * this.settings.tpspace; //over long time previous top
    this.tponshort = minmax.min - minmax.min * this.settings.tpspace; //under long time previous low

    //only move stop in the direction of profit
    if ((tempstoponlong > this.stoponlong) && (tempstoponlong < this.candle.low)) this.stoponlong = tempstoponlong;
    if ((tempstoponshort < this.stoponshort) && (tempstoponshort > this.candle.high)) this.stoponshort = tempstoponshort;

    if (longcondition)
    {
        //process.stdout.write("--- TP HIT! Candle at:"+this.candle.close+" switching positions ---\n");
        if (this._prevAdvice != 'long')
        {
            this.profitstart = this.positionprice + this.positionprice * (this.settings.tpspace/2);
            this.positionprice = this.candle.close; //save price of position
            this.stoponlong = tempstoponlong;
        }
        this.nowdoing = 'long';
    }
    else if (shortcondition)
    {
        //process.stdout.write("--- TP HIT! Candle at:"+this.candle.close+" switching positions ---\n");
        if (this._prevAdvice != 'short')
        {
            this.profitstart = this.positionprice - this.positionprice * (this.settings.tpspace/2);
            this.positionprice = this.candle.close;
            this.stoponshort = tempstoponshort;
        }
        this.nowdoing = 'short';
    }
    /* stoploss temporarily disabled
    else if ((this.candle.close < this.stoploss) && (this.nowdoing === 'long'))
    {
        process.stdout.write("--- STOP LOSS HIT! Candle at:"+this.candle.close+" cancelling operation ---\n");
        this.nowdoing = 'short';
        this.positionprice = this.candle.close; //save price of position
        this.stoploss = stoponshort;
        this.takeprofit = tponshort;
    }
    else if ((this.candle.close > this.stoploss) && (this.nowdoing === 'short'))
    {
        process.stdout.write("--- STOP LOSS HIT! Candle at:"+this.candle.close+" cancelling operation ---\n");
        this.nowdoing = 'long';
        this.positionprice = this.candle.close; //save price of position
        this.stoploss = stoponlong;
        this.takeprofit = tponlong;
    }
    */

    //set data for logging
    if (this._prevAdvice === 'short')
    {
    var takeprofit = this.tponshort; //if doing a short set take profit to last min
    var stoploss = this.stoponshort;
    } else {
    var takeprofit = this.tponlong; //if doing a short set take profit to last min
    var stoploss = this.stoponlong;
    }

//process.stdout.write(this._prevAdvice+" Position open at: "+this.positionprice.toString()+" Candle at:"+this.candle.close.toString()+" Takeprofit at: "+takeprofit.toString()+" Stoploss at: "+stoploss.toString()+"\n");
}

// For debugging purposes.
method.log = function() {
    // your code!
}

// Based on the newly calculated
// information, check if we should
// update or not.
method.check = function() {
    //price to stop all tradings
    if (this.candle.close < this.settings.disablebotunderprice)
    {
        this.advice('short');
    } else {
        if (this.nowdoing != 'waiting')
        {
            this.advice(this.nowdoing);
            this.nowdoing = 'waiting';
        }
    }
}

module.exports = method;
