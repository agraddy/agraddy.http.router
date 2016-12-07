var test = require('tape');

var mod = require('../');

function home(req, res) {
	return 'home';
}
function about(req, res) {
	return 'about';
}

mod.routes({'/': home});
mod.add('/about', about);

test('routing', function(t) {
	t.equal(Object.keys(mod._routes).length, 2);
	t.equal(mod.handler({url: '/about'}, null), 'about');
	t.end();
});

// Add test for 200, 404, etc: mod.add(200, default);
/*
test('failure', function(t) {
	t.equal(mod.handler({url: '/missing'}, null), 'about');
	t.end();
});
*/



