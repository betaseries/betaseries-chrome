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
  currentPage: null,
  loadedPage: null,
  load: function() {
    var args;
    args = Array.prototype.slice.call(arguments);
    this.loadedPage = BS[arguments[0]].apply(args.shift(), args);
    return this;
  },
  refresh: function() {
    var o, time, update, updatePage;
    o = this.loadedPage;
    time = Math.floor(new Date().getTime() / 1000);
    updatePage = DB.get('update.' + o.id, 0);
    update = time - updatePage > 3600 || (this.currentPage && this.currentPage.id === o.id);
    if (update) {
      return BS.update(function() {
        return BS.display();
      });
    } else {
      BS.display();
      return $('#status').attr('src', '../img/plot_orange.gif');
    }
  },
  update: function(callback) {
    var o, params;
    o = this.loadedPage;
    params = o.params || '';
    return ajax.post(o.url, params, function(data) {
      var r, tab, time;
      r = o.root;
      tab = data.root[r];
      if (o.postData != null) tab = o.postData(tab);
      if (tab != null) {
        time = Math.floor(new Date().getTime() / 1000);
        DB.set('page.' + o.id, JSON.stringify(tab));
        DB.set('update.' + o.id, time);
      }
      if (callback != null) return callback();
    }, function() {
      if (callback != null) return callback();
    });
  },
  display: function() {
    var blackpages, cache, data, historic, length, o, _ref;
    o = this.loadedPage;
    this.currentPage = o;
    historic = JSON.parse(DB.get('historic'));
    length = historic.length;
    blackpages = ['connection', 'registration'];
    if (historic[length - 1] !== 'page.' + o.id && !(_ref = o.id, __indexOf.call(blackpages, _ref) >= 0)) {
      historic.push('page.' + o.id);
      if (length === 1) $('#back').show();
      DB.set('historic', JSON.stringify(historic));
    }
    cache = DB.get('page.' + o.id, null);
    if (cache != null) {
      data = JSON.parse(cache);
      $('#page').html(o.content(data));
    } else {
      $('#page').html(o.content());
    }
    $('#title').text(__(o.name));
    $('#page').removeClass().addClass(o.name);
    $('#about').height(200);
    return $('.nano').nanoScroller({
      scroll: 'top'
    });
  },
  clean: function(id) {
    DB.remove("page." + id);
    return DB.remove("update." + id);
  },
  showsDisplay: function(url) {
    return {
      id: "showsDisplay." + url,
      name: 'showsDisplay',
      url: "/shows/display/" + url,
      root: 'show',
      content: function(data) {
        var output;
        output = '<img src="' + data.banner + '" width="290" height="70" alt="banner" /><br />';
        output += data.title + '<br />';
        output += data.description + '<br />';
        output += data.status + '<br />';
        output += data.note.mean + '/5 (' + data.note.members + ')<br />';
        if (data.is_in_account === 1) {
          output += '<a href="#' + data.url + '" id="showsRemove">' + __('show_remove') + '</a><br />';
        } else {
          output += '<a href="#' + data.url + '" id="showsAdd">' + __('show_add') + '</a><br />';
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
      content: function(data) {
        var imgDownloaded, n, output, sub, texte3, title;
        episode = data['0']['episodes']['0'];
        title = DB.get('options.display_global') ? "#" + episode.global + " " + title : episode.title;
        if (episode.downloaded === 1) {
          imgDownloaded = "folder";
          texte3 = __('mark_as_not_dl');
        } else if (episode.downloaded === 0) {
          imgDownloaded = "folder_off";
          texte3 = __('mark_as_dl');
        }
        output = "<div id=\"" + url + "\" season=\"" + data['0']['number'] + "\" episode=\"" + episode.episode + "\">";
        output += '<div style="float:left; width:176px; padding-right:5px;">';
        output += "<div class=\"showtitle\">" + episode.show + "</div>";
        output += "<div><span class=\"num\">[" + episode.number + "]</span> " + episode.title + "</div>";
        output += '<div><span class="date">' + date('D d F', episode.date) + '</span></div>';
        output += '<div style="height:10px;"></div>';
        output += "<div>" + episode.description + "</div>";
        output += '</div>';
        output += '<div style="float:left; width:100px; text-align:center;">';
        output += '<img src="' + episode.screen + '" width="100" style="border:1px solid #999999; padding:1px; margin-top:18px;" /><br />';
        output += __('avg_note') + ("<br />" + episode.note.mean + " (" + episode.note.members + ")<br />");
        output += '<img src="../img/' + imgDownloaded + '.png" class="downloaded" title="' + texte3 + '" /> ';
        if (episode.comments) {
          output += '<img src="../img/comment.png" class="commentList" title="' + __('nbr_comments', [episode.comments]) + '" />';
        }
        output += '</div>';
        output += '</div>';
        output += '<div style="clear:both;"></div>';
        output += '<div class="showtitle">' + __('subtitles') + '</div>';
        for (n in episode.subs) {
          sub = episode.subs[n];
          output += '[' + sub.quality + '] ' + sub.language + ' <a href="" class="subs" title="' + sub.file + '" link="' + sub.url + '">' + Fx.subLast(sub.file, 20) + '</a> (' + sub.source + ')<br />';
        }
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
          plot = data[e].date < today ? "red" : "orange";
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
          output += '<div class="showtitle">Actions</div>';
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
      content: function(data) {
        var classes, date_0, dlSrtLanguage, downloaded, empty, episode, extraEpisodes, extraIcon, extraText, extra_episodes, hidden, hiddenShow, hidden_shows, imgDownloaded, jours, n, nbSubs, nbrEpisodes, nbrEpisodesPerSerie, newShow, newTitleShow, output, posEpisode, quality, remain, season, show, stats, sub, subs, textTitle, texte2, texte3, time, title, url, visibleIcon, _ref, _ref2;
        output = "";
        show = "";
        nbrEpisodes = 0;
        posEpisode = 1;
        nbrEpisodesPerSerie = DB.get('options.nbr_episodes_per_serie');
        stats = {};
        newTitleShow = true;
        for (n in data) {
          if (data[n].url in stats) {
            stats[data[n].url]++;
          } else {
            stats[data[n].url] = 1;
          }
        }
        for (n in data) {
          if (newTitleShow) {
            hidden_shows = JSON.parse(DB.get('hidden_shows'));
            hiddenShow = (_ref = data[n].url, __indexOf.call(hidden_shows, _ref) >= 0);
            visibleIcon = hiddenShow ? '../img/arrow_right.gif' : '../img/arrow_down.gif';
            extra_episodes = JSON.parse(DB.get('extra_episodes'));
            extraEpisodes = (_ref2 = data[n].url, __indexOf.call(extra_episodes, _ref2) >= 0);
            if (hiddenShow) {
              extraIcon = '../img/downarrow.gif';
              extraText = __('show_episodes');
            } else {
              extraIcon = extraEpisodes ? '../img/uparrow.gif' : '../img/downarrow.gif';
              extraText = extraEpisodes ? __('hide_episodes') : __('show_episodes');
            }
            output += '<div class="show" id="' + data[n].url + '">';
            output += '<div class="showtitle"><div class="left2"><img src="' + visibleIcon + '" class="toggleShow" /><a href="" onclick="BS.load(\'showsDisplay\', \'' + data[n].url + '\').refresh(); return false;" class="showtitle">' + data[n].show + '</a>';
            output += ' <img src="../img/archive.png" class="archive" title="' + __("archive") + '" /></div>';
            output += '<div class="right2">';
            remain = hiddenShow ? stats[data[n].url] : stats[data[n].url] - nbrEpisodesPerSerie;
            if (newTitleShow) {
              hidden = remain <= 0 ? ' style="display: none;"' : '';
              output += '<span class="toggleEpisodes"' + hidden + '>';
              output += '<span class="labelRemain">' + extraText + '</span>';
              output += ' (<span class="remain">' + remain + '</span>)';
              output += ' <img src="' + extraIcon + '" style="margin-bottom:-2px;" />';
              output += '</span>';
            }
            output += '</div>';
            output += '<div class="clear"></div>';
            output += '</div>';
            show = data[n].show;
            posEpisode = 1;
          }
          season = data[n].season;
          episode = data[n].episode;
          time = Math.floor(new Date().getTime() / 1000);
          jours = Math.floor(time / (24 * 3600));
          date_0 = (24 * 3600) * jours - 2 * 3600;
          newShow = data[n].date >= date_0;
          classes = "";
          hidden = "";
          classes = newShow ? "new_show" : "";
          if (posEpisode > nbrEpisodesPerSerie) {
            classes += ' hidden';
            if (!extraEpisodes || hiddenShow) hidden = ' style="display: none;"';
          } else if (hiddenShow) {
            hidden = ' style="display: none;"';
          }
          output += '<div class="episode ' + classes + '"' + hidden + ' season="' + season + '" episode="' + episode + '">';
          title = DB.get('options.display_global' === 'true') ? '#' + data[n].global + ' ' + title : data[n].title;
          textTitle = title.length > 20 ? ' title="' + title + '"' : '';
          if (posEpisode === 1) {
            texte2 = __('mark_as_seen');
          } else if (posEpisode > 1) {
            texte2 = __('mark_as_seen_pl');
          }
          output += '<div class="left">';
          output += '<img src="../img/plot_red.gif" class="watched" title="' + texte2 + '" /> <span class="num">';
          output += '[' + data[n].number + ']</span> <span class="title"' + textTitle + '>' + Fx.subFirst(title, 20) + '</span>';
          if (newShow) output += ' <span class="new">' + __('new') + '</span>';
          output += '</div>';
          subs = data[n].subs;
          nbSubs = 0;
          url = "";
          quality = -1;
          lang = "";
          for (sub in subs) {
            dlSrtLanguage = DB.get('options.dl_srt_language');
            if ((dlSrtLanguage === "VF" || dlSrtLanguage === 'ALL') && subs[sub]['language'] === "VF" && subs[sub]['quality'] > quality) {
              quality = subs[sub]['quality'];
              url = subs[sub]['url'];
              lang = subs[sub]['language'];
              nbSubs++;
            }
            if ((dlSrtLanguage === "VO" || dlSrtLanguage === 'ALL') && subs[sub]['language'] === "VO" && subs[sub]['quality'] > quality) {
              quality = subs[sub]['quality'];
              url = subs[sub]['url'];
              lang = subs[sub]['language'];
              nbSubs++;
            }
          }
          quality = Math.floor((quality + 1) / 2);
          if (data[n].downloaded !== -1) {
            downloaded = data[n].downloaded === '1';
            if (downloaded) {
              imgDownloaded = "folder";
              texte3 = __('mark_as_not_dl');
            } else {
              imgDownloaded = "folder_off";
              texte3 = __('mark_as_dl');
            }
          }
          output += '<div class="right">';
          empty = '<img src="../img/empty.png" alt="hidden" /> ';
          if (data[n].comments > 0) {
            output += '<img src="../img/comment.png" class="commentList" title="' + __('nbr_comments', [data[n].comments]) + '" /> ';
          } else {
            output += empty;
          }
          if (data[n].downloaded !== -1) {
            output += '<img src="../img/' + imgDownloaded + '.png" class="downloaded" title="' + texte3 + '" /> ';
          } else {
            output += empty;
          }
          if (nbSubs > 0) {
            output += '<img src="../img/srt.png" class="subs" link="' + url + '" quality="' + quality + '" title="' + __('srt_quality', [lang, quality]) + '" /> ';
          }
          output += '</div>';
          output += '<div class="clear"></div>';
          output += '</div>';
          newTitleShow = posEpisode === stats[data[n].url];
          if (newTitleShow) output += '</div>';
          nbrEpisodes++;
          posEpisode++;
        }
        bgPage.badge.update();
        if (nbrEpisodes === 0) output += __('no_episodes_to_see');
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
      postData: function(tab1) {
        var res, tab2, temp;
        res = tab1;
        try {
          temp = DB.get('page.membersNotifications', null);
          tab2 = temp !== null ? JSON.parse(temp) : [];
          res = Fx.concat(tab1, tab2);
        } catch (e) {
          console.log(e);
        }
        return res;
      },
      content: function(data) {
        var n, nbrNotifications, new_date, output, time;
        output = '';
        nbrNotifications = 0;
        time = '';
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
  commentsEpisode: function(url, season, episode) {
    return {
      id: 'commentsEpisode.' + url + '.' + season + '.' + episode,
      name: 'commentsEpisode',
      url: '/comments/episode/' + url,
      params: '&season=' + season + '&episode=' + episode,
      root: 'comments',
      content: function(data) {
        var i, n, new_date, output, time;
        output = '';
        i = 1;
        time = '';
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
        output = '<form id="connect">';
        output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>';
        output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>';
        output += '</table>';
        output += '<div class="valid"><input type="submit" value="' + __('sign_in') + '"> ou ';
        output += '	<a href="#" onclick="BS.load(\'registration\').display(); return false;">' + __('sign_up') + '</a></div>';
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
        output = '<form id="register">';
        output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>';
        output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>';
        output += '<tr><td>' + __('repassword') + '</td><td><input type="password" name="repassword" id="repassword" /></td></tr>';
        output += '<tr><td>' + __('email') + '</td><td><input type="text" name="mail" id="mail" /></td></tr>';
        output += '</table>';
        output += '<div class="valid"><input type="submit" value="' + __('sign_up') + '"> ou ';
        output += '	<a href="#" onclick="BS.load(\'connection\').display(); return false;">' + __('sign_in') + '</a></div>';
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
        output = '<form id="search0">';
        output += '<input type="text" name="terms" id="terms" /> ';
        output += '<input type="submit" value="chercher" />';
        output += '</form>';
        output += '<div id="shows-results"></div>';
        output += '<div id="members-results"></div>';
        setTimeout((function() {
          return $('#terms').focus;
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
  }
};
