var Cache,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Cache = {
  views: ['commentsEpisode'],
  keep: function() {
    var o, views_to_remove;
    o = BS.currentView;
    views_to_remove = DB.get('views_to_remove');
    delete views_to_remove[o.id];
    return DB.set('views_to_remove', views_to_remove);
  },
  remove: function() {
    var o, views_to_remove;
    o = BS.currentView;
    views_to_remove = DB.get('views_to_remove');
    views_to_remove[o.id] = o.name;
    return DB.set('views_to_remove', views_to_remove);
  },
  clean: function(view) {
    var args, viewclass, viewid, views_to_remove;
    views_to_remove = DB.get('views_to_remove');
    for (viewid in views_to_remove) {
      viewclass = views_to_remove[viewid];
      if (!(__indexOf.call(this.views, viewclass) >= 0)) continue;
      if (viewclass === 'commentsEpisode') {
        args = viewid.split('.');
        DB.remove('comments.' + args[1] + '.' + args[2]);
        delete views_to_remove[viewid];
      }
    }
    return DB.set('views_to_remove', views_to_remove);
  }
};
