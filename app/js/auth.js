/**
 * Auth class
 * @param {object} Database
 */

function Auth(Database) {
  this.Database = Database;
}

/**
 * Returns true if the user is logged
 * @return {boolean}
 */
Auth.prototype.isLogged = function() {
  return (typeof this.Database.get('session') !== 'undefined');
};

/**
 * Get token of current session
 * @return {string|undefined}
 */
Auth.prototype.getToken = function() {
  var session = this.Database.get('session');
  if (session) {
    return session.token;
  } else {
    return undefined;
  }
};