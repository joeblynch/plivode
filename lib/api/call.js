var Compose = require('compose'),
    _ = require('underscore');

module.exports = function(client) {
    var Call = Compose(function(uuid) {
        if (!(this instanceof Call)) {
            return new Compose(staticFns, Call)(uuid);
        }

        this.uuid = uuid;
    }, { // TODO: need to figure out how to best handle callbacks for responses
        getDetailRecord: function(cb) {
            client.getRaw(['Call', this.uuid], null, cb);
        },

        getLiveDetails: function(cb) {
            client.getRaw(['Call', this.uuid], { status: 'live' }, cb);
        },

        hangup: function(cb) {
            client.deleteRaw(['Call', this.uuid], null, cb);
        },

        transfer: function(cb) {
            client.postRaw(['Call', this.uuid], null, cb);
        }
    });

    var staticFns = {
        outbound: function(from, to, answerUrl, cb) {
            client.postRaw('Call', {
                from: from,
                to: to,
                answer_url: client._getCallbackUrl(answerUrl)
            }, cb);
        },

        getAll: function(cb) {
            client.getRaw('Call', null, cb);
        },

        getAllLive: function(cb) {
            client.getRaw('Call', { status: 'live' }, cb);
        }
    };

    _.extend(Call, staticFns);

    return Call;
};