var Compose = require('compose');

function _add(res, type, attrs, body) {
    var buf = res._buf;

    buf.push('<', type);

    if (attrs) {
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                buf.push(' ', key, '="', attrs[key], '"');
            }
        }
    }

    if (body) {
        buf.push('>');
        buf.push(typeof body === 'function' ? body(res) : body);
        buf.push('</', type, '>');
    } else {
        buf.push(' />');
    }
}

var Response = module.exports = Compose(function(res, app) {
    this._app = app;
    this._res = res;
    this._buf = [];
}, {
    toString: function() {

    },

    send: function(res) {
        res || (res = this._res);
        res.header('Content-Type', 'text/xml');
        res.send(['<Response>', this._buf.join(''), '</Response>'].join(''));
        return this;
    },

    dtmf: function(digits) {
        _add(this, 'DTMF', null, digits);
        return this;
    },

    getDigits: function(opts, body) {
        if (this._app && !opts.action.match(/\/\//)) {
            opts.action = this._app.rootUrl.href + opts.action;
        }

        _add(this, 'GetDigits', opts, body);
        return this;
    },

    dialNumber: function(number, dialOpts, numberOpts) {
        _add(this, 'Dial', dialOpts, function() {
            _add(this, 'Number', numberOpts, number);
        });
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
        _add(this, 'Play', opts, url);
        return this;
    },

    wait: function(length) {
        _add(this, 'Wait', length && { length: length });
        return this;
    }
});