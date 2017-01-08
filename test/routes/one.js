var mod = {};
mod.get = {};

mod.get['/one'] = function(req, res) {
	return 'one';
};

mod.get['^/test/id(/\\d+)$'] = function(req, res) {
	return 'regex';
};

module.exports = mod;
