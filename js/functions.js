var Fx, __,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

__ = function(msgname, placeholders) {
  return chrome.i18n.getMessage(msgname, placeholders);
};

Fx = {
  openTab: function(url, selected) {
    if (selected == null) selected = false;
    chrome.tabs.create({
      "url": url,
      "selected": selected
    });
    return false;
  },
  concat: function() {
    var i, j, k, l, n, ret;
    ret = {};
    n = 0;
    for (i in arguments) {
      j = arguments[i];
      for (k in j) {
        l = j[k];
        if (n < 20) {
          ret[n] = l;
          n++;
        }
      }
    }
    return ret;
  },
  subFirst: function(str, nbr) {
    var strLength, strSub;
    strLength = str.length;
    strSub = str.substring(0, nbr);
    if (strSub.length < strLength) strSub += '..';
    return strSub;
  },
  subLast: function(str, nbr) {
    var strLength, strSub;
    strLength = str.length;
    strSub = str.substring(strLength, Math.max(0, strLength - nbr));
    if (strSub.length < strLength) strSub = '..' + strSub;
    return strSub;
  },
  cleanCache: function() {
    var date, j, login, name, persistentViews, time, view, views_to_refresh, views_updated, _results;
    login = DB.get('member').login;
    time = Math.floor(new Date().getTime() / 1000);
    persistentViews = ['planningMember.' + login, 'membersEpisodes.all', 'timelineFriends', 'membersNotifications', 'membersInfos.' + login];
    views_updated = BD.get('views_updated');
    for (name in views_updated) {
      date = views_updated[name];
      if (!(__indexOf.call(persistentViews, name) >= 0) && time - date >= 3600) {
        DB.remove('update.' + suffix);
        views_updated.splice(date, 1);
      }
    }
    views_to_refresh = DB.get('views_to_refresh');
    _results = [];
    for (view in views_to_refresh) {
      j = views_to_refresh[view];
      if (__indexOf.call(localStorage, view) >= 0) {
        _results.push(views_to_refresh.splice(j, 1));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  },
  updateHeight: function(top) {
    if (top == null) top = false;
    return setTimeout((function() {
      var maxHeight, params;
      maxHeight = DB.get('options').max_height;
      $('#about').height(maxHeight);
      params = top ? {
        scroll: 'top'
      } : {};
      return $('.nano').nanoScroller(params);
    }), 500);
  },
  toRefresh: function(view) {
    var views_to_refresh;
    views_to_refresh = DB.get('views_to_refresh');
    if (!(__indexOf.call(views_to_refresh, view) >= 0)) {
      views_to_refresh.push(view);
    }
    return DB.set('views_to_refresh', views_to_refresh);
  },
  getVersion: function() {
    return chrome.app.getDetails().version;
  },
  getNumber: function(season, episode) {
    var number;
    number = 'S';
    if (season <= 9) number += '0';
    number += season;
    number += 'E';
    if (episode <= 9) number += '0';
    number += episode;
    return number;
  },
  splitNumber: function(number) {
    var episode, season;
    season = '';
    if (number[1] !== 0) season += number[1];
    season += number[2];
    episode = '';
    if (number[4] !== 0) episode += number[4];
    episode += number[5];
    return {
      season: parseInt(season),
      episode: parseInt(episode)
    };
  },
  getCacheSize: function() {
    var size;
    size = Math.floor(JSON.stringify(localStorage).length);
    if (size < 1000) {
      return size + ' o';
    } else if (size < 1000 * 1000) {
      return (Math.floor(size / 100) / 10) + ' Ko';
    } else {
      return (Math.floor(size / 1000) / 1000) + ' Mo';
    }
  }
};
