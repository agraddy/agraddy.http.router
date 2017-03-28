var each = require('agraddy.async.each');
var events = require('events');
var fs = require('fs');
var path = require('path');
var safe = require('safe-regex');

var mod = new events.EventEmitter();

mod.get = {};
mod.get._routes  = {};

mod.post = {};
mod.post._routes  = {};

mod.get.add = add.bind(add, 'get');
mod.get.routes = routes.bind(routes, 'get');

mod.post.add = add.bind(add, 'post');
mod.post.routes = routes.bind(routes, 'post');

mod.config = function(input) {
	console.log('config');
}

mod.handler = function(req, res) {
	// Need to make sure auto routes are loaded before proceeding
	// Listen for loaded event if routes are immediately needed (for example, in testing)

	var method = req.method.toLowerCase();

	function handle() {
		var keys = Object.keys(mod[method]._routes);
		var i;
		var url;
		if(req.url.indexOf('?') != -1) {
			url = req.url.slice(0, req.url.indexOf('?'));
		} else {
			url = req.url;
		}

		if(keys.indexOf(url) !== -1) {
			return mod[method]._routes[url](req, res);
		} else {
			for(i = 0; i < keys.length; i++) {
				if(keys[i].slice(0, 1) === '^' && new RegExp(keys[i]).test(url)) {
					return mod[method]._routes[keys[i]](req, res);
				}
			}

			if(keys.indexOf('404') !== -1) {
				return mod[method]._routes['404'](req, res);
			} else {
				return function(req, res) {
					res.writeHead(404, {"Content-Type": "application/json"});
					res.write('{"code": 404, "status": "error"}');
					res.end();
				} (req, res);
			}
		}
	}

	if(method === 'get') {
		return handle();
	} else if(method === 'post') {
		return handle();
	} else {
		return function(req, res) {
			res.writeHead(404, {"Content-Type": "application/json"});
			res.write('{"code": 404, "status": "error"}');
			res.end();
		} (req, res);
	}
}

mod.loaded = false;

function add(method, url, func) {
	// Check if unsafe regex
	if(url.slice(0,1) === '^') {
		if(!safe(url)) {
			throw new Error('A route contains an unsafe regex. Unsafe regex allow for the possibility of a denial of service attack: https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS');
		}
	}
	mod[method]._routes[url] = func;
}

// Get routes in /routes directory on initial load
// Possibly in the future get routes from node_modules too where package.json "routes": ...
function main() {
	var routes_dir = path.join(process.cwd(), 'routes');
	fs.readdir(routes_dir, function(err, files) {
		each(files, function(file, cb) {
			var list;

			fs.stat(path.join(routes_dir, file) , function(err, stats) {
				if(stats && stats.isFile()) {
					list = require(path.join(routes_dir, file));
					if(list instanceof events.EventEmitter) {
						list.on('loaded', function(list) {
							if(list.get) {
								mod['get'].routes(list.get);
							}
							if(list.post) {
								mod['post'].routes(list.post);
							}
							cb();
						});
					} else {
						if(list.get) {
							mod['get'].routes(list.get);
						}
						if(list.post) {
							mod['post'].routes(list.post);
						}
						cb();
					}
				} else {
					cb();
				}
			});
		}, function(err) {
			mod.loaded = true;
			mod.emit('loaded');
		});
	});
}

function routes(method, arr) {
	Object.keys(arr).forEach(function(key) {
		mod[method].add(key, arr[key]);
	});
}

main();

module.exports = mod;
