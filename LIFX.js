/*
 *  LIFX.js
 *
 *  David Janes
 *  IOTDB
 *  2014-11-24
 */

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('LIFXLight')
    .facet(":lighting")
    .name("LIFX Light")
    .description("LIFX colored light")
    .o("on", iotdb.boolean.on)
    .o("color", iotdb.string.color)
    .make()
    ;

exports.binding = {
    bridge: require('./LIFXBridge').Bridge,
    model: exports.Model,
};
