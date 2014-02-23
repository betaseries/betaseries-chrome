/**
 * episodeComments data
 */
var episodeComments = function(db, params, callback) {
  __extends(this, View);
  this.__super__.constructor.call(this, db, params, callback);

  this.path = '/comments/comments';
  this.store = "/episodes/" + params.id + "/comments";
  this.node = 'comments';
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