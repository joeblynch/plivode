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

        _add(this, 'Conference', opts, room);
        return this;
    },

    dialNumber: function(number, dialOpts, numberOpts) {
        _add(this, 'Dial', dialOpts, function() {
            _add(this, 'Number', numberOpts, number);
        });
        return this;
    },

    dialUser: function(user, dialOpts, userOpts) {
        _add(this, 'Dial', dialOpts, function() {
            _add(this, 'User', userOpts, user);
        });
        return this;
    },

    dialBulk: function(recipients, dialOpts) {
        _add(this, 'Dial', dialOpts, function() {
            for (var i = 0, l = recipients.length; i < l; i++) {
                var recipient = recipients[i];

                if (typeof recipient === 'string') {
                    if (recipient.match(/^sip:/)) {
                        _add(this, 'User', null, recipient);
                    } else {
                        _add(this, 'Number', null, recipient);
                    }
                } else if (recipient.number) {
                    _add(this, 'Number', recipient.opts, recipient.number);
                } else if (recipient.user) {
                    _add(this, 'User', recipient.opts, recipient.user);
                }
            }
        });
        return this;
    },

    getDigits: function(opts, body) {
        this._app && (opts.action = this._app._getCallbackUrl(opts.action));

        _add(this, 'GetDigits', opts, body);
        return this;
    },

    hangup: function(opts) {
        _add(this, 'Hangup', opts);
        return this;
    },

    message: function(src, dest, msg) {
        _add(this, 'Message', { src: src, dest: dest }, msg);
        return this;
    },

    play: function(url, opts) {
        this._app && (url = this._app._absoluteUrl(url));

        _add(this, 'Play', opts, url);
        return this;
    },

    preAnswer: function(body) {
        _add(this, 'PreAnswer', null, body);
        return this;
    },

    record: function(opts) {
        this._app && (opts.action = this._app._getCallbackUrl(opts.action));

        _add(this, 'Record', opts);
        return this;
    },

    redirect: function(url, opts) {
        this._app && (url = this._app._getCallbackUrl(url));

        _add(this, 'Redirect', opts, url);
        return this;
    },

    speak: function(text, opts) {
        _add(this, 'Speak', opts, text);
        return this;
    },

    wait: function(length) {
        _add(this, 'Wait', length && { length: length });
        return this;
    },

    dtmf: function(digits) {
        _add(this, 'DTMF', null, digits);
        return this;
    },

    send: function(res) {
        res || (res = this._res);
        res.header('Content-Type', 'text/xml');
        res.send(this.toString());
        return this;
    },

    toString: function() {
        return [].concat('<Response>', this._buf, '</Response>').join('');
    }
});


function _add(res, type, attrs, body) {
    var buf = res._buf;

    buf.push('<', type);

    if (attrs) {
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key) && attrs[key] != null) {
                buf.push(' ', key, '="', _xmlEncode(attrs[key]), '"');
            }
        }
    }

    if (body) {
        buf.push('>');

        if (typeof body === 'function') {
            body(res);
        } else {
            buf.push(_xmlEncode(body));
        }

        buf.push('</', type, '>');
    } else {
        buf.push(' />');
    }
}

function _xmlEncode(text) {
    return (''+text).replace(/[<>"'&]/g, function(c) {
        return {'<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;', '&': '&amp;'}[c];
    });
}