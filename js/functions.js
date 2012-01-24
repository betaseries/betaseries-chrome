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
    var i, j, login, persistentViews, suffix, time, view, views_to_refresh, _len, _results;
    login = DB.get('member.login');
    time = Math.floor(new Date().getTime() / 1000);
    persistentViews = ['planningMember.' + login, 'membersEpisodes.all', 'timelineFriends', 'membersNotifications', 'membersInfos.' + login];
    for (i in localStorage) {
      if (i.indexOf('update.' === 0)) {
        suffix = i.substring(7);
        if (!(__indexOf.call(persistentViews, suffix) >= 0) && time - localStorage[i] >= 3600) {
          DB.remove('update.' + suffix);
          DB.remove('page.' + suffix);
        }
      }
    }
    views_to_refresh = JSON.parse(DB.get('views_to_refresh'));
    _results = [];
    for (j = 0, _len = views_to_refresh.length; j < _len; j++) {
      view = views_to_refresh[j];
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
      var h, maxHeight, params;
      maxHeight = DB.get('options.max_height');
      h = $('#page').height() + 14;
      h = h > maxHeight ? maxHeight : h;
      $('#about').height(h);
      params = top ? {
        scroll: 'top'
      } : {};
      return $('.nano').nanoScroller(params);
    }), 500);
  },
  toRefresh: function(view) {
    var views_to_refresh;
    views_to_refresh = JSON.parse(DB.get('views_to_refresh'));
    if (!(__indexOf.call(views_to_refresh, view) >= 0)) {
      views_to_refresh.push(view);
    }
    return DB.set('views_to_refresh', JSON.stringify(views_to_refresh));
  }
};
