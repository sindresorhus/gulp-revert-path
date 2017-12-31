# gulp-revert-path

> Revert the previous `file.path` change

Many plugins change the `file.path` somehow. Most commonly the file extension. For example `gulp-babel` changes `.jsx` extensions to `.js` since it compiles JSX. Sometimes that's undesirable though. This plugin makes it easy to revert the path change.

## Install

```sh
npm install --save-dev gulp-revert-path
```

## Usage

```js
import gulp from 'gulp';
import babel from 'gulp-babel';
import revertPath from 'gulp-revert-path';
import rename from 'gulp-rename';

export default () => (
	gulp.src('src/app.jsx')
		.pipe(babel())       // file.path => src/app.js
		.pipe(revertPath())  // file.path => src/app.jsx
		.pipe(gulp.dest('dist'))
);

export const es2015 = () => (
	gulp.src('src/app.txt')
		.pipe(rename('src/app.jsx'))  // file.path => src/app.jsx
		.pipe(babel())                // file.path => src/app.js
		.pipe(revertPath(2))          // file.path => src/app.txt
		.pipe(gulp.dest('dist'))
);
```

## API

### revertPath(reversionCount?)

#### reversionCount

Type: `number`\
Default: `1`

The number of times to revert the path.

## Related

- [vinyl-paths](https://github.com/sindresorhus/vinyl-paths) - Get the file paths in a vinyl stream
