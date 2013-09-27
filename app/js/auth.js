/**
 * Auth class
 * @param {object} DB
 */
function Auth(DB) {
	this.DB = DB;
}

/**
 * Returns true if the user is logged
 * @return {boolean}
 */
Auth.prototype.isLogged = function() {
	return (this.DB.get('session', null) != null);
};