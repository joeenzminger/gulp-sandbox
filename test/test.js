var assert = require('assert');
var env = require('../index.js');
describe('minigulp', function () {
    describe('#task', function () {
        it('should return a promise', function () {
            var ret = env.task(function () {
            });
            assert(ret.then && typeof (ret.then) === 'function');
        });
    });
    describe('#gulp', function () {
        it ('should run', function () {
            var inst = env.gulp();
            inst.task('build', function () {
                console.log('building');
            });
            inst.task('deploy', ['build'], function () {
                console.log('deploying');
            });
            inst.run('deploy').then(function () {
                console.log('finished');
            },
            function (err) {
                console.log('err: ' + err);
            });
        });
        it('should run', function () {
            var inst = env.gulp();
            inst.task('default', function () {
                console.log('default task');
            });
            inst.run().then(function () {
                console.log('finished');
            }, function (err) {
                console.log('err: ' + err);
            });
        });
        it('should error', function () {
            var inst = env.gulp();
            inst.task('build', function () {
                console.log('building');
            });
            inst.task('deploy', ['build'], function () {
                throw new Error("test");
            });
            inst.run('deploy').then(function () {
                console.log('finished');
            },
            function (err) {
                console.log('err: ' + JSON.stringify(err));
            })
        });
        it('should run all tasks', function () {
            var inst = env.gulp();
            inst.task('a', ['b', 'c'], function () {
                console.log('a');
            });

            inst.task('b', ['c'], function () {
                console.log('b');
            });

            inst.task('c', function () {
                console.log('c');
            });

            inst.task('d', function () {
                console.log('d');
            });
            inst.exec().then(function () {
                console.log('success');
            }, function (err) {
                console.log(err);
            });
        });
        it('should load gulpfile', function () {
            var inst = env.gulp();
            inst.load('./gulpfile', module);
            inst.run('default').then(function () {
                console.log('finished');
            },
            function (err) {
                console.log('err: ' + JSON.stringify(err));
            })
        });
        it('should error', function () {
        	var inst = env.gulp();
        	inst.error({
				errorMessage: 'test error'
        	}).then(function () {
        	}, function (err) {
        		console.log(err);
        	});
        });
    });
});

