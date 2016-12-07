var test = require('tape');

var mod = require('../');

test('overall', function(t) {
	t.equal('result', mod.main('result'));
	t.end();
});


