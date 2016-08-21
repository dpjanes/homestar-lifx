# homestar-lifx
IOTDB Bridge for LIFX Lights

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

See <a href="samples/">the samples</a> for details how to add to your project,
particularly <code>model.js</code> for standalone
and <code>iotdb.js</code> for HomeStar/IOTDB.

Note that we can't distinguish (yet) between LIFX color lights
and LIFX White lights.

# Quick Start


	$ npm install -g homestar ## with 'sudo' if error
	$ homestar setup
	$ homestar install homestar-lifx ## or npm install

Set the lights to red

	const iotdb = require('iotdb')
	iotdb.use("homestar-lifx")

	const things = iotdb.connect("LIFXLight")
	things.set(":color", "#FF0000")

# Development Note

"products.json" is from:

* https://github.com/LIFX/products/blob/master/products.json

# Models
## LIFXLight

LIFX Color Light

* <code>on</code>: true or false.  <code>iot-attribute:on</code>
* <code>color</code>: a hex color ("#FF0000").  <code>iot-attribute:color</code>
* <code>brightness</code>: from 0 to 100

e.g.

    {
        "on": true,
        "color": "#FF0000",
        "brightness": 100
    }

## LIFXWhite

Control LIFX White Light

* <code>on</code>: true or false.  <code>iot-attribute:on</code>
* <code>brightness</code>: from 0 to 100

e.g.

    {
        "on": true,
        "brightness": 100
    }

