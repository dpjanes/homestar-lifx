/*
 *  Connect to a LIFX and cycle through colors
 */

"use strict";

var iotdb = require('iotdb');
var LIFXBridge = require('../LIFXBridge').Bridge;

var bridge_exemplar = new LIFXBridge();
bridge_exemplar.discovered = function (bridge) {
    console.log("+ got one\n ", bridge.meta());
    bridge.pulled = function (state) {
        console.log("+ state-change\n ", state);
    };
    bridge.connect({});

    var count = 0;
    var colors = ["#FF0000", "#00FF00", "#0000FF", "#00FFFF", "#FF00FF", "#FFFF00", "#FFFFFF", "#000000"];
    setInterval(function () {
        bridge.push({
            color: colors[count++ % colors.length]
        }, function() {});
    }, 2500);
};
bridge_exemplar.discover();
