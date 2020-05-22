"use strict";

const gulp = require('gulp');
const assert = require('assert').ok;
const util = require('util');
const Module = require('module');
const uuid = require('uuid');
const Orchestrator = require('orchestrator');

class Sandbox extends gulp.Gulp {
	constructor(callback) {
		super();
		this.orchestrator = new Orchestrator();
		this.callback(callback);
	}

	/**
	 * Runs all tasks passed into the arguments list.
	 * Runs the default task if no arguments specified.
	 *
	 * @returns {function} Returns a Promise.
	 */
	run() {
		return new Promise((resolve, reject) => {
			const tasks = arguments.length ? [...arguments] : ['default'];

			this.orchestrator.start(...tasks, (err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	}

	/**
	 * Runs all registered tasks.
	 *
	 * @returns {function} Returns a Promise.
	 */
	runAll() {
		return new Promise((resolve, reject) => {
			this.orchestrator.start((err) => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	}

	/**
	 * Registers a task (with optional dependencies) to execute.
	 *
	 * @param {string} name The name of the task.
	 * @param {string[]} dependencies Optional. The array of task dependencies.
	 * @param {function} fn The function to execute.
	 *
	 * @returns {object} Task registrar for chaining.
	 */
	task(name, dependencies, fn) {
		return this.orchestrator.add(name, dependencies, fn);
	}

	/**
	 * Deprecated. Use runAll() instead.
	 *
	 * @returns {function} Returns a Promise.
	 */
	exec() {
		return this.runAll();
	}

	/**
	 * Loads a gulpfile
	 *
	 * @param {string} path The path of the file.
	 * @param {object} parent The module object.
	 */
	load(path, parent) {
		const that = this;
		assert(path, 'missing path');
		assert(util.isString(path), 'path must be a string');
		parent = parent || require.main;

		const filename = Module._resolveFilename(path, parent);
		const gulpfile = new Module(filename, parent);
		const base = gulpfile.require;

		gulpfile.require = function (request) {
			if (request === 'gulp') {
				return that;
			}
			return base(request);
		}

		gulpfile.load(filename);
		return gulpfile.exports;
	}

	/**
	 * Allows you to throw an error to stop a flow from continuing.
	 *
	 * @param {object} err The error to throw.
	 *
	 * @returns {function} Returns a Promise.
	 */
	error(err) {
		const errorInstance = new Sandbox();

		errorInstance.task('error', () => {
			throw err;
		});

		return errorInstance.runAll();
	};

	/**
	 * Callback function to allow for `this` inside of your callback function
	 * to refer to the sandbox instance.
	 *
	 * @param {function} cb The callback function.
	 */
	callback(cb) {
		if (cb) {
			cb.call(this, this);
		}
	}

	/**
	 * Registers all tasks and dependencies.
	 * Each task registered will be assigned the same set of dependencies provided.
	 *
	 * @param {function[]} tasks Array of functions to register.
	 * @param {string[]} dependencies Array of strings for dependencies.
	 *
	 * @returns {object} A psuedo sandbox object with limited functionality.
	 */
	all(tasks, dependencies) {
		const all = [];

		const then = (name, task) => {
			this.task(name, all, task);
			return this;
		};

		const push = function (task) {
			const id = uuid.v1();
			all.push(id);
			this.task(id, dependencies || [], task);
		}

		if (tasks && tasks.length) {
			for (let i = 0; i < tasks.length; ++i) {
				push(tasks[i]);
			}
		}

		const ret = {
			then: then,
			push: push,
			exec: this.exec(),
			callback: (cb) => {
				if (cb) {
					cb.call(ret, ret);
				}
				return ret;
			}
		};

		return ret;
	}

	/**
	 * Deprecated. Use linkedInstance() instead.
	 *
	 * @param {string[]} dependencies Array of dependencies. Defaults to an empty array.
	 *
	 * @returns {object} The new instance of Sandbox.
	 */
	new(dependencies = []) {
		return this.linkedInstance(dependencies);
	};

	/**
	 * Creates a child instance of Sandbox. When the parent instance executes
	 * its tasks, the child instance's tasks will also be run.
	 *
	 * @param {string[]} dependencies Array of dependencies. Defaults to an empty array.
	 *
	 * @returns {object} The new instance of Sandbox.
	 */
	linkedInstance(dependencies = []) {
		const sb = new Sandbox();

		this.task(uuid.v1(), dependencies, function () {
			return sb.runAll();
		});

		return sb;
	}
}

const sandbox = function (callback) {
	return new Sandbox(callback);
}

/**
 * Creates a new instance of Sandbox.
 */
module.exports.gulp = sandbox;

/**
 * Takes a task with no dependencies and runs it immediately.
 *
 * @param {function} task The task to run.
 *
 * @returns {function} Returns a promise.
 */
module.exports.task = function (task) {
	var instance = sandbox();
	instance.task('default', task);
	return instance.run();
};
