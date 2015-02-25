# homestar-lifx
HomeStar / IOTDB Controller for LIFX Light

# Quick Start

Set the light color to red

	$ npm install -g homestar
	$ npm install iotdb
	$ homestar install homestar-lifx
	$ node
	>>> iotdb = require('iotdb')
	>>> iot = iotdb.iot()
	>>> things = iot.connect("LIFX")
	>>> things.set(":color", "#FF0000")

# LIFXLight

* discover LIFX hubs and individual lights
* turn lights on and off
* set light color
* get same

## LIFXLightModel

* <code>on</code>: true or false.  <code>iot-attribute:on</code>
* <code>color</code>: a hex color ("#FF0000").  <code>iot-attribute:color</code>

e.g.

    {
        "on": true,
        "color": "#FF0000"
    }


