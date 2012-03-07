var DB;

DB = {
  init: function() {
    var badge, options;
    options = {
      badge_notification_type: 'watched',
      dl_srt_language: 'VF',
      nbr_episodes_per_serie: 5,
      display_global: false,
      enable_ratings: true,
      max_height: 200
    };
    this.set('options', options, true);
    badge = {
      value: 0,
      type: 'membersEpisodes'
    };
    this.set('badge', badge, true);
    this.set('historic', [], false);
    this.set('views_updated', {}, true);
    this.set('views_to_refresh', [], true);
    this.set('views_to_remove', {}, true);
    return this.set('notifications', {}, true);
  },
  get: function(field, defaultValue) {
    if (localStorage[field] != null) {
      return JSON.parse(localStorage[field]);
    } else {
      return defaultValue;
    }
  },
  set: function(field, value, init) {
    if (!init || (init && !localStorage[field])) {
      return localStorage[field] = JSON.stringify(value);
    }
  },
  remove: function(field) {
    return localStorage.removeItem(field);
  },
  removeAll: function() {
    return localStorage.clear();
  }
};
