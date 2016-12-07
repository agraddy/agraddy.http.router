var output = {};

output._routes  = {};

output.add = function(url, func) {
	output._routes[url] = func;
}

output.routes = function(arr) {
	var i;
	var key;
	for(i = 0; i < arr.length; i++) {
		for(key in arr[i]) {
			output.add(key, arr[i][key]);
		}
	}
}

output.handler = function(req, res) {
	if(Object.keys(output._routes).indexOf(req.url) !== -1) {
		return output._routes[req.url](req, res);
	}
}

module.exports = output;
