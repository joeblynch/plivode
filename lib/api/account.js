module.exports = function(client) {
    /** @namespace ApiClient.Account */
    return {
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