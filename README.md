# Gulp Sandbox

In large projects or when using gulp as an orchestrator there is often a requirement to run multiple
independent gulpfiles in the same process. Gulp is designed to be a singleton and the most common
usage pattern is to invoke it from the command line. This creates a requirement that task names for
independent modules be unique - two modules cannot have a task with the same name.

Existing solutions (like gulp-chug), use exec to fork new processes to run the gulpfiles independently.
This appears to not be a popular approach for a number of reasons.

gulp-sandbox is designed to accomplish the same goal without writing complicated layers of abstraction around
the existing gulp infrastructure.It uses gulp, but it extends it to allow developers to create multiple instances
of gulp within the same process. These instances are wholly independent but run in the same process. Developers can
build task modules and invoke them in other task modules without worrying about task name collisions.

Since gulp-sandbox simply extends gulp, all of gulps existing and future functionality are and will remain
available - in fact, gulpfiles developed for gulp-sandbox will work with gulp without modification (although there are
a set of features that gulp-sandbox provides to facilitate using gulp as part of a build and deployment infrastructure
that break this abstraction - those api methods are appropriately noted).

## A basic example

```js
const sandbox = require('gulp-sandbox');
const gulp = sandbox.gulp();

gulp.task('build', function(){
    //do some gulpy stuff
});

gulp.task('deploy', ['build'], function(){
    //do some gulpy stuff
});

gulp.run('deploy')
    .then(() => {
        //it worked!
    })
    .catch((err) => {
        //it didn't
    });
```

## Stand alone tasks

Occasionally, you might find yourself wanting to run a gulp snippet outside of the orchestrator.
gulp-sandbox provides a `task()` method that allows you to do this.

```javascript
const sandbox = require('gulp-sandbox');

sandbox.task((cb, gulp) => {
        return gulp.src('/pathToFiles/*')
            .pipe(gulp.dest());
    })
    .then(() => {
        console.log('task finished');
    })
    .catch((err) => {
        console.log('task error!');
    });
```

Just like normal gulp tasks, what you return is important. Async tasks should return a stream,
promise, or invoke the provided callback.

## Using existing gulpfiles or task modules

You can use existing gulpfiles (or other modules that contain tasks), without modification.

```js
const sandbox = require('gulp-sandbox');
const gulp = sandbox.gulp();

gulp.load('./gulpfile', module);

gulp.run()
    .then(() => {
        //it worked!
    })
    .catch((err) => {
        //it didn't
    });
```

```js
const gulp = require('gulp');

gulp.task('default', () => {
    console.log('a gulpfile task!');
});
```

Note that you have to pass the module to gulp.load()

## Run all registered tasks

This is not a feature of gulp (but maybe it should be). Given a set of registered tasks, exec() finds all of
the root tasks and executes them. This guarantees that every task defined will get run once (and only once).

```js
const sandbox = require('gulp-sandbox');
const gulp = sandbox.gulp();

gulp.task('a', ['b', 'c'], function () {
    console.log('a');
});

gulp.task('b', ['c'], function () {
    console.log('b');
});

gulp.task('c', function () {
    console.log('c');
});

gulp.task('d', function () {
    console.log('d');
});

gulp.runAll()
    .then(() => {
        console.log('success');
    })
    .catch((err) => {
        console.log(err);
    });
```

Both `runAll()` and `run()` return a promise.
