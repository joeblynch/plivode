var https = require('https'),
    querystring = require('querystring'),
    Compose = require('compose'),
    Application = require('./application'),
    Call = require('./call'),
    sig = require('../sig');

/**
 * @constructor ApiClient
 * @description Creates a new client for interacting with the Plivo API.
 * @param {object} [auth] An object containing the `authID` and `authToken` for your Plivo account.
 *  If omitted, the static fields `ApiClient.authID` and `ApiClient.authToken` must be set.
 * @property {ApiClient.Application} Application The `Application` API interface for this client.
 * @property {ApiClient.Call} Call The `Call` API interface for this client.
 */
var ApiClient = module.exports = Compose(function(auth) {
    auth || (auth = {});

    this.authID = auth.authID || ApiClient.authID;
    this.authToken = auth.authToken || ApiClient.authToken;

    this.Application = Application(this);
    this.Call = Call(this);
}, {
    API_VERSION: '1',

    _request: function(method, resources, params, expectStatus, cb) {
        sig(arguments, {
            's?n': function() { expectStatus = params; params = undefined },
            's?f': function() { cb = params; params = undefined },
            's?nf': function() { cb = expectStatus; expectStatus = params; params = undefined },
            's?of': function() { cb = expectStatus; expectStatus = undefined }
        });

        var req = https.request({
            method: method,
            auth: this.authID + ':' + this.authToken,
            hostname: 'api.plivo.com',
            path: ['/v', this.API_VERSION, '/Account/', this.authID, '/' ,
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

    _post: function (resources, params, expectStatus, cb) {
        return this._request('POST', resources, params, expectStatus, cb);
    },

    _get: function(resources, params, expectStatus, cb) {
        return this._request('GET', resources, params, expectStatus, cb);
    },

    _delete: function (resources, params, expectStatus, cb) {
        return this._request('DELETE', resources, params, expectStatus, cb);
    },

    _getCallbackUrl: function(cb) {
        if (Array.isArray(cb)) {
            return cb.join('/');
        }

        return cb;
    }
});