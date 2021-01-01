# gulp-revert-path

> Revert the previous `file.path` change

Many plugins change the `file.path` somehow. Most commonly the file extension. For example `gulp-babel` changes `.jsx` extensions to `.js` since it compiles JSX. Sometimes that's undesirable though. This plugin makes it easy to revert the path change.


## Install

```
$ npm install --save-dev gulp-revert-path
```


## Usage

```js
const gulp = require('gulp');
const babel = require('gulp-babel');
const revertPath = require('gulp-revert-path');
const rename = require('gulp-rename');

exports.default = () => (
	gulp.src('src/app.jsx')
		.pipe(babel())       // file.path => src/app.js
		.pipe(revertPath())  // file.path => src/app.jsx
		.pipe(gulp.dest('dist'))
);

exports.es2015 = () => (
	gulp.src('src/app.txt')
		.pipe(rename('src/app.jsx'))  // file.path => src/app.jsx
		.pipe(babel())                // file.path => src/app.js
		.pipe(revertPath(2))          // file.path => src/app.txt
		.pipe(gulp.dest('dist'))
);
```


## API

### revertPath(reversions?)

#### reversions

Type: `number`<br>
Default: `1`

Number of times to revert the path.


## Related

- [vinyl-paths](https://github.com/sindresorhus/vinyl-paths) - Get the file paths in a vinyl stream
