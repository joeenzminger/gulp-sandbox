"use strict";
var gulp = require('gulp');
var Q = require('q');
var assert = require('assert').ok;
var util = require('util');
var Module = require('module');
var uuid = require('uuid');

var handlers = {};

var $emit = function (evt, data) {
	if (handlers[evt]) {
		for (var i = 0; i < handlers[evt].length; ++i) {
			handlers[evt][i](data);
		}
	}

	if (handlers['all']) {
		for (var i = 0; i < handlers['all'].length; ++i) {
			handlers['all'][i](evt, data);
		}
	}
}

var sandbox = function () {
    let that = new gulp.constructor();
   
    that.run = function () {
        let defer = Q.defer();
        var tasks = arguments.length ? arguments : ['default'];

        that.on('stop', function (e) {
            defer.resolve(e);
        });
        that.on('err', function (e) {
        	$emit('error', e);
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

    that.new = function (dependencies) {
    	var sb = new sandbox();
    	that.task(uuid.v1(), dependencies || [], function () {
    		return sb.exec();
    	});
    	return sb;
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


sandbox.$on = function (evt, handler) {
	if (typeof (handler) === 'function') {
		handlers[evt] = handlers[evt] || [];
		var h = function (data) {
			try {
				handler(data);
			} catch (ex) {
			}
		};
		handlers[evt].push(h);
		return function () {
			var index = handlers[evt].indexOf(h);
			if (index > -1) {
				handlers[evt].splice(index, 1);
			}
		};
	}
	return function () {
	};
}

sandbox.$all = function (handler) {
	if (typeof (handler) === 'function') {
		handlers['all'] = handlers['all'] || [];
		var h = function (evt, data) {
			try {
				handler(evt, data);
			} catch (ex) {
			}
		};
		handlers['all'].push(h);
		return function () {
			var index = handlers[evt].indexOf(h);
			if (index > -1) {
				handlers[evt].splice(index, 1);
			}
		};
	}
	return function () {
	};
}



module.exports.gulp = sandbox;

module.exports.task = function (task) {
	var instance = sandbox();
	instance.task('default', task);
    return instance.run();
};
