/*
 *  LIFXWhite.js
 *
 *  David Janes
 *  IOTDB
 *  2015-11-26
 */

var iotdb = require("iotdb");

exports.binding = {
    bridge: require('../LIFXBridge').Bridge,
    model: require('./lifx-white.json'),
    matchd: {
        'iot:vendor.color': false,
    },
};
