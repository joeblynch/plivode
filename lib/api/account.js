/* Copyright (c) 2012 Joe Lynch <yhf@ncsc.io>, http://plivode.ncsc.io/
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */

var _ = require('underscore'),
    Compose = require('compose'),
    sig = require('../sig');

module.exports = function(client) {
    /** @class ApiClient.Account.Subaccount */
    var Subaccount = Compose(function(authID) {
        if (!(this instanceof Subaccount)) {
            return new Subaccount(authID);
        }

        this.authID = authID;
    }, {
        update: function(params, cb) {
            sig(arguments, { f: function() { cb = params; params = undefined; } });

            if (params) {
                params.callback_url = client._getCallbackUrl(params.callback_url || params.callback);
            }

            client._post(['Subaccount', this.authID], params, 202, cb);
            return this;
        },

        delete_: function(cb) {
            client._delete(['Subaccount', this.authID], 204, cb);
            return this;
        }
    });

    _.extend(Subaccount, {
        getAll: function(params, cb) {
            sig(arguments, { f: function() { cb = params; params = undefined; } });

            if (params) {
                params.callback_url = client._getCallbackUrl(params.callback_url || params.callback);
            }

            client._get('Subaccount', params, 200, cb);
            return Subaccount;
        },

        create: function(params, cb) {
            sig(arguments, { f: function() { cb = params; params = undefined; } });

            if (params) {
                params.callback_url = client._getCallbackUrl(params.callback_url || params.callback);
            }

            client._post('Subaccount', params, 201, cb);
            return Subaccount;
        }
    });

    /** @namespace ApiClient.Account */
    return {
        Subaccount: Subaccount,

        /**
         * Get account details
         * @description Get information of your account.
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Account}
         * @memberOf ApiClient.Account
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/account/#detail">http://www.plivo.com/docs/api/account/#detail</a>
         */
        getDetails: function(cb) {
            client._get('', 200, cb);
            return this;
        },

        /**
         * Modify an account
         * @description Modify information related your account
         * @param {object} params
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Account}
         * @memberOf ApiClient.Account
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/account/#modify">http://www.plivo.com/docs/api/account/#modify</a>
         */
        update: function(params, cb) {
            client._post('', 202, cb);
            return this;
        }
    };
};
