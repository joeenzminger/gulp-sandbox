"use strict";
var gulp = require('gulp');
var q = require('Q');
var assert = require('assert').ok;
var util = require('util');
var Module = require('module');

var minigulp = function () {
    let inst = new gulp.constructor();
    inst.run = function () {
        let defer = q.defer();
        var tasks = arguments.length ? arguments : ['default'];

        inst.on('stop', function (e) {
            defer.resolve(e);
        });
        inst.on('err', function (e) {
            defer.reject(e);
        });
        inst.start.apply(inst, tasks);
        return defer.promise;
    };
    inst.load = function (path, parent) {
        console.log('load');
        console.log(path);
        assert(path, 'missing path');
        assert(util.isString(path), 'path must be a string');
        var filename = Module._resolveFilename(path, parent);
        console.log(filename);
        var gulpfile = new Module(filename, parent);
        var base = gulpfile.require;
        gulpfile.require = function (request) {
            if (request === 'gulp') {
                return inst;
            }
            return base(request);
        }
        gulpfile.load(filename);
        return gulpfile.exports;
    };
    return inst;
};

module.exports.gulp = minigulp;

module.exports.task = function (task) {
    var instance = minigulp();
    instance.task('default', function (cb) {
        return task(function (err, result) {
            cb(err, result);
        }, instance);
    });
    return instance.run();
};
