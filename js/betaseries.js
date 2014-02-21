/**
 * Betaseries class
 */
var Betaseries = function(Ajax, db) {
  this.Ajax = Ajax;
  this.db = db;
  this.force = false;
};

/**
 * Get a Betaseries method
 * @param  {[type]}   name     [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Betaseries.prototype.call = function(o) {
  this.view = o;

  var self = this;

  // get the check
  var checks = this.db.get('checks', {});

  // Today's date
  var today = new Date().toDateString();

  // reliable if data checked today
  var reliable = _.has(checks, o.store) && checks[o.store] === today;

  // reliable & NOT force
  if (reliable && !this.force) {

    if (o.fetch) {
      o.fetch();
    }

  } else {
    this.force = false;

    this.Ajax[o.type](o.path, o.params, function(data) {

      // store checked
      checks[o.store] = today;
      self.db.set('checks', checks);

      var data = data[o.node];

      if (o.update) {
        o.update(data);
      }

      if (o.fetch) {
        o.fetch();
      }

    });
  }
};

/**
 * Force the refresh of the call
 */
Betaseries.prototype.refresh = function() {
  this.force = true;
  this.call(this.view);
};

/**
 * Save data result in store
 * @param  {object} data
 */
Betaseries.prototype.save = function(data) {
  // get the store
  var store = this.db.store(this.path);
  store.set(data);
};

/**
 * [myEpisodes description]
 * @param  {[type]}   path     [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Betaseries.prototype.myEpisodes = function(params, callback) {
  var self = this;

  this.call({
    "type": 'get',
    "path": '/episodes/list',
    "params": params,
    "store": "/episodes/list",
    "node": 'shows',
    "update": function(data) {
      var login = self.db.get('session').login;

      // getting show list
      var shows = self.db.get('member.' + login + '.shows', []);

      // Unseen episodes
      var unseen = 0;

      for (var s in data) {
        var showData = data[s];

        var show = _.findWhere(shows, {
          "id": showData.id
        });

        if (show) {
          show.archived = false;
        } else {
          show = _.pick(showData, ['id', 'thetvdb_id', 'title', 'remaining']);

          show = _.extend(show, {
            "archived": false,
            "hidden": false,
          });

          shows.push(show);
        }

        // getting episodes list
        var episodes = self.db.get('show.' + showData.id + '.episodes', []);

        for (var e in showData.episodes) {
          var episodeData = showData.episodes[e];

          var episode = _.findWhere(episodes, {
            "id": episodeData.id
          });

          if (episode) {
            episode = _.extend(episode, episodeData);
          } else {
            episode = episodeData;
            episodes.push(episode);
          }

          // counting unseen episodes
          unseen++;

        }

        // saving episodes list
        self.db.set('show.' + showData.id + '.episodes', episodes);

      }

      // saving shows list
      self.db.set('member.' + login + '.shows', shows);

      //Badge.set('total_episodes', unseen);
    },
    "fetch": function() {
      var login = self.db.get('session').login;

      // getting shows list
      var showsData = self.db.get('member.' + login + '.shows', []);

      // filtering where episodes remaining and show not archived
      var shows = _.filter(showsData, function(show) {
        return show.remaining > 0 && !show.archived;
      });

      for (var i in shows) {
        var show = shows[i];

        // extra fields
        show.visibleIcon = (show.hidden) ? '/app/img/arrow_right.gif' : '/app/img/arrow_down.gif';

        // getting last episodes
        var episodes = self.db.get('show.' + show.id + '.episodes', []);

        show.episodes = _.last(episodes, show.remaining);
      }

      callback(shows);
    }
  });
};

/**
 * Episode comments - view
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Betaseries.prototype.episodeComments = function(params, callback) {
  var self = this;

  this.call({
    "type": 'get',
    "path": '/comments/comments',
    "params": params,
    "store": "/episodes/" + params.id + "/comments",
    "node": 'comments',
    "update": function(data) {
      self.db.set("episode." + params.id + ".comments", data);
    },
    "fetch": function() {
      var comments = self.db.get("episode." + params.id + ".comments", []);
      callback(comments);
    }
  });
};