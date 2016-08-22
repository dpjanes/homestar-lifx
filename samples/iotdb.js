/*
 *  How to use this module in IOTDB / HomeStar
 *  This is the best way to do this
 *  Note: to work, this package must have been installed by 'homestar install' 
 */

"use strict";

const iotdb = require('iotdb');
iotdb.use("homestar-lifx");

const things = iotdb.connect('LIFXWhite').connect('LIFXLight');
things.on("thing", function(thing) {
    console.log("+", "new thing", thing.thing_id());
});
things.on("istate", function(thing) {
    console.log("+", "istate", thing.state("istate"));
});
things.on("meta", function(thing) {
    console.log("+", "meta", thing.state("meta"));
});
