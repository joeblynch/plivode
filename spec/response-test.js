var buster = require('buster');
var sinon = require('sinon');

var Response = require('../lib/response');

buster.testCase("Response", {
    setUp: function() {
      this.app = {
        _getCallbackUrl: function(url) { return url; },
        _absoluteUrl: function(url) { return url; }
      };
      this.res = {
        header: function() {},
        send: function() {}
      };
      this.response = new Response(this.res, this.app);
      this.spies = {};
      this.spies._getCallbackUrl = sinon.spy(this.app,'_getCallbackUrl');
      this.spies._add = sinon.spy(this.response,'_add');
      this.spies.header = sinon.spy(this.res,'header');
      this.spies.send = sinon.spy(this.res,'send');
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
      this.response.dialBulk(["sip:0005551234","15551231234"],{ dial: "opt"} );
      buster.assert.equals(3,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><Dial dial="opt"><User>sip:0005551234</User><Number>15551231234</Number></Dial></Response>',
        this.response.toString()
      );
    },

    "getDigits": function() {
      this.response.getDigits({action:'action'},"Enter Digits");
      buster.assert.equals(1,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><GetDigits action="action">Enter Digits</GetDigits></Response>',
        this.response.toString()
      );
    },

    "hangup": function() {
      this.response.hangup({action:'action'});
      buster.assert.equals(1,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><Hangup action="action" /></Response>',
        this.response.toString()
      );
    },

    "message": function() {
      this.response.message("source","dest","message");
      buster.assert.equals(1,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><Message src="source" dest="dest">message</Message></Response>',
        this.response.toString()
      );
    },

    "play": function() {
      this.response.play("/play.mp3",{play:"opt"});
      buster.assert.equals(1,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><Play play="opt">/play.mp3</Play></Response>',
        this.response.toString()
      );
    },

    "preAnswer": function() {
      this.response.preAnswer("preanswered");
      buster.assert.equals(1,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><PreAnswer>preanswered</PreAnswer></Response>',
        this.response.toString()
      );
    },

    "record": function() {
      this.response.record({action:"action"});
      buster.assert.equals(1,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><Record action="action" /></Response>',
        this.response.toString()
      );
    },

    "redirect": function() {
      this.response.redirect('redirect',{opt:"value"});
      buster.assert.equals(1,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><Redirect opt="value">redirect</Redirect></Response>',
        this.response.toString()
      );
    },

    "speak": function() {
      this.response.speak("Hello World", {action:"action"});
      buster.assert.equals(1,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><Speak action="action">Hello World</Speak></Response>',
        this.response.toString()
      );
    },

    "wait": function() {
      this.response.wait(100);
      buster.assert.equals(1,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><Wait length="100" /></Response>',
        this.response.toString()
      );
    },

    "dtmf": function() {
      this.response.dtmf(1234);
      buster.assert.equals(1,this.spies._add.callCount);
      buster.assert.equals(
        '<Response><DTMF>1234</DTMF></Response>',
        this.response.toString()
      );
    },

    "send with internal resource": function() {
      this.response.send();
      buster.assert(this.spies.header.withArgs('Content-Type','text/xml'));
      buster.assert.equals(1,this.spies.send.callCount);
    },

    "send with passed resource": function() {
      var res = {
        header: function() {},
        send: function() {}
      };
      headerSpy = sinon.spy(res,'header');
      sendSpy = sinon.spy(res,'send');
      this.response.send(res);
      buster.assert(headerSpy.withArgs('Content-Type','text/xml'));
      buster.assert.equals(1,sendSpy.callCount);
    },

    "toString empty buffer": function() {
      buster.assert.equals('<Response></Response>',this.response.toString());
    },

    "toString buffered items": function() {
      this.response._buf = ['<Test>','body','</Test>'];
      buster.assert.equals('<Response><Test>body</Test></Response>',this.response.toString());
    },

    "_add no attributes or body": function() {
      this.response._add(this.response,"Test");
      buster.assert.equals(['<','Test',' />'],this.response._buf);
    },

    "_add with attributes, no body": function() {
      this.response._add(this.response,"Test",{k:"v"});
      buster.assert.equals(['<','Test',' ','k','="','v','"',' />'],this.response._buf);
    },

    "_add with attributes, string body": function() {
      this.response._add(this.response,"Test",{k:"v"},"Message");
      buster.assert.equals(['<','Test',' ','k','="','v','"','>','Message','</','Test','>'],this.response._buf);
    },

    "_add with attributes, function body": function() {
      var mock = sinon.mock();
      this.response._add(this.response,"Test",{k:"v"},mock);
      buster.assert.equals(['<','Test',' ','k','="','v','"','>','</','Test','>'],this.response._buf);
      buster.assert.equals(1,mock.withArgs(this.response).callCount);
    },

    "_xmlEncode": function() {
      buster.assert.equals("&lt;&gt;&quot;&apos;&amp;",this.response._xmlEncode("<>\"'&"));
    }
});
