'use strict';
var path = require('path');
var assert = require('assert');
var gutil = require('gulp-util');
var through = require('through2');
var revertPath = require('./');

it('revert the path to the previous one', function (done) {
	var s = through.obj(function (file, enc, cb) {
		assert.strictEqual(path.extname(file.path), '.foo');
		file.path = gutil.replaceExtension(file.path, '.bar');
		assert.strictEqual(path.extname(file.path), '.bar');
		cb(null, file);
	});

	s.pipe(revertPath()).pipe(through.obj(function (file, enc, cb) {
		assert.strictEqual(path.extname(file.path), '.foo');
		assert.strictEqual(path.extname(file.history[0]), '.foo');
		cb();
	}));

	s.on('end', done);

	s.write(new gutil.File({
		cwd: __dirname,
		base: __dirname + '/fixture',
		path: __dirname + '/fixture/fixture.foo',
		contents: new Buffer('')
	}));

	s.end();
});

it('successfully processes files with unmodified paths', function (done) {
	var path = __dirname + '/fixture/fixture.foo';

	var s = through.obj(function (file, enc, cb) {
		assert.strictEqual(file.path, path);
		assert.deepEqual(file.history, [path]);
		cb(null, file);
	});

	s.pipe(revertPath()).pipe(through.obj(function (file, enc, cb) {
		assert.strictEqual(file.path, path);
		assert.deepEqual(file.history, [path]);
		cb();
	}));

	s.on('end', done);

	s.write(new gutil.File({
		cwd: __dirname,
		base: __dirname + '/fixture',
		path: path,
		contents: new Buffer('')
	}));

	s.end();
});
