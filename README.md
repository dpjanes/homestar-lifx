# homestar-lifx
HomeStar / IOTDB Controller for LIFX Light

See <a href="samples/">the samples</a> for details how to add to your project,
particularly <code>model.js</code> for standalone
and <code>iotdb.js</code> for HomeStar/IOTDB.

# LIFX

Control LIFX Light

Functionality:

* discover Light hubs and individual lights
* turn lights on and off
* set light color
* get same

## LIFXModel

* <code>on</code>: true or false.  <code>iot-attribute:on</code>
* <code>color</code>: a hex color ("#FF0000").  <code>iot-attribute:color</code>

e.g.

    {
        "on": true,
        "color": "#FF0000"
    }

