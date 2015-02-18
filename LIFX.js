/*
 *  LIFX.js
 *
 *  David Janes
 *  IOTDB
 *  2014-11-24
 */

var homestar = require("homestar")

exports.Model = homestar.make_model('LIFXLight')
    .facet(":lighting")
    .name("LIFX Light")
    .description("LIFX colored light")
    .o("on", homestar.boolean.on)
    .o("color", homestar.string.color)
    .make()
    ;

exports.binding = {
    bridge: require('./LIFXBridge').Bridge,
    model: exports.Model,
};
