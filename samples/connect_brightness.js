/*
 *  Connect to a LIFX
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

    var brightness = 0;
    var delta = 10;
    setInterval(function () {
        bridge.push({
            brightness: brightness,
        }, function() {});

        brightness = brightness + delta;
        if (brightness > 100) {
            brightness = 0;
        }
    }, 2500);
};
bridge_exemplar.discover();
