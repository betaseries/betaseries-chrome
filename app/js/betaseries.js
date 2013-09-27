/**
 * Betaseries class
 * @param {object} Ajax
 */
function Betaseries(Ajax) {
	this.Ajax = Ajax;
}

/**
 * Log in Betaseries account
 * @param  {string}   login
 * @param  {string}   md5Password
 * @param  {func} callback
 */
Betaseries.prototype.sign_in = function(login, md5Password, callback) {
	var params = {
		login: login,
		password: md5Password
	};

	this.Ajax.post('/members/auth', params, callback);
};


		