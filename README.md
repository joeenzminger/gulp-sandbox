Using node, when you 

```
var gulp = require('gulp');
```

the instance of gulp that is returned is global to the node process.  This usually isn't a problem when you use gulp 
from the command line, but if you are trying to invoke it as part of a larger library having a single global gulp instance
that is shared across the process can be a problem.  For instance, if you have two libraries that define tasks, if they
use the same name for the task one will overrwite the other.

Minigulp solves that problem by providing you with a way to run multiple isolated instances of gulp (or more specifically,
the gulp orchestrator) in your process.

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




