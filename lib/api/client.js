var https = require('https'),
    querystring = require('querystring'),
    Compose = require('compose'),
    Application = require('./application'),
    Call = require('./call'),
    sig = require('../sig');

var ApiClient = module.exports = Compose(function(opts) {
    opts || (opts = {});

    this.authId = opts.authID || ApiClient.authID;
    this.authToken = opts.authToken || ApiClient.authToken;

    this.Application = Application(this);
    this.Call = Call(this);
}, {
    API_VERSION: '1',

    request: function(method, resources, params, expectStatus, cb) {
        sig(arguments, {
            's?n': function() { expectStatus = params; params = undefined },
            's?f': function() { cb = params; params = undefined },
            's?nf': function() { cb = expectStatus; expectStatus = params; params = undefined },
            's?of': function() { cb = expectStatus; expectStatus = undefined }
        });

        var req = https.request({
            method: method,
            auth: this.authId + ':' + this.authToken,
            hostname: 'api.plivo.com',
            path: ['/v', this.API_VERSION, '/Account/', this.authId, '/' ,
                Array.isArray(resources) ? resources.join('/') : resources, '/',
                method === 'GET' && params ? '?' + querystring.stringify(params) : ''].join(''),
            headers: method === 'POST' ? { 'Content-Type': 'application/json' } : null
        }, function(res) {
            if (cb) {
                var params = method === 'POST' ? res.body : res.params,
                    err = !expectStatus || expectStatus === res.statusCode
                        ? null
                        : 'unexpected status code';

                cb(err, params, res.statusCode);
            }
        }).on('error', function(err) {
            cb && cb(err);
        });

        if (method === 'POST') {
            req.end(JSON.stringify(params));
        } else {
            req.end();
        }
    },

    post: function (resources, params, expectStatus, cb) {
        return this.request('POST', resources, params, expectStatus, cb);
    },

    get: function(resources, params, expectStatus, cb) {
        return this.request('GET', resources, params, expectStatus, cb);
    },

    delete_: function (resources, params, expectStatus, cb) {
        return this.request('DELETE', resources, params, expectStatus, cb);
    },

    _getCallbackUrl: function(cb) {
        if (Array.isArray(cb)) {
            return cb.join('/');
        }

        return cb;
    }
});