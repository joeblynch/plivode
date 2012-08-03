var Compose = require('compose'),
    _ = require('underscore'),
    sig = require('../sig');

module.exports = function(client) {
    /**
     * @constructor ApiClient.Call
     * @description Creates a new API client for a specific call. `new` is optional.
     * @param {string} uuid The UUID of the call to interact with.
     */
    var Call = Compose(function(uuid) {
        if (!(this instanceof Call)) {
            return new Call(uuid);
        }

        this.uuid = uuid;
    }, {
        _url: function(resource) {
            return [].concat('Call', this.uuid, resource || []);
        },

        /**
         * Get CDR (Call Detail Record) Of A Call
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/#call_detail">http://www.plivo.com/docs/api/call/#call_detail</a>
         */
        getDetailRecord: function(cb) {
            client._get(this._url(), 200, cb);
            return this;
        },

        /**
         * Get All Live Calls
         * @description Get current active calls made from an account.
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/#live">http://www.plivo.com/docs/api/call/#live</a>
         */
        getLiveDetails: function(cb) {
            client._get(this._url(), { status: 'live' }, 200, cb);
            return this;
        },


        /**
         * Hangup a specific Call
         * @description Hangup a call (incoming or outgoing).
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/#hangupone">http://www.plivo.com/docs/api/call/#hangupone</a>
         */
        hangup: function(cb) {
            client._delete(this._url(), 204, cb);
            return this;
        },


        /**
         * Transfer a Call
         * @description allows an in-progress call to begin processing XML from a new URL. This is useful for many
         *  applications where you want to asynchronously change the behavior of a live call. For example: hold music,
         *  call queues, transferring calls etc.
         *  Allows you to transfer an active call to another URL to fetch and excute XML. If the call (the A leg) is in a
         *  Dial, you can also transfer the other party (the B leg) in same time or only transfer the B leg to an URL.
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/#transfer">http://www.plivo.com/docs/api/call/#transfer</a>
         */
        transfer: function(cb) {
            client._post(this._url(), 202, cb);
            return this;
        },

        /**
         * Record a call
         * @param {object} [params]
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/record/#record">http://www.plivo.com/docs/api/call/record/#record</a>
         */
        record: function(params, cb) {
            sig(arguments, { 'f': function() { cb = params; params = undefined; } });

            client._post(this._url('Record'), 202, params, cb);
            return this;
        },

        /**
         * Stop recording a call
         * @param {string} [url] You can specify a record URL to stop only one record. By default all recordings are stopped.
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/record/#stoprecord">http://www.plivo.com/docs/api/call/record/#stoprecord</a>
         */
        stopRecording: function(url, cb) {
            sig(arguments, { 'f': function() { cb = url; url = undefined; } });

            client._delete(this._url('Record'), url ? { url: url } : null, 204, cb);
            return this;
        },

        /**
         * Play sound during a call
         * @param {string|array} urls A single url, an array of urls, or a list of comma separated urls pointing to an mp3 or wav file.
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/play/#play">http://www.plivo.com/docs/api/call/play/#play</a>
         */
        play: function(urls, cb) {
            Array.isArray(urls) && (urls = urls.join());

            client._post(this._url('Play'), { url: urls }, 202, cb);
            return this;
        },

        /**
         * Stop playing to a call
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/play/#stopplay">http://www.plivo.com/docs/api/call/play/#stopplay</a>
         */
        stopPlaying: function(cb) {
            client._delete(this._url('Play'), 204, cb);
            return this;
        },


        /**
         * Play text during a call
         * @description Request allows you to hangup a call using the request_uuid returned by Outbound Call
         * @param {string} [text] Text to be played.
         * @param {object} [opts] Optional parameters. If the `text` param is omitted, opts must be passed in with a `text` property.
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/speak/#play">http://www.plivo.com/docs/api/call/speak/#play</a>
         */
        speak: function(text, opts, cb) {
            sig(arguments, {
                'of': function() { cb = opts; opts = text; text = undefined },
                'o': this['of'],
                'sof': function() { opts.text = text; },
                'sf': function() { cb = opts; opts = { text: text } },
                's': this['sf']
            });

            client._post(this._url('Speak'), opts, 202, cb);
            return this;
        },

        /**
         * Send digits to a call
         * @param {string|number} digits Digits to be sent.
         * @param {string} [leg="aleg"] The leg to be used, can be `aleg` (the current call) or `bleg` (the other party in a Dial).
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call#
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/dtmf/#send">http://www.plivo.com/docs/api/call/dtmf/#send</a>
         */
        dtmf: function(digits, leg, cb) {
            sig(arguments, {
                'sf': function() { cb = leg; leg = undefined },
                'nf': this['sf']
            });

            var opts = {
                digits: digits
            };

            leg && (opts.leg = leg);

            client._post(this._url('DTMF'), opts, 202, cb);
            return this;
        }
    });

    _.extend(Call, {
        /**
         * Outbound Call
         * @description Make a single call or bulk outbound calls to real phone(s) or SIP endpoint(s)
         * @param {string|number} from The phone number to use as the caller id (with the country code). E.g. For USA `15671234567`
         * @param {string|array|number} to The regular number(s) or sip endpoint(s) to call. Regular number must be prefixed with country code
         *  but without the ‘+’ sign) E.g., For USA 15677654321. Sip endpoint must be prefixed with 'sip:'
         *  E.g., sip:john1234@phone.plivo.com. To make bulk calls, an {array}, or the delimiter '<' is used.
         *  For eg. ['15677654321', '15673464321', 'sip:john1234@phone.plivo.com'] or '15677654321<15673464321<sip:john1234@phone.plivo.com'
         *  Yes you can mix regular numbers and sip endpoints !
         * @param {string|array} answer A url or route array to be requested by Plivo when the call is answered
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/#outbound">http://www.plivo.com/docs/api/call/#outbound</a>
         */
        outbound: function(from, to, answer, cb) {
            client._post('Call', {
                from: from,
                to: Array.isArray(to) ? to.join('<') : to,
                answer_url: client._getCallbackUrl(answer)
            }, 200, cb);

            return this instanceof Call ? this : Call;
        },

        /**
         * Hangup a call request
         * @description Request allows you to hangup a call using the request_uuid returned by Outbound Call API
         * @param {string} uuid The request_uuid returned by Outbound Call API
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/request/">http://www.plivo.com/docs/api/call/request/</a>
         */
        cancelOutbound: function(uuid, cb) {
            client._delete(['Request', uuid], 204, cb);

            return this instanceof Call ? this : Call;
        },

        /**
         * Get All Call Details
         * @description Get information of completed calls. The results are returned with a limit of 20.
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/#detail">http://www.plivo.com/docs/api/call/#detail</a>
         */
        getAll: function(cb) {
            client._get('Call', 200, cb);
            return this instanceof Call ? this : Call;
        },

        /**
         * Get All Live Calls
         * @description Get current active calls made from an account.
         * @param {function(err, result)} [cb] Callback
         * @return {ApiClient.Call}
         * @memberOf ApiClient.Call
         * @see <a target="_blank" href="http://www.plivo.com/docs/api/call/#live">http://www.plivo.com/docs/api/call/#live</a>
         */
        getAllLive: function(cb) {
            client._get('Call', { status: 'live' }, 200, cb);
            return this instanceof Call ? this : Call;
        }
    });

    return Call;
};