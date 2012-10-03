/* Copyright (c) 2012 Joe Lynch <yhf@ncsc.io>, http://plivode.ncsc.io/
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */

var plivode = require('plivode');

new plivode.App({
    appID: '[your Plivo app ID]',
    authID: '[your Plivo auth ID]',
    authToken: '[your Plivo auth token]',
    rootUrl: '[the root URL this app is accessible by Plivo]'
})
.on('answer', function(params, response) {
    response
        .speak('Hello, world!')
        .send();
});