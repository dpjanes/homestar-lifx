/*
 *  How to use this module in IOTDB / HomeStar
 *  This is the best way to do this
 *  Note: to work, this package must have been installed by 'homestar install' 
 */

"use strict";

const iotdb = require('iotdb');
iotdb.use("homestar-lifx");

const things = iotdb.connect('LIFXWhite').connect('LIFXLight');

let on = false;
const timer = setInterval(function () {
    things.set(":on", on);
    on = !on;
}, 2500);
