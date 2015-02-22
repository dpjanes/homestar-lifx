/*
 *  Use a Model to manipulate semantically
 */

var homestar = require("homestar");
var _ = homestar._;

var ModelBinding = require('../LIFX');

wrapper = _.bridge_wrapper(ModelBinding.binding);
wrapper.on('model', function(model) {
    model.on("state", function(model) {
        console.log("+ state\n ", model.state());
    });
    model.on("meta", function(model) {
        console.log("+ meta\n ", _.ld.compact(model.meta().state()));
    });

    var count = 0;
    var colors = [ "#FF0000", "#00FF00", "#0000FF", "#00FFFF", "#FF00FF", "#FFFF00", "#FFFFFF", ];
    var timer = setInterval(function() {
        if (!model.reachable()) {
            console.log("+ forgetting unreachable model");
            clearInterval(timer);
            return;
        }

        model.set(":color", colors[count++ % colors.length]);
    }, 2500);
    
    console.log("+ discovered\n ", _.ld.compact(model.meta().state()), "\n ", model.thing_id());
})
