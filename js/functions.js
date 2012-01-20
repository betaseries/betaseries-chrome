var Fx, __,
  __hasProp = Object.prototype.hasOwnProperty,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

__ = function(msgname, placeholders) {
  return chrome.i18n.getMessage(msgname, placeholders);
};

Fx = {
  openTab: function(url, selected) {
    chrome.tabs.create({
      "url": url,
      "selected": selected
    });
    return false;
  },
  concat: function() {
    var i, n, p, ret, _i, _len, _ref;
    ret = {};
    n = 0;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      i = arguments[_i];
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
    var i, login, persistentViews, suffix, time, _results;
    login = DB.get('member.login');
    time = Math.floor(new Date().getTime() / 1000);
    persistentViews = ['blog', 'planningMember.' + login, 'membersEpisodes', 'timelineFriends', 'membersNotifications', 'membersInfos.' + login];
    _results = [];
    for (i in localStorage) {
      if (i.indexOf('update.' === 0)) {
        suffix = i.substring(7);
        if (!(__indexOf.call(persistentViews, suffix) >= 0) && (time - localStorage[i] >= 3600)) {
          DB.remove('update.' + suffix);
          _results.push(DB.remove('page.' + suffix));
        } else {
          _results.push(void 0);
        }
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
      h = $('#page').height() + 4;
      h = h > maxHeight ? maxHeight : h;
      $('#about').height(h);
      params = top ? {
        scroll: 'top'
      } : {};
      return $('.nano').nanoScroller(params);
    }), 500);
  }
};
