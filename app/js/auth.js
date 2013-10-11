/**
 * Auth class
 * @param {object} Database
 */

function Auth(db) {
  this.db = db;
}

/**
 * Returns true if the user is logged
 * @return {boolean}
 */
Auth.prototype.isLogged = function() {
  return (typeof this.db.get('session') !== 'undefined');
};

/**
 * Get token of current session
 * @return {string|undefined}
 */
Auth.prototype.getToken = function() {
  var session = this.db.get('session');
  if (session) {
    return session.token;
  } else {
    return undefined;
  }
};