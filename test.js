import path from 'path';
import test from 'ava';
import through from 'through2';
import replaceExt from 'replace-ext';
import Vinyl from 'vinyl';
import m from '.';

test.cb('reverts the path to the previous one', t => {
	const s = through.obj((file, enc, cb) => {
		t.is(path.extname(file.path), '.foo');
		file.path = replaceExt(file.path, '.bar');
		t.is(path.extname(file.path), '.bar');
		t.is(file.history.length, 2);
		cb(null, file);
	});

	s.pipe(m()).pipe(through.obj((file, enc, cb) => {
		t.is(path.extname(file.path), '.foo');
		t.is(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
		cb();
	}));

	s.on('end', t.end);

	s.end(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.foo'),
		contents: Buffer.from('')
	}));
});

test.cb('reverts the path to the previous two', t => {
	const s = through.obj((file, enc, cb) => {
		t.is(path.extname(file.path), '.foo');
		file.path = replaceExt(file.path, '.bar');
		t.is(path.extname(file.path), '.bar');
		file.path = replaceExt(file.path, '.baz');
		t.is(path.extname(file.path), '.baz');
		t.is(file.history.length, 3);
		cb(null, file);
	});

	s.pipe(m(2)).pipe(through.obj((file, enc, cb) => {
		t.is(path.extname(file.path), '.foo');
		t.is(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
		cb();
	}));

	s.on('end', t.end);

	s.end(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.foo'),
		contents: Buffer.from('')
	}));
});

test.cb('successfully processes files with unmodified paths', t => {
	const s = through.obj((file, enc, cb) => {
		t.is(path.extname(file.path), '.foo');
		t.deepEqual(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
		cb(null, file);
	});

	s.pipe(m()).pipe(through.obj((file, enc, cb) => {
		t.is(path.extname(file.path), '.foo');
		t.deepEqual(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
		cb();
	}));

	s.on('end', t.end);

	s.end(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.foo'),
		contents: Buffer.from('')
	}));
});

test.cb('reverts as much as possible', t => {
	const s = through.obj((file, enc, cb) => {
		t.is(path.extname(file.path), '.foo');
		file.path = replaceExt(file.path, '.bar');
		t.is(path.extname(file.path), '.bar');
		file.path = replaceExt(file.path, '.baz');
		t.is(path.extname(file.path), '.baz');
		t.is(file.history.length, 3);
		cb(null, file);
	});

	s.pipe(m(100)).pipe(through.obj((file, enc, cb) => {
		t.is(path.extname(file.path), '.foo');
		t.deepEqual(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
		cb();
	}));

	s.on('end', t.end);

	s.end(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.foo'),
		contents: Buffer.from('')
	}));
});

test.cb('reverts paths for differently deep files', t => {
	const s = through.obj((file, enc, cb) => {
		if (path.basename(file.path).startsWith('fixture')) {
			t.is(path.extname(file.path), '.foo');
			file.path = replaceExt(file.path, '.bar');
			t.is(path.extname(file.path), '.bar');
			file.path = replaceExt(file.path, '.baz');
			t.is(path.extname(file.path), '.baz');
			file.path = replaceExt(file.path, '.qux');
			t.is(path.extname(file.path), '.qux');
		} else {
			t.is(path.extname(file.path), '.corge');
			file.path = replaceExt(file.path, '.grault');
			t.is(path.extname(file.path), '.grault');
			file.path = replaceExt(file.path, '.garply');
			t.is(path.extname(file.path), '.garply');
		}

		t.is(file.history.length, path.basename(file.path).startsWith('fixture') ? 4 : 3);

		cb(null, file);
	});

	s.pipe(m(1)).pipe(through.obj((file, enc, cb) => {
		t.is(path.extname(file.path), path.basename(file.path).startsWith('mixture') ? '.grault' : '.baz');
		cb(null, file);
	})).pipe(m(1)).pipe(through.obj((file, enc, cb) => {
		t.is(path.extname(file.path), path.basename(file.path).startsWith('mixture') ? '.corge' : '.bar');
		cb(null, file);
	})).pipe(m(1)).pipe(through.obj((file, enc, cb) => {
		t.is(path.extname(file.path), path.basename(file.path).startsWith('mixture') ? '.corge' : '.foo');
		cb();
	}));

	s.on('end', t.end);

	s.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/mixture.corge'),
		contents: Buffer.from('')
	}));

	s.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.foo'),
		contents: Buffer.from('')
	}));

	s.end();
});
