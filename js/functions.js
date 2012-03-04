var Fx, __,
  __hasProp = Object.prototype.hasOwnProperty,
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
    var i, n, p, ret, _ref;
    ret = {};
    n = 0;
    for (i in arguments) {
      _ref = arguments[i];
      for (p in _ref) {
        if (!__hasProp.call(_ref, p)) continue;
        if (n < 10) {
          ret[n] = arguments[i][p];
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
  }
};
