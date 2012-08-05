var plivode = require('plivode');

new plivode.App({
    appID: '[your Plivo app ID]',
    authID: '[your Plivo auth ID]',
    authToken: '[your Plivo auth token]',
    rootUrl: '[the root URL this app is accessible by Plivo]'
})
.on('message', function(params, response) {
    // When a sms is received, make an outbound call to the number that sent sms,
    // passing the text of the sms to the "parrot" action.
    this.Call.outbound('19494848425', params.From, { caller_name: '[kenneth]', machine_detection: 'true', answer_url: ['parrot', params.Text] });

    // Send a blank response back, so Plivo knows we processed and not to resend.
    response.send();
})
.on('parrot/:message', function(params, response) {
    // The user answered the return call, so speak the text of the sms that they sent, and repeat it 3 times.
    response
        .speak(params.message, { loop: 3 })
        .send();
});