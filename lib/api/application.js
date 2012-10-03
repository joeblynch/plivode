/* Copyright (c) 2012 Joe Lynch <yhf@ncsc.io>, http://plivode.ncsc.io/
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */

var Compose = require('compose'),
    _ = require('underscore');

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
         * Get details of a single application
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Application}
         * @memberOf ApiClient.Application#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/application/#application">http://www.plivo.com/docs/api/application/#application</a>
         */
        getDetails: function(cb) {
            client._get(['Application', this.appID], 200, cb);
            return this;
        },

        /**
         * Modify an application
         * @param {object} urls Application URLs to be updated.
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Application}
         * @memberOf ApiClient.Application#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/application/#modify">http://www.plivo.com/docs/api/application/#modify</a>
         */
        update: function(urls, cb) {
            client._post(['Application', this.appID], urls, 202, cb);
            return this;
        },

        /**
         * Delete an application
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Application}
         * @memberOf ApiClient.Application#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/application/#delete">http://www.plivo.com/docs/api/application/#delete</a>
         */
        deleteApp: function(cb) {
            client._delete(['Application', this.appID], 204, cb);
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
            client._get('Application', 200, cb);
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