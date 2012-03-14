var badge, connected,
  __hasProp = Object.prototype.hasOwnProperty;

badge = {
  init: function() {
    chrome.browserAction.setBadgeText({
      text: "?"
    });
    return chrome.browserAction.setBadgeBackgroundColor({
      color: [200, 200, 200, 255]
    });
  },
  update: function() {
    return ajax.post('/members/notifications', '&summary=yes', function(data) {
      var j, notifs;
      notifs = data.root.notifications;
      j = notifs.total;
      DB.set('badge', {
        value: j,
        type: 'membersNotifications'
      });
      if (j > 0) {
        return badge.display(j, 'membersNotifications');
      } else {
        return ajax.post('/members/episodes/all', '', function(data) {
          var badgeNotificationType, episodes, i;
          episodes = data.root.episodes;
          j = 0;
          for (i in episodes) {
            if (!__hasProp.call(episodes, i)) continue;
            badgeNotificationType = DB.get('options').badge_notification_type;
            if (badgeNotificationType === 'watched') j++;
            if (badgeNotificationType === 'downloaded' && episodes[i].downloaded !== "1") {
              j++;
            }
          }
          DB.set('badge', {
            value: j,
            type: 'membersEpisodes'
          });
          return badge.display(j, 'membersEpisodes');
        }, function() {
          var type, value;
          value = DB.get('badge').value;
          type = DB.get('badge').type;
          return badge.display(value, type);
        });
      }
    }, function() {
      var type, value;
      value = DB.get('badge').value;
      type = DB.get('badge').type;
      return badge.display(value, type);
    });
  },
  updateCache: function() {
    var episode, episodes, i, j, n, _ref;
    n = 0;
    for (i in localStorage) {
      episodes = localStorage[i];
      if (i.indexOf('episodes.') === 0) {
        _ref = JSON.parse(episodes);
        for (j in _ref) {
          episode = _ref[j];
          if (episode.seen) n++;
        }
      }
    }
    return badge.display(n, 'membersEpisodes');
  },
  display: function(value, type) {
    var colors;
    if (value === '0') {
      return chrome.browserAction.setBadgeText({
        text: ""
      });
    } else {
      colors = {
        membersNotifications: [200, 50, 50, 255],
        membersEpisodes: [50, 50, 200, 255]
      };
      chrome.browserAction.setBadgeBackgroundColor({
        color: colors[type]
      });
      return chrome.browserAction.setBadgeText({
        text: '' + value
      });
    }
  },
  autoUpdate: function() {
    if (connected()) {
      this.update();
      return setTimeout(this.update, 1000 * 3600);
    }
  }
};

connected = function() {
  return DB.get('session', null) != null;
};

DB.init();

badge.init();

badge.autoUpdate();
