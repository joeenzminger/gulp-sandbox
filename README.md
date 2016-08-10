This module allows you to run gulp code outside of gulp (i.e. directly in node.js).  It is basically a slight 
modification of the orchestrator's runTask library.  

```javascript
var env = require('gulp-env');
env.task(function(){
	return gulp.src('/pathToFiles/*')
		.pipe(gulp.dest());
}).then(function() {
	console.log('task finished');
}, function(err){
	console.log('task error!');
});
```

Note:  if you don't return anything from your task or return something other than a stream or promise, the promise will be resolved immediately (i.e, a synchronous task).  Similar to how the 
orchestrator loses the ability to determine if your task is finished in this case, gulp-env doesn't know how to monitor
for completion if you don't return a value.

