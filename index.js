"use strict";
//If this code looks familiar, it should!  It is a modified version of the gulp orchestrator's runTask module.  
var q = require('q');
var eos = require('end-of-stream');
var consume = require('stream-consume');

exports.task = function (task) {
    var ret, defer = q.defer();
    try {
        ret = task(function (err, result) {
            err ? defer.reject(err) : defer.resolve(result);
        });
    } catch (err) {
        defer.reject(err);
    }

    if (ret && typeof r.then === 'function') {
        // wait for promise to resolve
        // FRAGILE: ASSUME: Promises/A+, see http://promises-aplus.github.io/promises-spec/
        return ret;
    } else if (ret && typeof r.pipe === 'function') {
        // wait for stream to end

        eos(ret, { error: true, readable: ret.readable, writable: ret.writable && !ret.readable }, function (err) {
            err ? defer.reject(err) : defer.resolve();
        });

        // Ensure that the stream completes
        consume(ret);

    } else if (task.length === 0) {
        // synchronous, function took in args.length parameters, and the callback was extra
        defer.resolve(ret);
    }
    else {
        defer.resolve(ret)
    }
    return defer.promise;
};