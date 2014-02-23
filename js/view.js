/**
 * View class
 */
var View = function(db, params, callback) {
  this.db = db;
  this.type = 'get';
  this.path = '';
  this.params = params;
  this.store = '';
  this.node = '';
  this.callback = callback;
};