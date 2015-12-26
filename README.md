# homestar-lifx
HomeStar / IOTDB Controller for LIFX Light

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

See <a href="samples/">the samples</a> for details how to add to your project,
particularly <code>model.js</code> for standalone
and <code>iotdb.js</code> for HomeStar/IOTDB.

Note that we can't distinguish (yet) between LIFX color lights
and LIFX White lights.

# Installation

Install Home☆Star first. 
See: https://github.com/dpjanes/iotdb-homestar#installation

Then

    $ homestar install homestar-lifx

# Development Note

"products.json" is from:

* https://github.com/LIFX/products/blob/master/products.json

# Quick Start

Set the light color to red

	$ npm install -g homestar ## with 'sudo' if error
	$ homestar setup
	$ homestar install homestar-lifx
	$ node
	>>> iotdb = require('iotdb')
	>>> iot = iotdb.iot()
	>>> things = iot.connect("LIFXLight")
	>>> things.set(":color", "#FF0000")

# LIFXLight

Control LIFX Light

Functionality:

* discover Light hubs and individual lights
* turn lights on and off
* set light color
* get same

## Attributes

* <code>on</code>: true or false.  <code>iot-attribute:on</code>
* <code>color</code>: a hex color ("#FF0000").  <code>iot-attribute:color</code>

e.g.

    {
        "on": true,
        "color": "#FF0000"
    }

