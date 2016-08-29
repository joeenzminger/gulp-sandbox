"use strict";
var gulp = require('gulp');
var q = require('Q');
var assert = require('assert').ok;
var util = require('util');
var Module = require('module');

var sandbox = function () {
    let that = new gulp.constructor();
   
    that.run = function () {
        let defer = q.defer();
        var tasks = arguments.length ? arguments : ['default'];

        that.on('stop', function (e) {
            defer.resolve(e);
        });
        that.on('err', function (e) {
            defer.reject(e);
        });
        that.start.apply(that, tasks);
        return defer.promise;
    };
    that.load = function (path, parent) {
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
                return that;
            }
            return base(request);
        }
        gulpfile.load(filename);
        return gulpfile.exports;
    };

    that.error = function (err) {
    	var errorInstance = new sandbox();
    	errorInstance.task('error', function () {
    		throw err;
    	});
    	return errorInstance.exec();
    }
    
    that.exec = function () {
        var tasks = {};
        for (let i in that.tasks) {
            tasks[i] = true;
        }

        for (let i in that.tasks) {
            var task = that.tasks[i];
            var dependencies = task.dep;
            dependencies.forEach(function (dependency) {
                if (tasks[dependency]) {
                    delete tasks[dependency];
                }
            });
        }

        var run = [];
        for (var i in tasks) {
            run.push(i);
        }

        return that.run(run);
    }
    return that;
};

module.exports.gulp = sandbox;

module.exports.task = function (task) {
    var instance = sandbox();
    instance.task('default', function (cb) {
        return task(function (err, result) {
            cb(err, result);
        }, instance);
    });
    return instance.run();
};
