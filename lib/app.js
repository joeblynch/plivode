var express = require('express'),
    url = require('url'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    ApiClient = require('./api-client'),
    Response = require('./response'),
    Compose = require('compose');


var App = module.exports = Compose(EventEmitter, ApiClient, function(opts) {
    var self = this;

    opts.authID && (this.authID = opts.authID);
    opts.authToken && (this.authToken = opts.authToken);
    this.appID = opts.appID;
    this.rootUrl = typeof opts.rootUrl === 'string'
        ? url.parse(opts.rootUrl.match(/\/$/) ? opts.rootUrl : opts.rootUrl + '/', false, true)
        : opts.rootUrl;

    this.expressApp = opts.expressApp || (function() {
        var app = express.createServer();

        app.configure(function() {
            opts.expressConfigure && opts.expressConfigure(app);

            app.use(express.bodyParser());
            app.use(app.router);
        });

        var port = self.rootUrl.port || (self.rootUrl.protocol === 'https:' ? 443 : 80);
        app.listen(port);

        console.log('listening on port ' + port);

        return app;
    })();


    var _PLIVO_APP_EVENTS = ['answer', 'hangup', 'message'],
        _eventRoutes = {},
        _pendingAppUrls = null;

    function _addEventRoute(event) {
        if (!_eventRoutes[event]) {
            _eventRoutes[event] = true;

            var route = event.match(/$\//) ? event : '/' + event;
            //TODO: set post method for url
            self.expressApp.post(route, function(req, res) {
                //TODO: need to pass things done by param fns
                self.emit(event, Compose.create(req.params, req.body), new Response(res, self));
            });

            return true;
        }

        return false;
    }

    function _updateEventAppUrl(event) {
        var rootUrl = self.rootUrl.href;

        if (!_pendingAppUrls) {
            _pendingAppUrls = {};

            // Delay the update of app urls until the next run loop, so multiple urls can be updated at once
            setTimeout(function() {
                self.updateApp(_pendingAppUrls, function() { _pendingAppUrls = null });
            }, 0);
        }

        _pendingAppUrls[event + '_url'] = rootUrl + event;
    }

    this.on('newListener', function(event) {
        var isNewRoute = _addEventRoute(event);

        if (isNewRoute && ~_PLIVO_APP_EVENTS.indexOf(event)) {
            _updateEventAppUrl(event);
        }
    });
}, {
    call: function(fromNumber, toNumber, callback) {
        // TODO: need generic way to support both strings for callback routes, as well as fns for apps that don't need to scale.
        var callbackUrl = this.rootUrl.href + callback;
        ApiClient.prototype.call.call(this, fromNumber, toNumber, callbackUrl);
    },

    updateApp: function(urls, cb) {
        ApiClient.prototype.updateApp.call(this, this.appID, urls, cb);
        return this;
    },
    
    param: function(paramName, fn) {
        this.expressApp.param(paramName, fn);
        return this;
    }
});

//TODO: Lots...