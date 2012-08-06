#Plivode

Plivode is a lightweight scalable application framework for creating [Plivo](http://www.plivo.com) apps with NodeJS.

## Installing
    npm install plivode

## Getting Started

Let's run through a few examples to see how Plivode works.

### Example: Hello, World!

```javascript
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
```

It doesn't get much simpler than this! Here we create a new Plivode app, which will answer any received phone calls with "Hello, world!"

Plivode makes use of [Express](http://www.expressjs.com) to run a web server for receiving messages from Plivo.

Simply specify the URL of your server, and make sure the port you specify is accesible to the outside world. For example,
if your Plivode app is running on port 1919 of plivode-app.example.com, you'd pass: `rootUrl: 'http://plivode-app.example.com:1919'`


### Application Events

Your Plivode app will raise events when you need to respond to a phone call or sms message. The standard Plivo events are:

 - `answer` - raised when a call is received by any of the phone numbers associated with your app.
 - `message` - raised when a sms message is received by any of the phone numbers associated with your app.
 - `hangup` - raised when a call is ended.


### Example: Parrot

**See it in action! Send a sms to `(949) 484-8425`. Within a few seconds you'll get a call speaking your message.**

```javascript
var plivode = require('plivode');

new plivode.App({
    appID: '[your Plivo app ID]',
    authID: '[your Plivo auth ID]',
    authToken: '[your Plivo auth token]',
    rootUrl: '[the root URL this app is accessible by Plivo]'
})
.on('message', function(params, response) {
    // When a sms is received, make an outbound call to the number that sent the sms,
    // passing the text of the sms to the "parrot" action.
    this.Call.outbound('[your Plivo phone number]', params.From, ['parrot', params.Text]);

    // Send a blank response back, so Plivo knows we processed the message and not to resend it.
    response.send();
})
.on('parrot/:message', function(params, response) {
    // The user answered the return call, so speak the text of the sms that they sent, and repeat it 3 times.
    response
        .speak(params.message, { loop: 3 })
        .send();
});
```

Here we listen for sms messages, and when one is received we call the number back and speak the message 3 times.

Plivode provides support for the entire Plivo REST API. Here we use `Call.outbound` to make the call.

Notice that we specify the custom event `parrot/:message`. This event is raised when the outbound call is answered.
Since event names map directly to [Express](http://www.expressjs.com) routes, we're able to use Express' powerful
routing engine to specify parameters within the event name.

When we make the outbound call, we pass in the action route `['parrot', params.Text]`. The first field of your route must
be the event name, and the remaining fields can be parameters to pass to the next step of the call. If you don't need to
pass along parameters you can simply pass the event name as a string.


### Example: Guess the Number

**See it in action! Call `(949) 484-8425`.**

Pick a number between 1 and 100, and the app will try to guess it. If you're thinking of a lower number press `*`; higher press `#`;
and if the guess is correct press `0`.

```javascript
var plivode = require('plivode');

new plivode.App({
    appID: '[your Plivo app ID]',
    authID: '[your Plivo auth ID]',
    authToken: '[your Plivo auth token]',
    rootUrl: '[the root URL this app is accessible by Plivo]'
})
.on('answer', function(params, response) {
    console.log('answered call from: ' + params.From);

    var MIN_GUESS = 1,
        MAX_GUESS = 100,
        guess = MIN_GUESS + Math.round(Math.random() * (MAX_GUESS - MIN_GUESS));

    response.speak('Pick a number between one and one hundred')     // Spelling out 100, otherwise speak pronounces it "1-o-o".
        .wait(3)
        .speak("I'm guessing it's " + guess)
        .getDigits({
            action: ['guess', MIN_GUESS, MAX_GUESS, guess],
            numDigits: 1,
            validDigits: '*#0',
            finishOnKey: '123456789',
            timeout: 45
        }, function() {
            response.speak("If the number you're thinking of is lower than " + guess + ", press star; " +
                "if it's higher press pound; and if it's correct press 0.")
        })
        .speak("I didn't catch that. Goodbye.")
        .send();
})
.on('guess/:min/:max/:guess', function(params, response) {
    var min = parseInt(params.min, 10),
        max = parseInt(params.max, 10),
        guess = parseInt(params.guess, 10),
        newGuess,
        direction;

    // Look at what digit the user pressed to determine how to guess next, or if we guessed right.
    switch (params.Digits) {
        case '*':
            direction = 'lower';
            max = guess - 1;
            break;
        case '#':
            direction = 'higher';
            min = guess + 1;
            break;
        case '0':
            console.log(params.From + ': ' + guess + ' was correct!');
            response
                .speak('Hooray! Thanks for playing. Goodbye.')
                .send();
            return;
    }

    if (min > max) {
        // The user told us the number is higher than the min, and less than the max, no compute.
        response
            .speak("I've run out of numbers. Goodbye.")
            .send();
        return;
    } else if (max === min) {
        // We've narrowed it down to one number
        newGuess = min;
    } else {
        // We could just do a binary search and guess right in the middle, but
        // let's add a bit of randomness to make things a bit less predictable.
        var randomnessAmount = Math.round((max - min) * 0.2),
        random = Math.random() * randomnessAmount - randomnessAmount / 2;

        newGuess = Math.round((max + min - randomnessAmount) / 2 + random);
    }

    // Pick a random start to the question to add some variability.
    var questions = ['How about ', 'Is it ', 'Perhaps ', 'Could it be '],
        question = questions[Math.floor(Math.random() * questions.length)] + newGuess + '?';

    console.log([params.From,  ': The number is ', direction,  ' than ' + guess, '. ', question].join(''));

    // Ask the user again.
    response
        .getDigits({
            action: ['guess', min, max, newGuess],
            numDigits: 1,
            validDigits: '*#0',
            finishOnKey: '123456789',
            timeout: 45
        }, function() {
            response.speak(question)
        })
        .speak("I didn't catch that. Goodbye.")
        .send();
})
.on('hangup', function(params) {
    console.log('call ended with: ' + params.From);
    console.log(params);
});
```

## Documentation

More documentation is on the way! For now, partial documentation is [available here](http://joeblynch.github.com/plivode).