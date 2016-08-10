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
});

