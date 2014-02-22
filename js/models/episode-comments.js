/**
 * episodeComments data
 */
var episodeComments = function(db, params, callback) {
  this.db = db;
  this.type = 'get';
  this.path = '/comments/comments';
  this.params = params;
  this.store = "/episodes/" + params.id + "/comments";
  this.node = 'comments';
  this.callback = callback;
};

/**
 * Update data
 */
episodeComments.prototype.update = function(data) {
  this.db.set("episode." + this.params.id + ".comments", data);
};

/**
 * Prepare data
 */
episodeComments.prototype.fetch = function() {
  var comments = this.db.get("episode." + this.params.id + ".comments", []);
  this.callback(comments);
};