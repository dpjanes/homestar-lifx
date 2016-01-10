/*
 *  LIFXBridge.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-02-05
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var iotdb = require('iotdb');
var _ = iotdb._;
var bunyan = iotdb.bunyan;

var lifx = require('node-lifx');

var logger = bunyan.createLogger({
    name: 'homestar-lifx',
    module: 'LIFXBridge',
});

/* e.g.
    'White 800 (High Voltage)': {
        pid: 11,
        name: 'White 800 (High Voltage)',
        features: {
            color: false
        }
    },
*/
var pdd = {};
var products = require('./products.json');
products[0]["products"].map(function(pd) {
    pdd[pd.name] = pd;
});

/**
 *  See {iotdb.bridge.Bridge#Bridge} for documentation.
 *  <p>
 *  @param {object|undefined} native
 *  only used for instances, should be 
 */
var LIFXBridge = function (initd, native) {
    var self = this;

    self.initd = _.defaults(initd,
        iotdb.keystore().get("bridges/LIFXBridge/initd"), {
            number: 0,
            poll: 30
        }
    );
    self.native = native;
    self.stated = {};

    if (self.native) {
        self.queue = _.queue("LIFXBridge");

        if (!self.native.uuid && self.native.addr) {
            self.native.uuid = self.native.addr.toString("hex");
        }

    }
};

LIFXBridge.prototype = new iotdb.Bridge();

LIFXBridge.prototype.name = function () {
    return "LIFXBridge";
};

/* --- lifecycle --- */

/**
 *  See {iotdb.bridge.Bridge#discover} for documentation.
 */
LIFXBridge.prototype.discover = function () {
    var self = this;

    logger.info({
        method: "discover"
    }, "called");

    var lx = self._lifx();
    lx.on('error', function(error) {
        logger.error({
            error: _.error.message(error),
            cause: "likely in the LIFX module",
            full: error,
        }, "LIFX error");
    });
    lx.on('light-new', function(bulb) {
        self._discover_bulb(bulb);
    });

    var lightd = lx.lights('');
    _.map(lightd, function(bulb, key) {
        self._discover_bulb(bulb);
    });
};

LIFXBridge.prototype._discover_bulb = function (bulb) {
    var self = this;

    bulb.getHardwareVersion(function(error, hardware) {
        if (error) {
            logger.error({
                method: "_discover_bulb",
                error: _.error.message(error),
            }, "problem finding bulb");
            return;
        }

        var pd = pdd[hardware.productName];
        if (pd) {
            hardware.color = pd.features.color;
        }

        hardware.uuid = bulb.id;

        bulb.__hardware = hardware;
        self.discovered(new LIFXBridge(self.initd, bulb));
    });

};

/**
 *  See {iotdb.bridge.Bridge#connect} for documentation.
 */
LIFXBridge.prototype.connect = function (connectd) {
    var self = this;
    if (!self.native) {
        return;
    }

    self._validate_connect(connectd);

    self._setup_polling();
    self.pull();
};

LIFXBridge.prototype._setup_polling = function () {
    var self = this;
    if (!self.initd.poll) {
        return;
    }

    var timer = setInterval(function () {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.initd.poll * 1000);
};

LIFXBridge.prototype._forget = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "_forget"
    }, "called");

    self.native = null;
    self.pulled();
};

/**
 *  See {iotdb.bridge.Bridge#disconnect} for documentation.
 */
LIFXBridge.prototype.disconnect = function () {
    var self = this;
    if (!self.native || !self.native) {
        return;
    }

    self._forget();
};

/* --- data --- */

/**
 *  See {iotdb.bridge.Bridge#push} for documentation.
 */
LIFXBridge.prototype.push = function (pushd, done) {
    var self = this;
    if (!self.native) {
        done(new Error("not connected"));
        return;
    }

    self._validate_push(pushd);

    var putd = {};
    if (pushd.on !== undefined) {
        if ((pushd.brightness === undefined) && (pushd.color === undefined)) {
            putd.brightness = pushd.on ? 100 : 0;
        }
    }

    if (_.is.String(pushd.color)) {
        _c2h(putd, pushd.color);
    } else if (pushd.brightness !== undefined) {
        putd.h = 0;
        putd.s = 0;
        putd.brightness = pushd.brightness;
    }

    if (putd.brightness !== undefined) {
        putd.on = putd.brightness > 0 ? true : false;
    }


    logger.info({
        method: "push",
        putd: putd
    }, "push");

    var qitem = {
        id: self.light,
        run: function () {
            try {
                if (putd.on !== undefined) {
                    if (putd.on) {
                        self.native.on();
                    } else {
                        self.native.off();
                    }
                }

                if (putd.h !== undefined) {
                    self.native.color(putd.h, putd.s, putd.brightness); 
                } else if (putd.brightness !== undefined) {
                    self.native.color(0, 0, putd.brightness);
                }
            } catch (x) {
                logger.error({
                    method: "push",
                    pushd: pushd,
                    putd: putd,
                    exception: _.error.message(x),
                }, "error sending commands to LIFX");
            }       

            self.queue.finished(qitem);
        },
        coda: function() {
            done();
        },
    };
    self.queue.add(qitem);
};

/**
 *  See {iotdb.bridge.Bridge#pull} for documentation.
 */
LIFXBridge.prototype.pull = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    /* XXX - it would be nice to pull values */
};

/* --- state --- */

/**
 *  See {iotdb.bridge.Bridge#meta} for documentation.
 */
LIFXBridge.prototype.meta = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    var hardware = self.native.__hardware;
    return {
        "iot:thing-id": _.id.thing_urn.unique("LIFX", hardware.uuid),
        "iot:vendor.color": hardware.color ? true : false,
        "schema:name": hardware.productName || "LIFX",
        "schema:manufacturer": hardware.vendorName || "LIFX",
    };
};

/**
 *  See {iotdb.bridge.Bridge#reachable} for documentation.
 */
LIFXBridge.prototype.reachable = function () {
    return this.native !== null;
};

/**
 *  See {iotdb.bridge.Bridge#configure} for documentation.
 */
LIFXBridge.prototype.configure = function (app) {};

/* -- internals -- */
var __lifx;

/**
 */
LIFXBridge.prototype._lifx = function () {
    var self = this;

    if (!__lifx) {
        __lifx = new lifx.Client();
        __lifx.init();
    }

    return __lifx;
};

function _c2h(outd, hex) {
    var color = new _.Color(hex);

    outd.h = Math.round(color.h * 360);
    outd.s = Math.round(color.s * 100);
    outd.brightness = Math.max(color.r, color.g, color.b) * 100;
}

/*
 *  API
 */
exports.Bridge = LIFXBridge;
