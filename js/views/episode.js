// Generated by CoffeeScript 1.3.3
var View_Episode,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

View_Episode = (function() {

  function View_Episode() {
    this.init = __bind(this.init, this);

  }

  View_Episode.prototype.init = function(url, season, episode, global) {
    this.id = 'Episode.' + url + '.' + season + '.' + episode + '.' + global;
    this.url = '/shows/episodes/' + url;
    this.params = '&season=' + season + '&episode=' + episode;
    this.episodes = DB.get('show.' + url + '.episodes');
    this.show = url;
    this.global = global;
    this.name = 'Episode';
    return this.root = 'seasons';
  };

  View_Episode.prototype.update = function(data) {
    var e, ep, eps;
    e = data['0']['episodes']['0'];
    eps = this.episodes != null ? this.episodes : {};
    ep = this.global in eps ? eps[this.global] : {};
    if (e.comments != null) {
      ep.comments = e.comments;
    }
    if (e.date != null) {
      ep.date = e.date;
    }
    if (e.description != null) {
      ep.description = e.description;
    }
    if (e.episode != null) {
      ep.episode = e.episode;
    }
    if (e.global != null) {
      ep.global = e.global;
    }
    if (e.number != null) {
      ep.number = e.number;
    }
    if (e.screen != null) {
      ep.screen = e.screen;
    }
    if (e.show != null) {
      ep.show = e.show;
    }
    if (e.subs != null) {
      ep.subs = e.subs;
    }
    if (e.title != null) {
      ep.title = e.title;
    }
    ep.url = this.show;
    eps[this.global] = ep;
    DB.set('show.' + this.show + '.episodes', eps);
    return this.episodes = eps;
  };

  View_Episode.prototype.content = function() {
    var dl, e, i, n, nbr_subs, note, output, sub, title, _i, _ref, _ref1;
    if (!(((_ref = this.episodes) != null ? _ref[this.global] : void 0) != null)) {
      return Fx.needUpdate();
    }
    e = this.episodes[this.global];
    title = DB.get('options').display_global ? '#' + e.global + ' ' + e.title : e.title;
    output = '<div class="title">';
    output += '<div class="fleft200"><a href="" url="' + this.show + '" class="showtitle display_show">' + e.show + '</a></div>';
    output += '<div class="fright200 aright">';
    if (e.note != null) {
      note = Math.floor(e.note.mean);
      for (i = _i = 1; 1 <= note ? _i <= note : _i >= note; i = 1 <= note ? ++_i : --_i) {
        output += '<img src="../img/star.gif" /> ';
      }
    }
    output += '</div>';
    output += '<div class="clear"></div>';
    output += '</div>';
    output += '<div>';
    output += ' <div class="fleft200">';
    output += '  <span class="num">' + Fx.displayNumber(e.number) + '</span> ' + e.title;
    output += ' </div>';
    if (((_ref1 = e.note) != null ? _ref1.mean : void 0) != null) {
      output += ' <div class="fright200 aright">' + e.note.mean + '/5 (' + e.note.members + ')' + '</div>';
    }
    output += ' <div class="clear"></div>';
    output += '</div>';
    if (e.screen != null) {
      output += '<div style="height: 70px; overflow: hidden; margin-top: 10px;"><img src="' + e.screen + '" style="width: 355px; margin-top: -15px;" /></div>';
    }
    if (e.description != null) {
      output += '<div class="title2">' + __('synopsis') + '</div>';
      output += '<div style="text-align: justify; margin-right: 5px;">' + e.description + '</div>';
    }
    if ((e.subs != null) && Object.keys(e.subs).length > 0) {
      output += '<div class="title2">' + __('subtitles') + '</div>';
      nbr_subs = 0;
      for (n in e.subs) {
        sub = e.subs[n];
        output += '[' + sub.quality + '] ' + sub.language + ' <a href="" class="subs" title="' + sub.file + '" link="' + sub.url + '">' + Fx.subLast(sub.file, 20) + '</a> (' + sub.source + ')<br />';
        nbr_subs++;
      }
    }
    output += '<div class="title2">' + __('actions') + '</div>';
    output += '<a href="" url="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" class="link display_comments">';
    output += '<span class="imgSyncNo"></span>' + __('see_comments', e.comments) + '</a>';
    if (e.downloaded != null) {
      dl = e.downloaded ? 'mark_as_not_dl' : 'mark_as_dl';
      output += '<a href="" show="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" class="link downloaded">';
      output += '<span class="imgSyncOff"></span>' + __(dl) + '</a>';
    }
    return output;
  };

  View_Episode.prototype.listen = function() {
    $('.subs').on('click', function() {
      Fx.openTab($(this).attr('link'));
      return false;
    });
    $('.display_comments').on('click', function() {
      var episode, global, season, url;
      url = $(this).attr('url');
      season = $(this).attr('season');
      episode = $(this).attr('episode');
      global = $(this).attr('global');
      app.view.load('EpisodeComments', url, season, episode, global);
      return false;
    });
    return $('.downloaded').on('click', function() {
      var dl, downloaded, episode, es, global, params, season, show,
        _this = this;
      event.preventDefault();
      show = $(this).attr('show');
      season = $(this).attr('season');
      episode = $(this).attr('episode');
      global = $(this).attr('global');
      es = DB.get('show.' + show + '.episodes');
      downloaded = es[global].downloaded;
      es[global].downloaded = !downloaded;
      DB.set('show.' + show + '.episodes', es);
      $(this).find('span').toggleClass('imgSyncOff imgSyncOn');
      dl = downloaded ? 'mark_as_dl' : 'mark_as_not_dl';
      params = "&season=" + season + "&episode=" + episode;
      return ajax.post("/members/downloaded/" + show, params, function() {
        var badge_notification_type;
        Cache.force('MyEpisodes.all');
        badge_notification_type = DB.get('options').badge_notification_type;
        if (badge_notification_type === 'downloaded') {
          Badge.search_episodes();
        }
        return $(_this).html('<span class="imgSyncOff"></span>' + __(dl));
      }, function() {
        return registerAction("/members/downloaded/" + show, params);
      });
    });
  };

  return View_Episode;

})();
