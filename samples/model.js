/*
 *  Use a Model to manipulate semantically
 */

"use strict";

const iotdb = require("iotdb");
const _ = iotdb._;

const ModelBinding = require('../models/LIFX');

const wrapper = _.bridge_wrapper(ModelBinding.binding);
wrapper.on('thing', function (model) {
    model.on("state", function (thing) {
        console.log("+ state\n ", model.thing_id(), model.state("istate"));
    });
    model.on("meta", function (thing) {
        console.log("+ meta\n ", model.thing_id(), model.state("meta"));
    });

    var count = 0;
    var colors = ["#FF0000", "#00FF00", "#0000FF", "#00FFFF", "#FF00FF", "#FFFF00", "#FFFFFF", ];
    var timer = setInterval(function () {
        if (!model.reachable()) {
            console.log("+ forgetting unreachable model");
            clearInterval(timer);
            return;
        }

        model.set(":color", colors[count++ % colors.length]);
    }, 2500);

    console.log("+ discovered\n ", model.thing_id(), model.state("meta"));
});
