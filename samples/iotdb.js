/*
 *  How to use this module in IOTDB / HomeStar
 *  This is the best way to do this
 */

var iotdb = require('iotdb')
var iot = iotdb.iot();

var things = iot.connect('LIFX');

var on = false;
var timer = setInterval(function() {
    things.set(":on", on);
    on = !on;
}, 2500);
