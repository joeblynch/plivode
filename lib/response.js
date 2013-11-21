/* Copyright (c) 2012 Joe Lynch <yhf@ncsc.io>, http://plivode.ncsc.io/
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */

var Compose = require('compose');

var Response = module.exports = Compose(function(res, app) {
    this._app = app;
    this._res = res;
    this._buf = [];
}, {
    conference: function(room, opts) {
        var client = this._app;
        if (client) {
            opts.callbackUrl = client._getCallbackUrl(opts.callback || opts.callbackUrl);
            opts.action = client._getCallbackUrl(opts.action);
        }

        this._add(this, 'Conference', opts, room);
        return this;
    },

    dialNumber: function(number, dialOpts, numberOpts) {
        var self = this;
        self._add(self, 'Dial', dialOpts, function() {
            self._add(self, 'Number', numberOpts, number);
        });
        return this;
    },

    dialUser: function(user, dialOpts, userOpts) {
        var self = this;
        self._add(self, 'Dial', dialOpts, function() {
            self._add(self, 'User', userOpts, user);
        });
        return this;
    },

    dialBulk: function(recipients, dialOpts) {
        var self = this;
        self._add(self, 'Dial', dialOpts, function() {
            for (var i = 0, l = recipients.length; i < l; i++) {
                var recipient = recipients[i];

                if (typeof recipient === 'string') {
                    if (recipient.match(/^sip:/)) {
                        self._add(self, 'User', null, recipient);
                    } else {
                        self._add(self, 'Number', null, recipient);
                    }
                } else if (recipient.number) {
                    self._add(self, 'Number', recipient.opts, recipient.number);
                } else if (recipient.user) {
                    self._add(self, 'User', recipient.opts, recipient.user);
                }
            }
        });
        return this;
    },

    getDigits: function(opts, body) {
        if ( this._app ) {
            opts.action = this._app._getCallbackUrl(opts.action);
        }

        this._add(this, 'GetDigits', opts, body);
        return this;
    },

    hangup: function(opts) {
        this._add(this, 'Hangup', opts);
        return this;
    },

    message: function(src, dest, msg) {
        this._add(this, 'Message', { src: src, dest: dest }, msg);
        return this;
    },

    play: function(url, opts) {
        if ( this._app ) {
            url = this._app._absoluteUrl(url);
        }

        this._add(this, 'Play', opts, url);
        return this;
    },

    preAnswer: function(body) {
        this._add(this, 'PreAnswer', null, body);
        return this;
    },

    record: function(opts) {
        if ( this._app ) {
            opts.action = this._app._getCallbackUrl(opts.action);
        }

        this._add(this, 'Record', opts);
        return this;
    },

    redirect: function(url, opts) {
        if ( this._app ) {
            url = this._app._getCallbackUrl(url);
        }

        this._add(this, 'Redirect', opts, url);
        return this;
    },

    speak: function(text, opts) {
        this._add(this, 'Speak', opts, text);
        return this;
    },

    wait: function(length) {
        this._add(this, 'Wait', length && { length: length });
        return this;
    },

    dtmf: function(digits) {
        this._add(this, 'DTMF', null, digits);
        return this;
    },

    send: function(res) {
        if ( !res ) {
            res = this._res;
        }
        res.header('Content-Type', 'text/xml');
        res.send(this.toString());
        return this;
    },

    toString: function() {
        return [].concat('<Response>', this._buf, '</Response>').join('');
    },

    _add: function(res, type, attrs, body) {
        var buf = res._buf;

        buf.push('<', type);

        if (attrs) {
            for (var key in attrs) {
                if (attrs.hasOwnProperty(key) && attrs[key] !== null) {
                    buf.push(' ', key, '="', this._xmlEncode(attrs[key]), '"');
                }
            }
        }

        if (body) {
            buf.push('>');

            if (typeof body === 'function') {
                body(res);
            } else {
                buf.push(this._xmlEncode(body));
            }

            buf.push('</', type, '>');
        } else {
            buf.push(' />');
        }
    },

    _xmlEncode: function(text) {
        return (''+text).replace(/[<>"'&]/g, function(c) {
            return {'<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;', '&': '&amp;'}[c];
        });
    }
});
