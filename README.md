# homestar-lifx
[IOTDB](https://github.com/dpjanes/node-iotdb) Bridge for LIFX Lights

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

# About

See <a href="samples/">the samples</a> for details how to add to your project,
particularly <code>model.js</code> for standalone
and <code>iotdb.js</code> for HomeStar/IOTDB.

* [Read about Bridges](https://github.com/dpjanes/node-iotdb/blob/master/docs/bridges.md)

# Installation

* [Read this first](https://github.com/dpjanes/node-iotdb/blob/master/docs/install.md)

Then:

    $ npm install homestar-lifx

# Use

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

