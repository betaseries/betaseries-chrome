var DB;

DB = {
  init: function() {
    this.set('options.badge_notification_type', 'watched', true);
    this.set('options.dl_srt_language', 'VF', true);
    this.set('options.nbr_episodes_per_serie', 5, true);
    this.set('options.display_global', 'false', true);
    this.set('options.enable_ratings', 'true', true);
    this.set('badge.value', 0, true);
    this.set('badge.type', 'membersEpisodes', true);
    this.set('historic', '[]', false);
    this.set('hidden_shows', '[]', true);
    return this.set('extra_episodes', '[]', true);
  },
  get: function(field, defaultValue) {
    if (defaultValue == null) defaultValue = void 0;
    if (localStorage[field] != null) {
      return localStorage[field];
    } else {
      return defaultValue;
    }
  },
  set: function(field, value, init) {
    if (!init || (init && !localStorage[field])) {
      return localStorage[field] = value;
    }
  },
  remove: function(field) {
    return localStorage.removeItem(field);
  },
  removeAll: function() {
    return localStorage.clear();
  }
};
