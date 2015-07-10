# gulp-revert-path [![Build Status](https://travis-ci.org/sindresorhus/gulp-revert-path.svg?branch=master)](https://travis-ci.org/sindresorhus/gulp-revert-path)

> Revert the previous `file.path` change

Many plugins change the `file.path` somehow. Most commenly the file extension. For example `gulp-babel` changes `.jsx` extensions to `.js` since it compiles JSX. Sometimes that's undesirable though. This plugin makes it easy to revert the path change.


## Install

```
$ npm install --save-dev gulp-revert-path
```


## Usage

```js
var gulp = require('gulp');
var babel = require('gulp-babel');
var revertPath = require('gulp-revert-path');

gulp.task('default', function () {
	return gulp.src('src/app.jsx')
		.pipe(babel())       // file.path => src/app.js
		.pipe(revertPath())  // file.path => src/app.jsx
		.pipe(gulp.dest('dist'));
});
```


## Related

- [vinyl-paths](https://github.com/sindresorhus/vinyl-paths) - Get the file paths in a vinyl stream


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
