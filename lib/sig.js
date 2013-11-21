/* Copyright (c) 2012 Joe Lynch <yhf@ncsc.io>, http://plivode.ncsc.io/
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */

var _ = require('underscore');

module.exports = function(args, sigs) {
    _.each(sigs, function(cb, sig) {
        if (sig.length !== args.length) {
            return;
        }

        var isMatch = _.all(sig.split(''), function(sigParam, index) {
            var param = args[index],
                type = typeof param;

            switch (sigParam) {
                case '?': return true;
                case '-': return param === null;
                case '0': return param === null;
                case 'u': return param === undefined;
                case 'a': return Array.isArray(param);
                case 'd': return param instanceof Date;
                case 's': return type === 'string';
                case 'n': return type === 'number';
                case 'f': return type === 'function';
                case 'o': return type === 'object';
            }

            return false;
        });

        if ( isMatch ) {
            cb();
        }
    });
};
