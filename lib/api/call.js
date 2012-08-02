var Compose = require('compose'),
    _ = require('underscore'),
    sig = require('../sig');

module.exports = function(client) {
    var Call = Compose(function(uuid) {
        if (!(this instanceof Call)) {
            return new Call(uuid);
        }

        this.uuid = uuid;
    }, {
        url: function(resource) {
            return [].concat('Call', this.uuid, resource || []);
        },

        getDetailRecord: function(cb) {
            client.get(this.url(), 200, cb);
            return this;
        },

        getLiveDetails: function(cb) {
            client.get(this.url(), { status: 'live' }, 200, cb);
            return this;
        },

        hangup: function(cb) {
            client.delete_(this.url(), 204, cb);
            return this;
        },

        transfer: function(cb) {
            client.post(this.url(), 202, cb);
            return this;
        },
        
        record: function(params, cb) {
            sig(arguments, { 'f': function() { cb = params; params = undefined; } });

            client.post(this.url('Record'), 202, cb);
            return this;
        },

        stopRecording: function(url, cb) {
            sig(arguments, { 'f': function() { cb = url; url = undefined; } });

            client.delete_(this.url('Record'), url ? { url: url } : null, 204, cb);
            return this;
        },

        play: function(urls, cb) {
            Array.isArray(urls) && (urls = urls.join());

            client.post(this.url('Play'), { url: urls }, 202, cb);
            return this;
        },

        stopPlaying: function(cb) {
            client.delete_(this.url('Play'), 204, cb);
            return this;
        },

        speak: function(text, opts, cb) {
            sig(arguments, {
                'of': function() { cb = opts; opts = text; text = undefined },
                'o': this['of'],
                'sof': function() { opts.text = text; },
                'sf': function() { cb = opts; opts = { text: text } },
                's': this['sf']
            });

            client.post(this.url('Speak'), { text: text }, 202, cb);
            return this;
        },

        dtmf: function(digits, leg, cb) {
            sig(arguments, {
                'sf': function() { cb = leg; leg = undefined },
                'nf': this['sf']
            });

            var opts = {
                digits: digits
            };

            leg && (opts.leg = leg);

            client.post(this.url('DTMF'), opts, 202, cb);
            return this;
        }
    });

    _.extend(Call, {
        outbound: function(from, to, answerUrl, cb) {
            client.post('Call', {
                from: from,
                to: to,
                answer_url: client._getCallbackUrl(answerUrl)
            }, 200, cb);

            return this instanceof Call ? this : Call;
        },

        cancelOutbound: function(uuid, cb) {
            client.delete_(['Request', uuid], 204, cb);

            return this instanceof Call ? this : Call;
        },

        getAll: function(cb) {
            client.get('Call', 200, cb);
            return this instanceof Call ? this : Call;
        },

        getAllLive: function(cb) {
            client.get('Call', { status: 'live' }, 200, cb);
            return this instanceof Call ? this : Call;
        }
    });

    return Call;
};