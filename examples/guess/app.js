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