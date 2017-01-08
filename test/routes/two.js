var mod = {};
mod.post = {};

mod.post['/two'] = function(req, res) {
	return 'two';
};

module.exports = mod;
