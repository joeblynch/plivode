var Compose = require('compose');

module.exports = function(client) {
    /**
     * @constructor ApiClient.Application
     * @description Creates a new API client for a a specific application. `new` is optional.
     * @param {string} appID The application ID of the application to interact with.
     */
    function Application(appID) {
        if (!(this instanceof Application)) {
            return new Application(appID);
        }

        this.appID = appID;
    }

    Application.prototype = {
        /**
         * Modify an application
         * @param {object} urls Application URLs to be updated.
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Application}
         * @memberOf ApiClient.Application#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/application/#modify">http://www.plivo.com/docs/api/application/#modify</a>
         */
        update: function(urls, cb) {
            client.post(['Application', this.appID], urls, 202, cb);
            return this;
        }
    };

    _.extend(Application, {
        /**
         * Get details of all applications
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Application}
         * @memberOf ApiClient.Application
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/application/#detail">http://www.plivo.com/docs/api/application/#detail</a>
         */
        getAll: function(cb) {
            client.get('Application', 200, cb);
            return this;
        },

        /**
         * Create an application
         * @param {object} params The application parameters.
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Application}
         * @memberOf ApiClient.Application
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/application/#create">http://www.plivo.com/docs/api/application/#create</a>
         */
        create: function(params, cb) {
            client._post('Application', 201, params, cb);
            return this;
        }
    });

    return Application;
};