/*
 *  LIFX.js
 *
 *  David Janes
 *  IOTDB
 *  2014-11-24
 */

var iotdb = require("iotdb");

exports.binding = {
    bridge: require('../LIFXBridge').Bridge,
    model: require('./LIFXLight.json'),
};
