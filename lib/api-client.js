var https = require('https'),
    Compose = require('compose');

var ApiClient = module.exports = Compose(function(opts) {
    opts || (opts = {});

    this.authId = opts.authID || ApiClient.authID;
    this.authToken = opts.authToken || ApiClient.authToken;
}, {
    API_VERSION: '1',

    sendRaw: function(method, resources, params, cb) {
        var req = https.request({
            method: 'POST',
            path: ['/v', this.API_VERSION, '/Account/' + this.authId, '/' ,
                Array.isArray(resources) ? resources.join('/') : resources, '/'].join(''),
            hostname: 'api.plivo.com',
            headers: { 'Content-Type': 'application/json' },
            auth: this.authId + ':' + this.authToken
        }, function(res) {
            cb && cb(null, res);
        }).on('error', function(err) {
            cb && cb(err);
        });

        req.end(JSON.stringify(params));
    },

    postRaw: function(resources, params, cb) {
        this.sendRaw('POST', resources, params, cb);
    },

    getRaw: function(resources, params, cb) {
        this.sendRaw('GET', resources, params, cb);
    },

    call: function(fromNumber, toNumber, answerUrl) {
        this.postRaw('Call', {
            from: fromNumber,
            to: toNumber,
            answer_url: answerUrl
        });
    },

    updateApp: function(appID, urls, cb) {
        this.postRaw(['Application', appID], urls, cb);
    }
});