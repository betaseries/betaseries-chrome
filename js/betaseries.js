var BS, menu,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

menu = {
  show: function() {
    return $('.action').show();
  },
  hide: function() {
    return $('.action').hide();
  },
  hideStatus: function() {
    return $('#status').hide();
  },
  hideMenu: function() {
    return $('#menu').hide();
  }
};

BS = {
  currentView: null,
  load: function() {
    var args, forceRefresh, o, outdated, sameView, time, update, views_to_refresh, views_updated, _ref, _ref2;
    args = Array.prototype.slice.call(arguments);
    o = BS[arguments[0]].apply(args.shift(), args);
    sameView = (this.currentView != null) && o.id === this.currentView.id;
    if (sameView) {
      Cache.keep();
    } else {
      Cache.clean();
    }
    this.currentView = o;
    if ((_ref = o.name, __indexOf.call(Cache.views, _ref) >= 0)) {
      $('#trash').show();
    } else {
      $('#trash').hide();
    }
    if (!sameView) BS.display();
    if (o.update) {
      $('#sync').show();
      time = Math.floor(new Date().getTime() / 1000);
      views_to_refresh = DB.get('views_to_refresh');
      forceRefresh = (_ref2 = o.id, __indexOf.call(views_to_refresh, _ref2) >= 0);
      views_updated = DB.get('views_updated');
      outdated = views_updated[o.id] != null ? time - views_updated[o.id] > 3600 : true;
      update = forceRefresh || outdated;
      if (update) return BS.update();
    } else {
      return $('#sync').hide();
    }
  },
  update: function() {
    var o, params;
    o = this.currentView;
    params = o.params || '';
    return ajax.post(o.url, params, function(data) {
      var cache, time, views_to_refresh, views_updated, _ref;
      cache = data.root[o.root];
      views_updated = DB.get('views_updated');
      time = Math.floor(new Date().getTime() / 1000);
      views_updated[o.id] = time;
      DB.set('views_updated', views_updated);
      views_to_refresh = DB.get('views_to_refresh');
      if (_ref = o.id, __indexOf.call(views_to_refresh, _ref) >= 0) {
        views_to_refresh.splice(views_to_refresh.indexOf(o.id), 1);
        DB.set('views_to_refresh', views_to_refresh);
      }
      o.update(cache);
      return BS.display();
    });
  },
  display: function() {
    var o;
    o = this.currentView;
    Historic.save();
    $('#page').html(o.content());
    $('#title').text(__(o.name));
    $('#page').removeClass().addClass(o.name);
    return Fx.updateHeight(true);
  },
  refresh: function() {
    var args;
    Fx.toRefresh(this.currentView.id);
    args = this.currentView.id.split('.');
    return BS.load.apply(BS, args);
  },
  size: function() {
    return (JSON.stringify(localStorage).length / 1000) + 'k';
  },
  showsDisplay: function(url) {
    return {
      id: "showsDisplay." + url,
      name: 'showsDisplay',
      url: "/shows/display/" + url,
      root: 'show',
      content: function(data) {
        var genres, i, k, output, season, v, _ref;
        if (data.banner != null) {
          output = '<img src="' + data.banner + '" width="290" height="70" alt="banner" /><br />';
        }
        output += '<div class="showtitle">' + data.title + '</div>';
        output += __('type');
        genres = [];
        _ref = data.genres;
        for (k in _ref) {
          v = _ref[k];
          genres.push(v);
        }
        output += genres.join(', ') + '<br />';
        output += __('status') + __(data.status.toLowerCase()) + '<br />';
        output += __('avg_note') + data.note.mean + '/5 (' + data.note.members + ')';
        output += '<div style="height:54px; overflow:hidden">' + __('synopsis') + data.description + '</div>';
        output += '<div class="showtitle">' + __('seasons') + '</div>';
        for (i in data.seasons) {
          season = data.seasons[i];
          output += __('season') + ' ' + season.number + ' ';
          output += '<small>(' + season.episodes + ' ' + __('episodes') + ')</small><br />';
        }
        output += '<div class="showtitle">' + __('actions') + '</div>';
        if (data.is_in_account === '1') {
          output += '<a href="#' + data.url + '" id="showsRemove">';
          output += '<img src="../img/film_delete.png" class="icon2" />' + __('show_remove') + '</a><br />';
        } else {
          output += '<a href="#' + data.url + '" id="showsAdd">';
          output += '<img src="../img/film_add.png" class="icon2" />' + __('show_add') + '</a><br />';
        }
        return output;
      }
    };
  },
  showsEpisodes: function(url, season, episode) {
    return {
      id: "showsEpisodes." + url + "." + season + "." + episode,
      name: 'showsEpisodes',
      url: "/shows/episodes/" + url,
      params: "&season=" + season + "&episode=" + episode,
      root: 'seasons',
      episodes: DB.get('episodes.' + url),
      number: Fx.getNumber(season, episode),
      update: function(data) {
        var e;
        e = data['0']['episodes']['0'];
        if (e.comments != null) this.episodes[this.number].comments = e.comments;
        if (e.description != null) {
          this.episodes[this.number].description = e.description;
        }
        if (e.note != null) this.episodes[this.number].note = e.note;
        if (e.screen != null) this.episodes[this.number].screen = e.screen;
        if (e.subs != null) this.episodes[this.number].subs = e.subs;
        return DB.set('episodes.' + url, this.episodes);
      },
      content: function() {
        var e, imgDownloaded, n, nbr_subs, output, sub, texte3, title;
        e = this.episodes[this.number];
        title = DB.get('options').display_global ? '#' + e.global + ' ' + title : e.title;
        output = "<div>";
        output += '<div class="showtitle">' + e.show + '</div>';
        if (e.screen != null) {
          output += '<img src="' + e.screen + '" style="width:100px; float:right; margin:3px;" />';
        }
        output += "<div><span class=\"num\">[" + e.number + "]</span> " + e.title + "</div>";
        output += '<div><span class="date">' + date('D d F', e.date) + '</span></div>';
        output += '<div style="height:4px;"></div>';
        if (e.note != null) {
          output += __('avg_note') + ("" + e.note.mean + " (" + e.note.members + ")<br />");
        }
        output += '<div style="height:54px; overflow:hidden">' + __('synopsis') + e.description + '</div>';
        output += '<div class="showtitle">' + __('subtitles') + '</div>';
        nbr_subs = 0;
        for (n in e.subs) {
          sub = e.subs[n];
          output += '[' + sub.quality + '] ' + sub.language + ' <a href="" class="subs" title="' + sub.file + '" link="' + sub.url + '">' + Fx.subLast(sub.file, 20) + '</a> (' + sub.source + ')<br />';
          nbr_subs++;
        }
        if (nbr_subs === 0) output += __('no_subs');
        if (e.downloaded) {
          imgDownloaded = "folder";
          texte3 = __('mark_as_not_dl');
        } else {
          imgDownloaded = "folder_off";
          texte3 = __('mark_as_dl');
        }
        output += '<div class="showtitle">' + __('actions') + '</div>';
        output += '<img src="../img/comment.png" class="comments"> ';
        output += '<img src="../img/' + imgDownloaded + '.png" class="downloaded" show="' + e.url + '" number="' + e.number + '" />';
        output += '</div>';
        return output;
      }
    };
  },
  planningMember: function(login) {
    if (login == null) login = DB.get('member.login');
    return {
      id: "planningMember." + login,
      name: 'planningMember',
      url: "/planning/member/" + login,
      params: "&view=unseen",
      root: 'planning',
      content: function(data) {
        var MAX_WEEKS, actualWeek, diffWeek, e, hidden, nbrEpisodes, output, plot, today, todayWeek, w, week;
        output = '';
        week = 100;
        MAX_WEEKS = 2;
        nbrEpisodes = 0;
        for (e in data) {
          today = Math.floor(new Date().getTime() / 1000);
          todayWeek = parseFloat(date('W', today));
          actualWeek = parseFloat(date('W', data[e].date));
          diffWeek = actualWeek - todayWeek;
          plot = data[e].date < today ? "orange" : "red";
          if (actualWeek !== week) {
            week = actualWeek;
            hidden = "";
            if (diffWeek < -1) {
              w = __('weeks_ago', [Math.abs(diffWeek)]);
            } else if (diffWeek === -1) {
              w = __('last_week');
            } else if (diffWeek === 0) {
              w = __('this_week');
            } else if (diffWeek === 1) {
              w = __('next_week');
            } else if (diffWeek > 1) {
              w = __('next_weeks', [diffWeek]);
            }
            if (diffWeek < -2 || diffWeek > 2) hidden = ' style="display:none"';
            if (nbrEpisodes > 0) output += '</div>';
            output += '<div class="week"' + hidden + '>';
            output += '<div class="showtitle">' + w + '</div>';
          }
          output += '<div class="episode ' + date('D', data[e].date).toLowerCase() + '">';
          output += '<div url="' + data[e].url + '" season="' + data[e].season + '" episode="' + data[e].episode + '" class="left">';
          output += '<img src="../img/plot_' + plot + '.gif" /> ';
          output += '<span class="show">' + data[e].show + '</span> ';
          output += '<span class="num">[' + data[e].number + ']</span>';
          output += '</div>';
          output += '<div class="right">';
          output += '<span class="date">' + date('D d F', data[e].date) + '</span>';
          output += '</div>';
          output += '</div>';
          nbrEpisodes++;
        }
        return output;
      }
    };
  },
  membersInfos: function(login) {
    var myLogin;
    if (login == null) login = DB.get('member.login');
    myLogin = login === DB.get('member.login');
    return {
      id: 'membersInfos.' + login,
      name: 'membersInfos',
      url: '/members/infos/' + login,
      root: 'member',
      content: function(data) {
        var avatar, i, output;
        if (data.avatar !== '') {
          avatar = new Image;
          avatar.src = data.avatar;
          avatar.onload = function() {
            return $('#avatar').attr('src', data.avatar);
          };
        }
        output = '';
        output += '<div class="showtitle">' + data.login + '</div>';
        output += '<img src="../img/avatar.png" width="50" id="avatar" style="position:absolute; right:0;" />';
        output += '<div class="episode lun"><img src="../img/infos.png" class="icon"> ' + __('nbr_friends', [data.stats.friends]) + ' </div>';
        output += '<div class="episode lun"><img src="../img/medal.png" class="icon"> ' + __('nbr_badges', [data.stats.badges]) + ' </div>';
        output += '<div class="episode lun"><img src="../img/episodes.png" class="icon"> ' + __('nbr_shows', [data.stats.shows]) + ' </div>';
        output += '<div class="episode lun"><img src="../img/report.png" class="icon"> ' + __('nbr_seasons', [data.stats.seasons]) + ' </div>';
        output += '<div class="episode lun"><img src="../img/script.png" class="icon"> ' + __('nbr_episodes', [data.stats.episodes]) + ' </div>';
        output += '<div class="episode lun"><img src="../img/location.png" class="icon">' + data.stats.progress + ' <small>(' + __('progress') + ')</small></div>';
        if (myLogin) {
          output += '<div style="height:11px;"></div>';
          output += '<div class="showtitle">' + __('archived_shows') + '</div>';
          for (i in data.shows) {
            if (data.shows[i].archive === "1") {
              output += '<div class="episode" id="' + data.shows[i].url + '">';
              output += data.shows[i].title;
              output += ' <img src="../img/unarchive.png" class="unarchive" title="' + __("unarchive") + '" />';
              output += '</div>';
            }
          }
        }
        if (data.is_in_account != null) {
          output += '<div class="showtitle">' + __('actions') + '</div>';
          if (data.is_in_account === 0) {
            output += '<div class="episode"><img src="../img/friend_add.png" id="friendshipimg" style="margin-bottom: -4px;" /> <a href="#" id="addfriend" login="' + data.login + '">' + __('add_to_friends', [data.login]) + '</a></div>';
          } else if (data.is_in_account === 1) {
            output += '<div class="episode"><img src="../img/friend_remove.png" id="friendshipimg" style="margin-bottom: -4px;"  /> <a href="#" id="removefriend" login="' + data.login + '">' + __('remove_to_friends', [data.login]) + '</a></div>';
          }
        }
        return output;
      }
    };
  },
  membersEpisodes: function(lang) {
    if (lang == null) lang = 'all';
    return {
      id: 'membersEpisodes.' + lang,
      name: 'membersEpisodes',
      url: '/members/episodes/' + lang,
      root: 'episodes',
      update: function(data) {
        var d, e, episodes, shows, _results;
        _results = [];
        for (d in data) {
          e = data[d];
          shows = DB.get('shows', {});
          if (e.url in shows) {
            shows[e.url].archive = false;
          } else {
            shows[e.url] = {
              url: e.url,
              title: e.show,
              archive: false,
              hidden: false,
              expanded: false
            };
          }
          DB.set('shows', shows);
          episodes = DB.get('episodes.' + e.url, {});
          if (episodes[e.global] != null) {
            episodes[e.global].comments = e.comments;
            episodes[e.global].downloaded = e.downloaded === '1';
          } else {
            episodes[e.global] = {
              comments: e.comments,
              date: e.date,
              downloaded: e.downloaded === '1',
              episode: e.episode,
              global: e.global,
              number: e.number,
              season: e.season,
              title: e.title,
              show: e.show,
              url: e.url,
              subs: e.subs,
              seen: false
            };
          }
          _results.push(DB.set('episodes.' + e.url, episodes));
        }
        return _results;
      },
      content: function() {
        var data, e, episode, episodes, es, i, j, n, nbrEpisodesPerSerie, output, s, _i, _len, _ref;
        data = {};
        nbrEpisodesPerSerie = DB.get('options').nbr_episodes_per_serie;
        for (i in localStorage) {
          episodes = localStorage[i];
          if (i.indexOf('episodes.') === 0) {
            n = 0;
            es = JSON.parse(episodes);
            data[i.substring(9)] = {
              nbr_total: Object.keys(es).length
            };
            for (j in es) {
              episode = es[j];
              if (episode.seen) {
                continue;
              } else if (n < nbrEpisodesPerSerie) {
                episodes = [];
                if (data[i.substring(9)].episodes != null) {
                  episodes = data[i.substring(9)].episodes;
                }
                episodes.push(episode);
                data[i.substring(9)].episodes = episodes;
                n++;
              } else {
                break;
              }
            }
          }
        }
        output = '<div id="shows">';
        for (i in data) {
          j = data[i];
          s = DB.get('shows')[i];
          output += '<div id="' + s.url + '" class="show">';
          output += Content.show(s, j.nbr_total);
          _ref = j.episodes;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            e = _ref[_i];
            output += Content.episode(e, s);
          }
          output += '</div>';
        }
        /*	
        			bgPage.badge.update()
        			output += '<div id="noEpisodes">'
        			output += __('no_episodes_to_see') 
        			output += '<br /><br /><a href="#" onclick="BS.load(\'searchForm\').display(); return false;">'
        			output += '<img src="../img/film_add.png" class="icon2" />' + __('add_a_show') + '</a>'
        			output += '</div>'
        */
        output += '</div>';
        return output;
      }
    };
  },
  membersNotifications: function() {
    return {
      id: 'membersNotifications',
      name: 'membersNotifications',
      url: '/members/notifications',
      root: 'notifications',
      update: function(tab1) {
        var notifications, tab2;
        tab2 = DB.get('notifications');
        notifications = Fx.concat(tab1, tab2);
        return DB.set('notifications', notifications);
      },
      content: function() {
        var data, n, nbrNotifications, new_date, output, time;
        output = '';
        nbrNotifications = 0;
        time = '';
        data = DB.get('notifications');
        for (n in data) {
          new_date = date('D d F', data[n].date);
          if (new_date !== time) {
            time = new_date;
            output += '<div class="showtitle">' + time + '</div>';
          }
          output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">';
          output += data[n].html;
          output += '</div>';
          nbrNotifications++;
        }
        bgPage.badge.update();
        if (nbrNotifications === 0) output += __('no_notifications');
        return output;
      }
    };
  },
  commentsEpisode: function(url, season, episode, global) {
    return {
      id: 'commentsEpisode.' + url + '.' + global,
      name: 'commentsEpisode',
      url: '/comments/episode/' + url,
      params: '&season=' + season + '&episode=' + episode,
      root: 'comments',
      show: url,
      global: global,
      update: function(data) {
        var comment, comments, i, nbrComments;
        comments = DB.get('comments.' + this.show + '.' + this.global, {});
        nbrComments = comments.length;
        for (i in data) {
          comment = data[i];
          if (i < nbrComments) {
            continue;
          } else {
            comments[i] = comment;
          }
        }
        return DB.set('comments.' + this.show + '.' + this.global, comments);
      },
      content: function() {
        var data, i, n, new_date, output, show, time;
        i = 1;
        time = '';
        show = '';
        output = '<div class="showtitle">' + show + '</div>';
        data = DB.get('comments.' + this.show + '.' + this.global, {});
        for (n in data) {
          new_date = date('D d F', data[n].date);
          if (new_date !== time) {
            time = new_date;
            output += '<div class="showtitle">' + time + '</div>';
          }
          output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">';
          output += '<b>' + date('H:i', data[n].date) + '</b> ';
          output += '<span class="login">' + data[n].login + '</span> ';
          output += '<small>#' + i + '</small><br />';
          output += data[n].text;
          output += '</div>';
          i++;
        }
        if (i === 1) output += __('no_comments');
        return output;
      }
    };
  },
  timelineFriends: function() {
    return {
      id: 'timelineFriends',
      name: 'timelineFriends',
      url: '/timeline/friends',
      params: '&number=10',
      root: 'timeline',
      content: function(data) {
        var n, new_date, output, time;
        output = '';
        time = '';
        for (n in data) {
          new_date = date('D d F', data[n].date);
          if (new_date !== time) {
            time = new_date;
            output += '<div class="showtitle">' + time + '</div>';
          }
          output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">';
          output += '<b>' + date('H:i', data[n].date) + '</b> ';
          output += '<span class="login">' + data[n].login + '</span> ' + data[n].html;
          output += '</div>';
        }
        return output;
      }
    };
  },
  connection: function() {
    return {
      id: 'connection',
      name: 'connection',
      content: function() {
        var output;
        menu.hide();
        output = '<div style="height:10px;"></div>';
        output += '<form id="connect">';
        output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>';
        output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>';
        output += '</table>';
        output += '<div class="valid"><input type="submit" value="' + __('sign_in') + '"> ou ';
        output += '	<a href="#" onclick="BS.load(\'registration\'); return false;">' + __('sign_up') + '</a></div>';
        output += '</form>';
        return output;
      }
    };
  },
  registration: function() {
    return {
      id: 'registration',
      name: 'registration',
      content: function() {
        var output;
        menu.hide();
        output = '<div style="height:10px;"></div>';
        output += '<form id="register">';
        output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>';
        output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>';
        output += '<tr><td>' + __('repassword') + '</td><td><input type="password" name="repassword" id="repassword" /></td></tr>';
        output += '<tr><td>' + __('email') + '</td><td><input type="text" name="mail" id="mail" /></td></tr>';
        output += '</table>';
        output += '<div class="valid"><input type="submit" value="' + __('sign_up') + '"> ou ';
        output += '	<a href="#" onclick="BS.load(\'connection\'); return false;">' + __('sign_in') + '</a></div>';
        output += '</form>';
        return output;
      }
    };
  },
  searchForm: function() {
    return {
      id: 'searchForm',
      name: 'searchForm',
      content: function() {
        var output;
        output = '<div style="height:10px;"></div>';
        output += '<form id="search0">';
        output += '<input type="text" name="terms" id="terms" /> ';
        output += '<input type="submit" value="chercher" />';
        output += '</form>';
        output += '<div id="shows-results"></div>';
        output += '<div id="members-results"></div>';
        setTimeout((function() {
          return $('#terms').focus();
        }), 100);
        return output;
      }
    };
  },
  blog: function() {
    return {
      id: 'blog',
      name: 'blog',
      content: function() {
        var output;
        output = '';
        $.ajax({
          type: 'GET',
          url: 'https://www.betaseries.com/blog/feed/',
          dataType: 'xml',
          async: false,
          success: function(data) {
            var desc, i, item, items, link, linkOrig, title, titleOrig, _ref, _results;
            items = $(data).find('item');
            _results = [];
            for (i = 0, _ref = Math.min(5, items.length); 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
              item = $(items[i]);
              titleOrig = item.find('title').text();
              title = titleOrig.substring(0, 40);
              if (titleOrig.length > 40) title += '..';
              output += '<div class="showtitle">' + title;
              output += '</div>';
              desc = item.find('description').text();
              linkOrig = item.find('link').text();
              link = '<a href="#" onclick="Fx.openTab(\'' + linkOrig + '\');">(' + __('read_article') + ')</a>';
              output += '<div>' + desc.replace(/<a(.*)a>/, link) + '</div>';
              _results.push(output += '<div style="height:11px;"></div>');
            }
            return _results;
          }
        });
        return output;
      }
    };
  },
  menu: function() {
    return {
      id: 'menu',
      name: 'menu',
      content: function() {
        var output;
        output = '';
        output += '<a href="" onclick="#{BS.load(\'blog\'); return false;">';
        output += '<img src="../img/blog.png" id="blog" class="action" style="margin-bottom:-3px;" /> ';
        output += __('blog') + '</a>';
        output += '<a href="" onclick="BS.load(\'planningMember\'); return false;">';
        output += '<img src="../img/planning.png" id="planning" class="action" style="margin-bottom:-3px;" />';
        output += __('planningMember') + '</a>';
        output += '<a href="" onclick="BS.load(\'membersEpisodes\'); return false;">';
        output += '<img src="../img/episodes.png" id="episodes" class="action" style="margin-bottom:-3px;" /> ';
        output += __('membersEpisodes') + '</a>';
        output += '<a href="" onclick="BS.load(\'timelineFriends\'); return false;">';
        output += '<img src="../img/timeline.png" id="timeline" class="action" style="margin-bottom:-3px;" />';
        output += __('timelineFriends') + '</a>';
        output += '<a href="" onclick="BS.load(\'membersNotifications\'); return false;">';
        output += '<img src="../img/notifications.png" id="notifications" class="action" style="margin-bottom:-3px;" />';
        output += __('membersNotifications') + '</a>';
        output += '<a href="" onclick="BS.load(\'membersInfos\'); return false;">';
        output += '<img src="../img/infos.png" id="infos" class="action" style="margin-bottom:-3px;" />';
        output += __('membersInfos') + '</a>';
        output += '<a href="" onclick="BS.load(\'searchForm\'); return false;">';
        output += '<img src="../img/search.png" id="search" class="action" style="margin-bottom:-3px;" />';
        output += __('searchForm') + '</a>';
        return output;
      }
    };
  }
};
