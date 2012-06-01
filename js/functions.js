var Fx, __;

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
  toUpdate: function(view) {
    var views;
    views = DB.get('views');
    if (views[view] != null) {
      views[view].force = true;
      return DB.set('views', views);
    }
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
  getCacheSize: function(key) {
    var size;
    if (key != null) {
      size = Math.floor(JSON.stringify(localStorage[key]).length);
    } else {
      size = Math.floor(JSON.stringify(localStorage).length);
    }
    return size;
  },
  getCacheFormat: function(size) {
    if (size < 1000) {
      return size + ' o';
    } else if (size < 1000 * 1000) {
      return (Math.floor(size / 100) / 10) + ' Ko';
    } else {
      return (Math.floor(size / 1000) / 1000) + ' Mo';
    }
  },
  needUpdate: function() {
    return 'no data found, please update';
  },
  checkVersion: function() {
    var currVersion, version;
    version = currVersion = Fx.getVersion();
    return $('#versionLink').text(Fx.getVersion());
  }
};
