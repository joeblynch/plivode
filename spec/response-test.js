var buster = require('buster');
var sinon = require('sinon');

var Response = require('../lib/response');

buster.testCase("Response", {
    setUp: function() {
      this.app = {
        _getCallbackUrl: function(url) { return url; }
      };
      this.res = {};
      this.response = new Response(this.res, this.app);
      this.spies = {};
      this.spies._getCallbackUrl = sinon.spy(this.app,'_getCallbackUrl');
      this.spies._add = sinon.spy(this.response,'_add');
    },

    "initialize": function() {
      buster.assert.equals(this.response._app, this.app);
      buster.assert.equals(this.response._res, this.res);
      buster.assert.equals(this.response._buf, []);
    },

    "conference": function() {
      this.response.conference("ROOM",{callback: 'cb', action: 'action'} );
      buster.assert.equals(2,this.spies._getCallbackUrl.callCount);
      buster.assert.equals(1,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><Conference callback="cb" action="action" callbackUrl="cb">ROOM</Conference></Response>',
        this.response.toString()
      );
    },

    "dialNumber": function() {
      this.response.dialNumber("0005551234",{ dial: "opt"}, { number: "opt"} );
      buster.assert.equals(2,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><Dial dial="opt"><Number number="opt">0005551234</Number></Dial></Response>',
        this.response.toString()
      );
    },

    "dialUser": function() {
      this.response.dialNumber("sip:0005551234",{ dial: "opt"}, { user: "opt"} );
      buster.assert.equals(2,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><Dial dial="opt"><Number user="opt">sip:0005551234</Number></Dial></Response>',
        this.response.toString()
      );
    },

    "dialBulk": function() {

    },

    "getDigits": function() {

    },

    "hangup": function() {

    },

    "message": function() {

    },

    "play": function() {

    },

    "preAnswer": function() {

    },

    "record": function() {

    },

    "speak": function() {

    },

    "wait": function() {

    },

    "dtmf": function() {

    },

    "send": function() {

    },

    "toString": function() {

    },

    "_add": function() {

    },

    "_xmlEncode": function() {

    }
});
