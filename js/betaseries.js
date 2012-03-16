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
    var args, force, o, outdated, sameView, time, views;
    args = Array.prototype.slice.call(arguments);
    o = BS[arguments[0]].apply(args.shift(), args);
    sameView = (this.currentView != null) && o.id === this.currentView.id;
    this.currentView = o;
    if (!sameView) BS.display();
    if (o.update) {
      $('#sync').show();
      time = Math.floor(new Date().getTime() / 1000);
      views = DB.get('views');
      outdated = views[o.id] != null ? time - views[o.id].time > 3600 : true;
      force = views[o.id] != null ? views[o.id].force : true;
      if (outdated || force) return BS.update();
    } else {
      return $('#sync').hide();
    }
  },
  update: function() {
    var o, params;
    o = this.currentView;
    params = o.params || '';
    if (o.url != null) {
      return ajax.post(o.url, params, function(data) {
        var cache, time, views;
        cache = data.root[o.root];
        time = Math.floor(new Date().getTime() / 1000);
        views = DB.get('views');
        views[o.id] = {
          time: time,
          force: false
        };
        DB.set('views', views);
        o.update(cache);
        return BS.display();
      });
    } else if (o.update != null) {
      return o.update();
    }
  },
  display: function() {
    var o;
    o = this.currentView;
    Historic.save();
    document.getElementById('page').innerHTML = '';
    $('#page').html(o.content());
    $('#title').text(__(o.name));
    return $('#page').removeClass().addClass(o.name);
  },
  refresh: function() {
    var args;
    Fx.toUpdate(this.currentView.id);
    args = this.currentView.id.split('.');
    return BS.load.apply(BS, args);
  },
  showsDisplay: function(url) {
    return {
      id: 'showsDisplay.' + url,
      name: 'showsDisplay',
      url: '/shows/display/' + url,
      root: 'show',
      login: DB.get('session').login,
      show: url,
      update: function(data) {
        var shows;
        shows = DB.get('shows.' + this.login, {});
        shows[data.url] = {
          banner: data.banner,
          description: data.description,
          genres: data.genres,
          is_in_account: data.is_in_account === '1',
          note: data.note,
          status: data.status,
          title: data.title,
          url: data.url
        };
        return DB.set('shows.' + this.login, shows);
      },
      content: function() {
        var data, genres, i, k, output, season, shows, v, _ref;
        shows = DB.get('shows.' + this.login, {});
        data = shows[this.show];
        if (!data) return '';
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
        if (data.status != null) {
          output += __('status') + __(data.status.toLowerCase()) + '<br />';
        }
        if (data.note != null) {
          output += __('avg_note') + data.note.mean + '/5 (' + data.note.members + ')';
        }
        if (data.description != null) {
          output += '<div style="height:54px; overflow:hidden">' + __('synopsis') + data.description + '</div>';
        }
        output += '<div class="showtitle">' + __('seasons') + '</div>';
        for (i in data.seasons) {
          season = data.seasons[i];
          output += __('season') + ' ' + season.number + ' ';
          output += '<small>(' + season.episodes + ' ' + __('episodes') + ')</small><br />';
        }
        output += '<div class="showtitle">' + __('actions') + '</div>';
        if (data.is_in_account) {
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
  showsEpisodes: function(url, season, episode, global) {
    return {
      id: 'showsEpisodes.' + url + '.' + global,
      name: 'showsEpisodes',
      url: '/shows/episodes/' + url,
      params: '&season=' + season + '&episode=' + episode,
      root: 'seasons',
      episodes: DB.get('show.' + url + '.episodes'),
      show: url,
      global: global,
      update: function(data) {
        var e;
        e = data['0']['episodes']['0'];
        if (e.comments != null) this.episodes[this.global].comments = e.comments;
        if (e.description != null) {
          this.episodes[this.global].description = e.description;
        }
        if (e.note != null) this.episodes[this.global].note = e.note;
        if (e.screen != null) this.episodes[this.global].screen = e.screen;
        if (e.subs != null) this.episodes[this.global].subs = e.subs;
        return DB.set('show.' + this.show + '.episodes', this.episodes);
      },
      content: function() {
        var e, imgDownloaded, n, nbr_subs, output, sub, texte3, title;
        e = this.episodes[this.global];
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
    if (login == null) login = DB.get('session').login;
    return {
      id: 'planningMember.' + login,
      name: 'planningMember',
      url: '/planning/member/' + login,
      params: "&view=unseen",
      root: 'planning',
      login: login,
      update: function(data) {
        return DB.set('member.' + this.login + '.planning', data);
      },
      content: function() {
        var MAX_WEEKS, actualWeek, data, diffWeek, e, hidden, nbrEpisodes, output, plot, today, todayWeek, w, week;
        output = '';
        week = 100;
        MAX_WEEKS = 2;
        nbrEpisodes = 0;
        data = DB.get('member.' + this.login + '.planning', null);
        if (!data) return Fx.needUpdate();
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
          output += '<img src="../img/folder_off.png" /> ';
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
    if (login == null) login = DB.get('session').login;
    return {
      id: 'membersInfos.' + login,
      name: 'membersInfos',
      url: '/members/infos/' + login,
      root: 'member',
      login: login,
      update: function(data) {
        var member;
        member = DB.get('member.' + this.login + '.infos', {});
        member.login = data.login;
        member.avatar = data.avatar;
        member.stats = data.stats;
        return DB.set('member.' + this.login + '.infos', member);
      },
      content: function() {
        var avatar, data, output;
        data = DB.get('member.' + this.login + '.infos', null);
        if (!data) return Fx.needUpdate();
        if ((data.avatar != null) && data.avatar !== '') {
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
        if (data.is_in_account != null) {
          output += '<div class="showtitle">' + __('actions') + '</div>';
          if (!data.is_in_account) {
            output += '<div class="episode"><img src="../img/friend_add.png" id="friendshipimg" style="margin-bottom: -4px;" /> <a href="#" id="addfriend" login="' + data.login + '">' + __('add_to_friends', [data.login]) + '</a></div>';
          } else {
            output += '<div class="episode"><img src="../img/friend_remove.png" id="friendshipimg" style="margin-bottom: -4px;"  /> <a href="#" id="removefriend" login="' + data.login + '">' + __('remove_to_friends', [data.login]) + '</a></div>';
          }
        }
        return output;
      }
    };
  },
  membersShows: function(login) {
    if (login == null) login = DB.get('session').login;
    return {
      id: 'membersShows.' + login,
      name: 'membersShows',
      url: '/members/infos/' + login,
      root: 'member',
      login: login,
      update: function(data) {
        var i, s, shows, _ref;
        shows = DB.get('member.' + this.login + '.shows', {});
        _ref = data.shows;
        for (i in _ref) {
          s = _ref[i];
          if (s.url in shows) {
            shows[s.url].archive = s.archive;
          } else {
            shows[s.url] = {
              url: s.url,
              title: s.title,
              archive: s.archive,
              hidden: false
            };
          }
        }
        return DB.set('member.' + this.login + '.shows', shows);
      },
      content: function() {
        var data, i, output, show;
        data = DB.get('member.' + this.login + '.shows', null);
        if (!data) return Fx.needUpdate();
        output = '';
        for (i in data) {
          show = data[i];
          output += '<div class="episode" id="' + show.url + '">';
          output += show.title;
          output += '</div>';
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
      login: DB.get('session').login,
      update: function(data) {
        var d, e, memberEpisodes, nbrEpisodesPerSerie, show, showEpisodes, shows, _ref;
        nbrEpisodesPerSerie = DB.get('options').nbr_episodes_per_serie;
        shows = DB.get('member.' + this.login + '.shows', {});
        memberEpisodes = {};
        for (d in data) {
          e = data[d];
          if (e.url in shows) {
            shows[e.url].archive = false;
          } else {
            shows[e.url] = {
              url: e.url,
              title: e.show,
              archive: false,
              hidden: false
            };
          }
          showEpisodes = DB.get('show.' + e.url + '.episodes', {});
          showEpisodes[e.global] = {
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
            subs: e.subs
          };
          DB.set('show.' + e.url + '.episodes', showEpisodes);
          if (e.url in memberEpisodes) {
            show = memberEpisodes[e.url];
            if (!(_ref = e.global, __indexOf.call(show.episodes, _ref) >= 0)) {
              if (show.nbr_total < nbrEpisodesPerSerie) {
                memberEpisodes[e.url].episodes.push(e.global);
              }
              memberEpisodes[e.url].nbr_total++;
            }
          } else {
            memberEpisodes[e.url] = {
              episodes: [e.global],
              nbr_total: 1
            };
          }
        }
        DB.set('member.' + this.login + '.shows', shows);
        return DB.set('member.' + this.login + '.episodes', memberEpisodes);
      },
      content: function() {
        var data, e, i, j, k, nbrEpisodesPerSerie, output, s, shows, _i, _len, _ref;
        nbrEpisodesPerSerie = DB.get('options').nbr_episodes_per_serie;
        data = DB.get('member.' + this.login + '.episodes', null);
        if (!data) return Fx.needUpdate();
        shows = DB.get('member.' + this.login + '.shows', null);
        if (!shows) return Fx.needUpdate();
        output = '<div id="shows">';
        for (i in data) {
          j = data[i];
          s = shows[i];
          output += '<div id="' + i + '" class="show">';
          output += Content.show(s, j.nbr_total);
          _ref = j.episodes;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            k = _ref[_i];
            e = DB.get('show.' + i + '.episodes')[k];
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
      login: DB.get('session').login,
      update: function(tab1) {
        var notifications, tab2;
        tab2 = DB.get('member.' + this.login + '.notifs', {});
        notifications = Fx.concat(tab1, tab2);
        return DB.set('member.' + this.login + '.notifs', notifications);
      },
      content: function() {
        var data, n, nbrNotifications, new_date, output, time;
        output = '';
        nbrNotifications = 0;
        time = '';
        data = DB.get('member.' + this.login + '.notifs', null);
        if (!data) return Fx.needUpdate();
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
        comments = DB.get('show.' + this.show + '.' + this.global + '.comments', {});
        nbrComments = comments.length;
        for (i in data) {
          comment = data[i];
          if (i < nbrComments) {
            continue;
          } else {
            comments[i] = comment;
          }
        }
        return DB.set('show.' + this.show + '.' + this.global + '.comments', comments);
      },
      content: function() {
        var data, i, n, new_date, output, show, time;
        i = 1;
        time = '';
        show = '';
        output = '<div class="showtitle">' + show + '</div>';
        data = DB.get('show.' + this.show + '.' + this.global + '.comments', null);
        if (!data) return Fx.needUpdate();
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
      login: DB.get('session').login,
      update: function(data) {
        return DB.set('member.' + this.login + '.timeline', data);
      },
      content: function() {
        var data, n, new_date, output, time;
        output = '';
        time = '';
        data = DB.get('member.' + this.login + '.timeline', null);
        if (!data) return Fx.needUpdate();
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
  searchShow: function() {
    return {
      id: 'searchShow',
      name: 'searchShow',
      content: function() {
        var output;
        output = '<div style="height:10px;"></div>';
        output += '<form id="searchForShow">';
        output += '<input type="text" name="terms" id="terms" /> ';
        output += '<input type="submit" value="chercher" />';
        output += '</form>';
        output += '<div id="results"></div>';
        setTimeout((function() {
          return $('#terms').focus();
        }), 100);
        return output;
      }
    };
  },
  searchMember: function() {
    return {
      id: 'searchMember',
      name: 'searchMember',
      content: function() {
        var output;
        output = '<div style="height:10px;"></div>';
        output += '<form id="searchForMember">';
        output += '<input type="text" name="terms" id="terms" /> ';
        output += '<input type="submit" value="chercher" />';
        output += '</form>';
        output += '<div id="results"></div>';
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
      update: function() {
        return $.ajax({
          type: 'GET',
          url: 'https://www.betaseries.com/blog/feed/',
          dataType: 'xml',
          async: false,
          success: function(data) {
            var article, blog, i, item, items, _ref;
            items = $(data).find('item');
            blog = [];
            for (i = 0, _ref = Math.min(10, items.length); 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
              item = $(items[i]);
              article = {};
              article.title = item.find('title').text();
              article.description = item.find('description').text();
              article.link = item.find('link').text();
              blog.push(article);
            }
            DB.set('blog', blog);
            return BS.display();
          }
        });
      },
      content: function() {
        var article, articles, i, link, output, title, _len;
        output = '';
        articles = DB.get('blog', []);
        if (articles.length === 0) return '';
        for (i = 0, _len = articles.length; i < _len; i++) {
          article = articles[i];
          title = article.title.substring(0, 40);
          if (article.title.length > 40) title += '..';
          output += '<div class="showtitle">' + title;
          output += '</div>';
          link = '<a href="#" onclick="Fx.openTab(\'' + article.link + '\');">(' + __('read_article') + ')</a>';
          output += '<div>' + article.description.replace(/<a(.*)a>/, link) + '</div>';
          output += '<div style="height:11px;"></div>';
        }
        return output;
      }
    };
  },
  cache: function() {
    return {
      id: 'cache',
      name: 'cache',
      content: function() {
        var d, data, i, output, privates, size, _len;
        output = '';
        output += '<div class="showtitle">Total</div>';
        output += '<div class="episode">';
        output += ' <div class="left">Taille du cache</div>';
        output += ' <div class="right">' + Fx.getCacheFormat(Fx.getCacheSize()) + '</div>';
        output += ' <div class="clear"></div>';
        output += '</div>';
        privates = ['badge', 'historic', 'length', 'options', 'session', 'views'];
        data = [];
        output += '<div class="showtitle">Détail</div>';
        for (i in localStorage) {
          size = localStorage[i];
          if (!(__indexOf.call(privates, i) >= 0)) {
            data.push([i, Fx.getCacheSize(i)]);
          }
        }
        data.sort(function(a, b) {
          return b[1] - a[1];
        });
        for (i = 0, _len = data.length; i < _len; i++) {
          d = data[i];
          output += '<div class="episode">';
          output += ' <div class="left">' + d[0] + '</div>';
          output += ' <div class="right">' + Fx.getCacheFormat(d[1]) + '</div>';
          output += ' <div class="clear"></div>';
          output += '</div>';
        }
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
        output += '<a href="" onclick="BS.load(\'timelineFriends\'); return false;">';
        output += '<img src="../img/timeline.png" id="timeline" class="action" style="margin-bottom:-3px;" />';
        output += __('timelineFriends') + '</a>';
        output += '<a href="" onclick="BS.load(\'planningMember\', \'' + DB.get('session').login + '\'); return false;">';
        output += '<img src="../img/planning.png" id="planning" class="action" style="margin-bottom:-3px;" />';
        output += __('planningMember') + '</a>';
        output += '<a href="" onclick="BS.load(\'membersEpisodes\'); return false;">';
        output += '<img src="../img/episodes.png" id="episodes" class="action" style="margin-bottom:-3px;" />';
        output += __('membersEpisodes') + '</a>';
        output += '<a href="" onclick="BS.load(\'membersShows\', \'' + DB.get('session').login + '\'); return false;">';
        output += '<img src="../img/episodes.png" id="shows" class="action" style="margin-bottom:-3px;" />';
        output += __('membersShows') + '</a>';
        output += '<a href="" onclick="BS.load(\'membersInfos\', \'' + DB.get('session').login + '\'); return false;">';
        output += '<img src="../img/infos.png" id="infos" class="action" style="margin-bottom:-3px; margin-right: 9px;" />';
        output += __('membersInfos') + '</a>';
        output += '<a href="" onclick="BS.load(\'membersNotifications\'); return false;">';
        output += '<img src="../img/notifications.png" id="notifications" class="action" style="margin-bottom:-3px;" />';
        output += __('membersNotifications') + '</a>';
        output += '<a href="" onclick="BS.load(\'searchShow\'); return false;">';
        output += '<img src="../img/search.png" id="search" class="action" style="margin-bottom:-3px;" />';
        output += __('searchShow') + '</a>';
        output += '<a href="" onclick="BS.load(\'searchMember\'); return false;">';
        output += '<img src="../img/search.png" id="search" class="action" style="margin-bottom:-3px;" />';
        output += __('searchMember') + '</a>';
        output += '<a href="" onclick="BS.load(\'blog\'); return false;">';
        output += '<img src="../img/blog.png" id="blog" class="action" style="margin-bottom:-3px;" />';
        output += __('blog') + '</a>';
        output += '<a href="" onclick="BS.load(\'cache\'); return false;">';
        output += '<img src="../img/cache.png" id="cache" class="action" style="margin-bottom:-3px;" />';
        output += __('cache') + '</a>';
        output += '<a href="" onclick="BS.logout(); return false;">';
        output += '<img src="../img/close.png" id="logout" class="action" style="margin-bottom:-3px;" />';
        output += __('logout') + '</a>';
        return output;
      }
    };
  },
  logout: function() {
    ajax.post('/members/destroy', '', function() {
      DB.removeAll();
      DB.init();
      bgPage.badge.init();
      return BS.load('connection');
    }, function() {
      DB.removeAll();
      DB.init();
      bgPage.badge.init();
      return BS.load('connection');
    });
    return false;
  }
};
