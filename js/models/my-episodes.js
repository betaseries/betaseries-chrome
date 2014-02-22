/**
 * myEpisodes data
 */
var myEpisodes = function(db, params, callback) {
  this.db = db;
  this.type = 'get';
  this.path = '/episodes/list';
  this.params = params;
  this.store = "/episodes/list";
  this.node = 'shows';
  this.callback = callback;
}

/**
 * Update data
 */
myEpisodes.prototype.update = function(data) {
  var login = this.db.get('session').login;

  // getting show list
  var shows = this.db.get('member.' + login + '.shows', []);

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
    var episodes = this.db.get('show.' + showData.id + '.episodes', []);

    for (var e in showData.unseen) {
      var episodeData = showData.unseen[e];

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
    this.db.set('show.' + showData.id + '.episodes', episodes);

  }

  // saving shows list
  this.db.set('member.' + login + '.shows', shows);

  //Badge.set('total_episodes', unseen); 
};

/**
 * Prepare data
 */
myEpisodes.prototype.fetch = function() {
  var login = this.db.get('session').login;

  // getting shows list
  var showsData = this.db.get('member.' + login + '.shows', []);

  // filtering where episodes remaining and show not archived
  var shows = _.filter(showsData, function(show) {
    return show.remaining > 0 && !show.archived;
  });

  for (var i in shows) {
    var show = shows[i];

    // extra fields
    show.visibleIcon = (show.hidden) ? 'img/arrow_right.gif' : 'img/arrow_down.gif';

    // getting last episodes
    var episodes = this.db.get('show.' + show.id + '.episodes', []);

    show.episodes = _.last(episodes, show.remaining);
  }

  this.callback(shows);
};