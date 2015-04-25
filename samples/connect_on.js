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

    var on = false;
    setInterval(function () {
        bridge.push({
            on: on,
        });
        on = !on;
    }, 2500);
};
bridge_exemplar.discover();
