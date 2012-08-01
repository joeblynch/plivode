var express = require('express'),
    url = require('url'),
    EventEmitter = require('events').EventEmitter,
    ApiClient = require('./api/client'),
    Response = require('./response'),
    Compose = require('compose'),
    Base62 = require('base62');


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
            app.use(express.bodyParser());
            app.use(app.router);

            opts.expressConfigure && opts.expressConfigure(app);
        });

        var port = self.rootUrl.port || (self.rootUrl.protocol === 'https:' ? 443 : 80);
        app.listen(port);

        console.log('listening on port ' + port);

        return app;
    })();


    var _pendingAppUrls = null;

    function _updateEventAppUrl(event) {
        var rootUrl = self.rootUrl.href;

        if (!_pendingAppUrls) {
            _pendingAppUrls = {};

            // Delay the update of app urls until the next run loop, so multiple urls can be updated at once
            setTimeout(function() {
                self.Application.update(_pendingAppUrls, function() { _pendingAppUrls = null });
            }, 0);
        }

        _pendingAppUrls[event + '_url'] = rootUrl + event;
    }

    this.on('newListener', function(event) {
        var isNewRoute = _addEventRoute(self, event);

        if (isNewRoute && ~_PLIVO_APP_EVENTS.indexOf(event)) {
            _updateEventAppUrl(event);
        }
    });

    this.Application = this.Application(this.appID);
}, {
    param: function(paramName, fn) {
        this.expressApp.param(paramName, fn);
        return this;
    },

    _absoluteUrl: function(url) {
        return url.match(/\/\//) ? url : this.rootUrl.href + url;
    },

    _getCallbackUrl: function(cb) {
        if (typeof cb === "string") {
            return this._absoluteUrl(cb);
        } else if (Array.isArray(cb)) {
            return this._absoluteUrl(cb.join('/'));
        } else {
            return this._registerAnonymousCallback(cb);
        }
    },

    _ANON_RESOURCE: '/__anon__/',

    _registerAnonymousCallback: function(cb) {
        App._nextAnonCBID = ++App._nextAnonCBID || 0;

        var route = this._ANON_RESOURCE + Base62.encode(App._nextAnonCBID);

        _addEventRoute(this, route, cb);

        return this.rootUrl.href + route;
    }
});


var _PLIVO_APP_EVENTS = ['answer', 'hangup', 'message'],
    _eventRoutes = {};

function _addEventRoute(app, event, cb) {
    if (!_eventRoutes[event]) {
        _eventRoutes[event] = true;

        var route = event.match(/$\//) ? event : '/' + event;
        //TODO: set post method for url
        app.expressApp.post(route, function(req, res) {
            //TODO: need to pass things done by param fns

            if (cb) {
                cb(Compose.create(req.params, req.body), new Response(res, app));
            } else {
                app.emit(event, Compose.create(req.params, req.body), new Response(res, app));
            }
        });

        return true;
    }

    return false;
}

//TODO: Lots...