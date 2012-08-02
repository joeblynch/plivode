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
            client.post(['Application', this.appID], urls, 202, cb);
            return this;
        }
    };

    Application.getAllDetails = function(cb) {
        client.get('Application', 200, cb);
    };

    return Application;
};