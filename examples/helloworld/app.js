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