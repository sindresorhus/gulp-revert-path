import path from 'path';
import test from 'ava';
import through from 'through2';
import Vinyl from 'vinyl';
import revertFile from '.';

test.cb('reverts the path to the previous one', t => {
	const s = through.obj((file, encoding, callback) => {
		t.is(path.extname(file.path), '.foo');
		file.extname = '.bar';
		t.is(path.extname(file.path), '.bar');
		t.is(file.history.length, 2);
		callback(null, file);
	});

	s.pipe(revertFile()).pipe(through.obj((file, encoding, callback) => {
		t.is(path.extname(file.path), '.foo');
		t.is(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
		callback();
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
	const s = through.obj((file, encoding, callback) => {
		t.is(path.extname(file.path), '.foo');
		file.extname = '.bar';
		t.is(path.extname(file.path), '.bar');
		file.extname = '.baz';
		t.is(path.extname(file.path), '.baz');
		t.is(file.history.length, 3);
		callback(null, file);
	});

	s.pipe(revertFile(2)).pipe(through.obj((file, encoding, callback) => {
		t.is(path.extname(file.path), '.foo');
		t.is(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
		callback();
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
	const s = through.obj((file, encoding, callback) => {
		t.is(path.extname(file.path), '.foo');
		t.deepEqual(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
		callback(null, file);
	});

	s.pipe(revertFile()).pipe(through.obj((file, encoding, callback) => {
		t.is(path.extname(file.path), '.foo');
		t.deepEqual(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
		callback();
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
	const s = through.obj((file, encoding, callback) => {
		t.is(path.extname(file.path), '.foo');
		file.extname = '.bar';
		t.is(path.extname(file.path), '.bar');
		file.extname = '.baz';
		t.is(path.extname(file.path), '.baz');
		t.is(file.history.length, 3);
		callback(null, file);
	});

	s.pipe(revertFile(100)).pipe(through.obj((file, encoding, callback) => {
		t.is(path.extname(file.path), '.foo');
		t.deepEqual(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
		callback();
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
	const s = through.obj((file, encoding, callback) => {
		if (path.basename(file.path).startsWith('fixture')) {
			t.is(path.extname(file.path), '.foo');
			file.extname = '.bar';
			t.is(path.extname(file.path), '.bar');
			file.extname = '.baz';
			t.is(path.extname(file.path), '.baz');
			file.extname = '.qux';
			t.is(path.extname(file.path), '.qux');
		} else {
			t.is(path.extname(file.path), '.corge');
			file.extname = '.grault';
			t.is(path.extname(file.path), '.grault');
			file.extname = '.garply';
			t.is(path.extname(file.path), '.garply');
		}

		t.is(file.history.length, path.basename(file.path).startsWith('fixture') ? 4 : 3);

		callback(null, file);
	});

	s.pipe(revertFile(1)).pipe(through.obj((file, encoding, callback) => {
		t.is(path.extname(file.path), path.basename(file.path).startsWith('mixture') ? '.grault' : '.baz');
		callback(null, file);
	})).pipe(revertFile(1)).pipe(through.obj((file, encoding, callback) => {
		t.is(path.extname(file.path), path.basename(file.path).startsWith('mixture') ? '.corge' : '.bar');
		callback(null, file);
	})).pipe(revertFile(1)).pipe(through.obj((file, encoding, callback) => {
		t.is(path.extname(file.path), path.basename(file.path).startsWith('mixture') ? '.corge' : '.foo');
		callback();
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
