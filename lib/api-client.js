var https = require('https'),
    querystring = require('querystring'),
    Compose = require('compose');

var ApiClient = module.exports = Compose(function(opts) {
    opts || (opts = {});

    var self = this,
        authId = this.authId = opts.authID || ApiClient.authID,
        authToken = this.authToken = opts.authToken || ApiClient.authToken;

    function sendRaw(method, resources, params, cb) {
        var req = https.request({
            method: method,
            path: ['/v', self.API_VERSION, '/Account/' + authId, '/' ,
                Array.isArray(resources) ? resources.join('/') : resources, '/',
                method === 'GET' && params ? '?' + querystring.stringify(params) : ''].join(''),
            hostname: 'api.plivo.com',
            headers: { 'Content-Type': 'application/json' },
            auth: authId + ':' + authToken
        }, function(res) {
            cb && cb(null, res);
        }).on('error', function(err) {
            cb && cb(err);
        });

        if (method === 'POST') {
            req.end(JSON.stringify(params));
        } else {
            req.end();
        }
    }

    function postRaw(resources, params, cb) {
        sendRaw('POST', resources, params, cb);
    }

    function getRaw(resources, params, cb) {
        sendRaw('GET', resources, params, cb);
    }

    function deleteRaw(resources, params, cb) {
        sendRaw('DELETE', resources, params, cb);
    }

    this.Application = Compose.create({
        update: function(appID, urls, cb) {
            postRaw(['Application', appID], urls, cb);
        }
    });

    this.Call = Compose.create({
        //TODO: need to figure out how to best handle callbacks for responses
        outbound: function(from, to, answerUrl, cb) {
            postRaw('Call', {
                from: from,
                to: to,
                answer_url: answerUrl
            }, cb);
        },

        getAll: function(cb) {
            getRaw('Call', null, cb);
        },

        getAllLive: function(cb) {
            getRaw('Call', { status: 'live' }, cb);
        },

        getDetailRecord: function(callUuid, cb) {
            getRaw(['Call', callUuid], null, cb);
        },

        getLiveDetails: function(callUuid, cb) {
            getRaw(['Call', callUuid], { status: 'live' }, cb);
        },

        hangup: function(callUuid, cb) {
            deleteRaw(['Call', callUuid], null, cb);
        },

        transfer: function(callUuid, cb) {
            postRaw(['Call', callUuid], null, cb);
        }
    });
}, {
    API_VERSION: '1'
});