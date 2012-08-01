var https = require('https'),
    querystring = require('querystring'),
    Compose = require('compose'),

    Application = require('./application'),
    Call = require('./call');

var ApiClient = module.exports = Compose(function(opts) {
    opts || (opts = {});

    this.authId = opts.authID || ApiClient.authID;
    this.authToken = opts.authToken || ApiClient.authToken;

    this.Application = new Application(this);
    this.Call = new Call(this);
}, {
    API_VERSION: '1',

    sendRaw: function(method, resources, params, cb) {

        var opts = {
            method: method,
            auth: this.authId + ':' + this.authToken,
            hostname: 'api.plivo.com',
            path: ['/v', this.API_VERSION, '/Account/' + this.authId, '/' ,
                Array.isArray(resources) ? resources.join('/') : resources, '/',
                method === 'GET' && params ? '?' + querystring.stringify(params) : ''].join('')
        };

        if (method === 'POST') {
            opts.headers = { 'Content-Type': 'application/json' };
        }

        var req = https.request(opts, function(res) {
            cb && cb(null, res);
        }).on('error', function(err) {
            cb && cb(err);
        });

        if (method === 'POST') {
            req.end(JSON.stringify(params));
        } else {
            req.end();
        }
    },

    postRaw: function (resources, params, cb) {
        this.sendRaw('POST', resources, params, cb);
    },

    getRaw: function(resources, params, cb) {
        this.sendRaw('GET', resources, params, cb);
    },

    deleteRaw: function (resources, params, cb) {
        this.sendRaw('DELETE', resources, params, cb);
    },

    _getCallbackUrl: function(cb) {
        if (Array.isArray(cb)) {
            return cb.join('/');
        }

        return cb;
    }
});