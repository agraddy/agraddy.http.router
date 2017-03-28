var test = require('tape');
var response = require('agraddy.test.res');

process.chdir('test');

var router = require('../');

function home(req, res) {
	return 'home';
}
function about(req, res) {
	return 'about';
}
function error(req, res) {
	return '404';
}

router.get.routes({'/': home});
router.get.add('/about', about);

router.on('loaded', function(err) {
	test('basic routing', function(t) {
		// Set router.loaded to true once loaded has been emitted
		t.equal(router.loaded, true);

		// Test a request
		t.equal(router.handler({url: '/about', method: 'GET'}, null), 'about');

		// There are routes in the routes directory
		t.equal(Object.keys(router['get']._routes).length, 4);


		t.end();
	});

	test('missing routing', function(t) {
		// Create a fake response object to test against
		var res = response();

		// Test a none existent url
		router.handler({url: '/does-not-exist', method: 'GET'}, res);

		t.deepEqual(res._headers, [{"Content-Type": "application/json"}]);
		t.equal(res._body, '{"code": 404, "status": "error"}');

		t.end();
	});

	test('custom 404 routing', function(t) {
		router.get.add('404', error);

		// Test a none existent url
		t.equal(router.handler({url: '/does-not-exist', method: 'GET'}, null), '404');

		t.end();
	});

	test('routes directory', function(t) {
		// Test a request
		t.equal(router.handler({url: '/one', method: 'GET'}, null), 'one');

		t.end();
	});

	test('missing routing', function(t) {
		// Create a fake response object to test against
		var res = response();

		// Test a none existent url
		router.handler({url: '/does-not-exist', method: 'DOESNOTEXIST'}, res);

		t.deepEqual(res._headers, [{"Content-Type": "application/json"}]);
		t.equal(res._body, '{"code": 404, "status": "error"}');

		t.end();
	});

	test('post working', function(t) {
		// Test a request
		t.equal(router.handler({url: '/two', method: 'POST'}, null), 'two');

		t.end();
	});

	test('regex working', function(t) {
		// Test a request
		t.equal(router.handler({url: '/test/id/5', method: 'GET'}, null), 'regex');

		t.end();
	});

	test('unsafe regex should throw an error', function(t) {
		// Add an unsafe regex - it should throw an error
		try {
			router.get.add('^/about/(a+)+$', about);
		} catch(e) {
			t.equal(e.message, 'A route contains an unsafe regex. Unsafe regex allow for the possibility of a denial of service attack: https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS');
			t.end();
		}
	});

	test('ignore query variables', function(t) {
		// Test a request
		t.equal(router.handler({url: '/about?query', method: 'GET'}, null), 'about');

		t.end();
	});


	// TODO: Add a test for _overwrite.js (or maybe call it _post.js)

	// TODO: Have an option to set the timeout for auto route parsing

});

