const assert = require('assert');
const sandbox = require('../index.js');

describe('gulp-sandbox', function () {
    describe('gulp()', function () {
        it('should provide sandbox object for callback', function () {
            let task = undefined;

            const cb = function () {
                task = this.task;
            };

            sandbox.gulp(cb);
            assert.notEqual(task, undefined);
        });

        it('should provide sandbox object in callback param', function () {
            let queue1 = undefined;

            const cb = function (queue) {
                queue1 = queue;
            };

            sandbox.gulp(cb);
            assert.notEqual(queue1, undefined);
        });

        it('should provide new sandbox object in callback', function () {
            let queue1 = undefined;
            let queue2 = undefined;

            const cb1 = function (queue) {
                queue1 = queue;
            };

            const cb2 = function (queue) {
                queue2 = queue;
            };

            sandbox.gulp(cb1);
            sandbox.gulp(cb2);
            assert.notEqual(queue1, queue2);
        });

        it('should load gulpfile', function (done) {
            const inst = sandbox.gulp();

            inst.load('./gulpfile', module);

            inst.run('default')
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('should error', function (done) {
            const inst = sandbox.gulp();

            inst.error({
                errorMessage: 'test error'
            }).catch(() => {
                // received error, good
                assert.ok(true);
                done();
            });
        });
    });

    describe('Sandbox', function () {
        describe('task()', function () {
            it('should return a promise', function () {
                const ret = sandbox.task(function () {});
                assert(ret.then && typeof (ret.then) === 'function');
            });
        });

        describe('run()', function () {
            it('should run a task with a dependency', function (done) {
                const inst = sandbox.gulp();
                let build = false;

                inst.task('build', function () {
                    build = true;
                });

                inst.task('deploy', ['build'], function () {
                    // no op
                });

                inst.run('deploy')
                    .then(() => {
                        assert.equal(build, true);
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });

            it('should run the default task for run()', function (done) {
                const inst = sandbox.gulp();
                let defaultTaskRan = false;

                inst.task('default', function () {
                    defaultTaskRan = true;
                });

                inst.run()
                    .then(() => {
                        assert.equal(defaultTaskRan, true);
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });

            it('should bubble up error', function (done) {
                const inst = sandbox.gulp();

                inst.task('build', function () {
                    // no op
                });

                inst.task('deploy', ['build'], function () {
                    throw new Error("test");
                });

                inst.run('deploy')
                    .then(() => {
                        done('Error: did not throw');
                    })
                    .catch(() => {
                        // error thrown
                        assert.ok(true);
                        done();
                    });
            });
        });

        describe('runAll()', function () {
            it('should run all tasks only once', function (done) {
                const inst = sandbox.gulp();
                const taskExecutionCount = {
                    a: 0,
                    b: 0,
                    c: 0,
                    d: 0,
                };

                inst.task('a', ['b', 'c'], function () {
                    taskExecutionCount['a']++;
                });

                inst.task('b', ['c'], function () {
                    taskExecutionCount['b']++;
                });

                inst.task('c', function () {
                    taskExecutionCount['c']++;
                });

                inst.task('d', function () {
                    taskExecutionCount['d']++;
                });

                inst.runAll()
                    .then(() => {
                        const tasksExecutedMoreThanOnce = Object.keys(taskExecutionCount).filter((task) => taskExecutionCount[task] > 1);
                        assert.ok(tasksExecutedMoreThanOnce.length === 0);
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });
        });

        describe('linkedInstance()', function () {
            it('should run child instance\'s tasks from parent instance', function (done) {
                const sb = sandbox.gulp();
                let childTaskRun = false;

                sb.task('parent', function () {
                    // no op
                });

                const child = sb.linkedInstance();
                child.task('child', function () {
                    childTaskRun = true;
                });

                sb.runAll()
                    .then(() => {
                        assert.equal(childTaskRun, true);
                        return done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });
        });

        describe('exec()', function () {
            it('should run all tasks only once', function (done) {
                const inst = sandbox.gulp();
                const taskExecutionCount = {
                    a: 0,
                    b: 0,
                    c: 0,
                    d: 0,
                };

                inst.task('a', ['b', 'c'], function () {
                    taskExecutionCount['a']++;
                });

                inst.task('b', ['c'], function () {
                    taskExecutionCount['b']++;
                });

                inst.task('c', function () {
                    taskExecutionCount['c']++;
                });

                inst.task('d', function () {
                    taskExecutionCount['d']++;
                });

                inst.exec()
                    .then(() => {
                        const tasksExecutedMoreThanOnce = Object.keys(taskExecutionCount).filter((task) => taskExecutionCount[task] > 1);
                        assert.ok(tasksExecutedMoreThanOnce.length === 0);
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });
        });

        describe('all()', function () {
            it('should return an object', function () {
                const inst = sandbox.gulp();

                inst.task('build', function () {
                    // noop
                });

                const result = inst.all();

                assert.strictEqual(typeof(result), 'object');
            });

            describe('all().then', function () {
                it('should be a function', function () {
                    const inst = sandbox.gulp();

                    inst.task('build', function () {
                        // noop
                    });

                    const result = inst.all();

                    assert.strictEqual(typeof(result.then), 'function');
                });
            });

            describe('all().push', function () {
                it('should be a function', function () {
                    const inst = sandbox.gulp();

                    inst.task('build', function () {
                        // noop
                    });

                    const result = inst.all();

                    assert.strictEqual(typeof(result.push), 'function');
                });
            });

            describe('all().exec', function () {
                it('should be a function', function () {
                    const inst = sandbox.gulp();

                    inst.task('build', function () {
                        // noop
                    });

                    const result = inst.all();

                    assert.strictEqual(typeof(result.exec), 'function');
                });
            });

            describe('all().callback', function () {
                it('should be a function', function () {
                    const inst = sandbox.gulp();

                    inst.task('build', function () {
                        // noop
                    });

                    const result = inst.all();

                    assert.strictEqual(typeof(result.callback), 'function');
                });
            });
        });
    });
});
