In large projects or when using gulp as an orchestrator there is often a requirement to run multiple independent gulpfiles in the same process.  Gulp is designed to be a singleton and the most common usage pattern is to invoke it from the command line.  This creates a requirement that task names for independent modules be unique - two modules cannot have a task with the same name.
﻿
Existing solutions (like gulp-chug), use exec to fork new processes to run the gulpfiles independently.  This appears to not be a popular approach for a number of reasons.

minigulp is designed to accomplish the same goal without writing complicated layers of abstraction around the existing gulp infrastructure.  It uses gulp, but it extends it to allow developers to create multiple instances of gulp within the same process.  These instances are wholly independent but run in the same process.  Developers can build task modules and invoke them in other task modules without worrying about task name collisions.  

Since minigulp simply extends gulp, all of gulps existing and future functionality are and will remain available - in fact, gulpfiles developed for minigulp will work with gulp without modification (although there are a set of features that minigulp provides to facilitate using gulp as part of a build and deployment infrastructure that break this abstraction - those api methods are appropriately noted).


*A basic example*

```
var minigulp = require('minigulp');
var gulp = minigulp.gulp();
gulp.task('build', function(){
    //do some gulpy stuff
});
gulp.task('deploy', ['build'], function(){
	//do some gulpy stuff
});

gulp.run('deploy').then(function(){
	//it worked!
},function(err){
	//it didn't
});
```

*Stand alone tasks*

Occasionally, you might find yourself wanting to run a gulp snippet outside of the orchestrator.  minigulp provides
a task() method that allows you to do this.

```javascript
var minigulp = require('minigulp');
minigulp.task(function(cb, gulp){
	return gulp.src('/pathToFiles/*')
		.pipe(gulp.dest());
}).then(function() {
	console.log('task finished');
}, function(err){
	console.log('task error!');
});
```

Just like normal gulp tasks, what you return is important. Async tasks should return a stream, promise, or invoke the provided 
callback.

*Using existing gulpfiles or task modules*

You can use existing gulpfiles (or other modules that contain tasks), without modification.  

```
var minigulp = require('minigulp');
var gulp = minigulp.gulp();
gulp.load('./gulpfile', module);
gulp.run().then(function(){
	//it worked!
},function(err){
	//it didn't
});
```

```
var gulp = require('gulp');
gulp.task('default', function() {
	console.log('a gulpfile task!');
});
```

Note that you have to pass the module to gulp.load()




