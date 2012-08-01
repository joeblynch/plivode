var Compose = require('compose');

module.exports = function(client) {
    function Application(appID) {
        if (!(this instanceof Application)) {
            return new Application(appID);
        }

        this.appID = appID;
    }

    Application.prototype = {
        update: function(urls, cb) {
            client.postRaw(['Application', this.appID], urls, cb);
        }
    };

    return Application;
};