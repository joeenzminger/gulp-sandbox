This module allows you to run gulp code outside of gulp (i.e. directly in node.js).  It is basically a slight 
modification of the orchestrator's runTask library.  

```javascript
var minigulp = require('minigulp');
minigulp.task(function(){
	return gulp.src('/pathToFiles/*')
		.pipe(gulp.dest());
}).then(function() {
	console.log('task finished');
}, function(err){
	console.log('task error!');
});
```

Note:  if you don't return anything from your task or return something other than a stream or promise, 
the promise will be resolved immediately (i.e, a synchronous task).  Similar to how the 
orchestrator loses the ability to determine if your task is finished in this case, minigulp doesn't know how to monitor
for completion if you don't return a value.

A second mode of operation creates a non-global instance of gulp.  You can add tasks to this instance and call run 
this version returns a promise.

```
var minigulp = require('minigulp');
var inst = minigulp.gulp();
inst.task('build', function(){
    //do some gulpy stuff
});
inst.task('deploy', ['build'], function(){
	//do some gulpy stuff
});

inst.run('deploy').then(function(){
	//it worked!
},function(err){
	//it didn't
});
```

The motivation behind doing this is that if you are using node, you might want to have more than one gulp instance 
running the same set of tasks but with different data.


