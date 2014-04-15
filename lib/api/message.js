// TODO: This handles sending messages, however application.js handles incoming messages. Should merge or refactor?

/* Copyright (c) 2014 Joe Lynch <yhf@ncsc.io>, http://plivode.ncsc.io/
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */

var Compose = require('compose'),
    _ = require('underscore'),
    sig = require('../sig');

module.exports = function(client) {
    var Message = {
        _url: function(resource) {
            return [].concat('Message', resource || []);
        },

        send: function(src, dst, text, cb) {
            client._post(this._url(), {
                src: src,
                dst: dst,
                text: text
            }, 202, cb);
            return this;
        }
    };

    return Message;
};