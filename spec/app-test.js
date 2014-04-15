var buster = require('buster');
var sinon = require('sinon');

var App = require('../lib/app');

buster.testCase("App", {
    setUp: function() {
      this.params = {
        authID: 'AUTH_ID',
        authToken: 'AUTH_TOKEN',
        appID: 'APP_ID',
        rootUrl: 'http://localhost:8080',
        noListen: true
      };
    },

    "constructor: params: sets authID": function () {
      var app = new App(this.params);
      buster.assert.equals(app.authID,'AUTH_ID');
    },

    "constructor: params: requires authID": function () {
      buster.assert.exception( function() {
        delete(this.params.authID);
        var app = new App(this.params);
      });
    },

    "constructor: params: sets authToken": function() {
      var app = new App(this.params);
      buster.assert.equals(app.authToken,'AUTH_TOKEN');
    },

    "constructor: params: requires authToken": function() {
      buster.assert.exception( function() {
        delete(this.params.authToken);
        var app = new App(this.params);
      });
    },

    "constructor: params: sets appID": function() {
      var app = new App(this.params);
      buster.assert.equals(app.appID,'APP_ID');
    },

    "constructor: params: string rootUrl": function() {
      var app = new App(this.params);
      buster.assert.equals(app.rootUrl,{
        auth: null,
        hash: null,
        host: "localhost:8080",
        hostname: "localhost",
        href: "http://localhost:8080/",
        path: "/",
        pathname: "/",
        port: "8080",
        protocol: "http:",
        query: null,
        search: null,
        slashes: true
      });
    },

    "constructor: params: none string rootUrl": function() {
      this.params.rootUrl = {port: 8080, protocol: 'http' };
      var app = new App(this.params);
      buster.assert.equals(app.rootUrl,this.params.rootUrl);
    },

    "constructor: params: expressApp as app": function() {
      this.params.expressApp = { myApp: 'test' };
      var app = new App(this.params);
      buster.assert.equals(app.expressApp,this.params.expressApp);
    },

    "param calls through": function() {
      var app = new App(this.params);
      var spy = sinon.spy(app.expressApp,'param');
      var f = function() {};
      app.param('param',f);
      buster.assert(spy.withArgs('param',f).calledOnce);
    },

    "_absoluteUrl with root": function() {
      var app = new App(this.params);
      buster.assert.equals(app._absoluteUrl('http://host/path'),'http://host/path');
    },

    "_absoluteUrl without root": function() {
      var app = new App(this.params);
      buster.assert.equals(app._absoluteUrl('path'),'http://localhost:8080/path');
    },

    "_getCallbackUrl with string calls _absoluteUrl": function() {
      var app = new App(this.params);
      var spy = sinon.spy(app,'_absoluteUrl');
      var cb = app._getCallbackUrl("path");
      buster.assert(spy.calledOnce);
      buster.assert.equals("http://localhost:8080/path",cb);
    },

    "_getCallbackUrl with array": function() {
      var app = new App(this.params);
      var spy = sinon.spy(app,'_absoluteUrl');
      var cb = app._getCallbackUrl(["path","a"]);
      buster.assert(spy.calledOnce);
      buster.assert.equals("http://localhost:8080/path/a",cb);
    },

    "_getCallbackUrl with function": function() {
      var app = new App(this.params);
      var spy = sinon.spy(app,'_registerAnonymousCallback');
      var f = function() {};
      var cb = app._getCallbackUrl(f);
      buster.assert(spy.withArgs(f).calledOnce);
    },
});
