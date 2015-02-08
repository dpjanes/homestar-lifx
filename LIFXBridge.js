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

"use struct";

var iotdb = require('iotdb')
var _ = iotdb.helpers;

var lifx = require('lifx');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'homestar-lifx',
    module: 'LIFXBridge',
});

var __queue;

/**
 *  EXEMPLAR and INSTANCE
 *  <p>
 *  No subclassing needed! The following functions are 
 *  injected _after_ this is created, and before .discover and .connect
 *  <ul>
 *  <li><code>discovered</code> - tell IOTDB that we're talking to a new Thing
 *  <li><code>pulled</code> - got new data
 *  <li><code>connected</code> - this is connected to a Thing
 *  <li><code>disconnnected</code> - this has been disconnected from a Thing
 *  </ul>
 */
var LIFXBridge = function(initd, native) {
    var self = this;

    self.initd = _.defaults(initd, {
        number: 0,
        poll: 30,
        account: null,
    });
    self.native = native;
    self.stated = {};

    if (self.native) {
        /* queue is shared amongst all LIFX */
        if (!__queue) {
            __queue = new iotdb.Queue("LIFXBridge");
        }

        self.queue = __queue;
    }
};

/* --- lifecycle --- */

/**
 *  EXEMPLAR. 
 *  Discover Hue
 *  <ul>
 *  <li>look for Things (using <code>self.bridge</code> data to initialize)
 *  <li>find / create a <code>native</code> that does the talking
 *  <li>create an LIFXBridge(native)
 *  <li>call <code>self.discovered(bridge)</code> with it
 */
LIFXBridge.prototype.discover = function() {
    var self = this;

    var lx = self._lifx();
    lx.on('bulb', function (bulb) {
        self.discovered(new LIFXDriver(self.initd, bulb));
    });
};

/**
 *  INSTANCE
 *  This is called when the Bridge is no longer needed. When
 */
LIFXBridge.prototype.connect = function() {
    var self = this;
    if (!self.native) {
        return;
    }

    self._setup_polling();
    self.pull();
};

LIFXBridge.prototype._setup_polling = function() {
    var self = this;
    if (!self.initd.poll) {
        return;
    }

    var timer = setInterval(function() {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.initd.poll * 1000);
};

LIFXBridge.prototype._forget = function() {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "_forget"
    }, "called");

    self.native = null;
    self.pulled();
}

/**
 *  INSTANCE and EXEMPLAR (during shutdown). 
 *  This is called when the Bridge is no longer needed. 
 */
LIFXBridge.prototype.disconnect = function() {
    var self = this;
    if (!self.native || !self.native) {
        return;
    }

    self._forget();
};

/* --- data --- */

/**
 *  INSTANCE.
 *  Send data to whatever you're taking to.
 */
LIFXBridge.prototype.push = function(pushd) {
    var self = this;
    if (!self.native) {
        return;
    }

    if (pushd.on !== undefined) {
        putd.on = pushd.on;
    }

    if (pushd.brightness !== undefined) {
        var color = new iotdb.libs.Color();
        color.set_rgb_1(pushd.brightness, pushd.brightness, pushd.brightness);
        pushd.color = color.get_hex();
    }

    if (_.isString(pushd.color)) {
        _c2h(putd, pushd.color);

        putd.on = true;
        self.pulled({
            on: true
        });
    }

    logger.info({
        method: "push",
        putd: putd
    }, "push");

    var qitem = {
        id: self.light,
        run: function () {
            var lx = self._lifx();

            if (putd.on) {
                lx.lightsOn(self.native);
            } else {
                lx.lightsOff(self.native);
            }

            if (putd.h !== undefined) {
                _lifx.lightsColour(putd.h, putd.s, putd.l, putd.brightness, 0x25, self.native); 
            }

            queue.finished(qitem);
        }
    };
    queue.add(qitem);
};

/**
 *  INSTANCE.
 *  Pull data from whatever we're talking to. You don't
 *  have to implement this if it doesn't make sense
 */
LIFXBridge.prototype.pull = function() {
    var self = this;
    if (!self.native) {
        return;
    }
};

/* --- state --- */

/**
 *  INSTANCE.
 *  Return the metadata - compact form can be used.
 *  Does not have to work when not reachable
 *  <p>
 *  Really really useful things are:
 *  <ul>
 *  <li><code>iot:thing</code> required - a unique ID
 *  <li><code>iot:device</code> suggested if linking multiple things together
 *  <li><code>iot:name</code>
 *  <li><code>iot:number</code>
 *  <li><code>schema:manufacturer</code>
 *  <li><code>schema:model</code>
 */
LIFXBridge.prototype.meta = function() {
    var self = this;
    if (!self.native) {
        return;
    }

    return {
        "iot:thing": _.id.thing_urn.unique("LIFX", self.native.uuid) + "/" + self.initd.number,
        "iot:device": _.id.thing_urn.unique("LIFX", self.native.uuid),
        "iot:name": self.native.name || "LIFX",
        "schema:manufacturer": "schema:manufacturer",
    };
};

/**
 *  INSTANCE.
 *  Return True if this is reachable. You 
 *  do not need to worry about connect / disconnect /
 *  shutdown states, they will be always checked first.
 */
LIFXBridge.prototype.reachable = function() {
    return this.native !== null;
};

/**
 *  INSTANCE.
 *  Return True if this is configured. Things
 *  that are not configured are always not reachable.
 *  If not defined, "true" is returned
 */
LIFXBridge.prototype.configured = function() {
    return true;
};

/* --- injected: THIS CODE WILL BE REMOVED AT RUNTIME, DO NOT MODIFY  --- */
LIFXBridge.prototype.discovered = function(bridge) {
    throw new Error("LIFXBridge.discovered not implemented");
};

LIFXBridge.prototype.pulled = function(pulld) {
    throw new Error("LIFXBridge.pulled not implemented");
};

/* -- internals -- */
var __lifx;

/**
 */
LIFXDriver.prototype._lifx = function () {
    var self = this;

    if (!__lifx) {
        __lifx = lifx.init();
    }

    return __lifx;
};

function _c2h(outd, hex) {
    var color = new iotdb.libs.Color(hex);

    outd.h = Math.round(color.h * 0xFFFF);
    outd.s = Math.round(color.s * 0xFFFF);
    outd.l = Math.round(color.l * 0xFFFF);
    outd.brightness = Math.max(color.r, color.g, color.b) * 0xFFFF;
}
/*
 *  API
 */
exports.Bridge = LIFXBridge;

