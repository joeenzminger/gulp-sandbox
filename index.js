"use strict";
var gulp = require('gulp');
var Q = require('q');
var assert = require('assert').ok;
var util = require('util');
var Module = require('module');
var uuid = require('uuid');

var sandbox = function () {
    let that = new gulp.constructor();
   
    that.run = function () {
        let defer = Q.defer();
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
        assert(path, 'missing path');
        assert(util.isString(path), 'path must be a string');
        parent = parent || require.main;
        var filename = Module._resolveFilename(path, parent);
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

    that.all = function (tasks, dependencies) {
    	var tasks = [];
    	for (var i in tasks) {
    		(function (task) {
    			var id = uuid.v1();
    			tasks.push(id);
    			that.task(id, dependencies || [], task);
    		})(tasks[i]);
    	}
    	return {
    		then: function (name, task) {
    			that.task(name, tasks, task);
    			return that;
    		}
    	}
    }

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
	instance.task('default', task);
    return instance.run();
};
