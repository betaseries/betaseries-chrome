// Generated by CoffeeScript 1.3.1
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$(document).ready(function() {
  var badgeType, bgPage, clean, message, registerAction;
  bgPage = chrome.extension.getBackgroundPage();
  $('*[title]').live({
    mouseenter: function() {
      var title;
      title = $(this).attr('title');
      $('#help').show();
      return $('#help-text').html(title);
    },
    mouseleave: function() {
      $('#help').hide();
      return $('#help-text').html('');
    }
  });
  $('.watched').live({
    click: function() {
      var content, e, enable_ratings, episode, es, i, login, nbr, nodeRight, params, s, season, show, _i;
      s = $(this).closest('.show');
      show = s.attr('id');
      e = $(this).closest('.episode');
      season = e.attr('season');
      episode = e.attr('episode');
      login = DB.get('session').login;
      enable_ratings = DB.get('options').enable_ratings;
      es = DB.get('member.' + login + '.episodes');
      es[show].start = "" + (parseInt(e.attr('global')) + 1);
      nbr = 0;
      while (e.hasClass('episode')) {
        nbr++;
        if (enable_ratings) {
          $(e).css('background-color', '#f5f5f5');
          $(e).find('.watched').removeClass('watched');
          nodeRight = $(e).find('.right');
          content = "";
          for (i = _i = 1; _i <= 5; i = ++_i) {
            content += '<img src="../img/star_off.gif" width="10" id="star' + i + '" class="star" title="' + i + ' /5" />';
          }
          content += '<img src="../img/archive.png" width="10" class="close_stars" title="' + __('do_not_rate') + '" />';
          nodeRight.html(content);
        } else {
          clean(e);
        }
        e = e.prev();
      }
      es[show].nbr_total -= nbr;
      if (es[show].nbr_total === 0) {
        delete es[show];
      }
      params = "&season=" + season + "&episode=" + episode;
      return ajax.post("/members/watched/" + show, params, function() {
        DB.set('member.' + login + '.episodes', es);
        Cache.force('timelineFriends');
        return bgPage.Badge.updateCache();
      }, function() {
        return registerAction("/members/watched/" + show, params);
      });
    },
    mouseenter: function() {
      var e, _results;
      e = $(this).closest('.episode');
      _results = [];
      while (e.hasClass('episode')) {
        e.find('.watched').css('opacity', 1);
        _results.push(e = e.prev());
      }
      return _results;
    },
    mouseleave: function() {
      var e, _results;
      e = $(this).closest('.episode');
      _results = [];
      while (e.hasClass('episode')) {
        e.find('.watched').css('opacity', 0.5);
        _results.push(e = e.prev());
      }
      return _results;
    }
  });
  $('.watched2').live({
    click: function() {
      var e, episode, es, login, nbr, newStart, params, s, season, show, start, _ref;
      s = $(this).closest('.show');
      show = s.attr('id');
      start = parseInt(s.attr('start'));
      e = $(this).closest('.episode');
      newStart = parseInt(e.attr('global')) + 1;
      s.attr('start', newStart);
      season = e.attr('season');
      episode = e.attr('episode');
      login = DB.get('session').login;
      es = DB.get('member.' + login + '.episodes');
      if ((_ref = !show, __indexOf.call(es, _ref) >= 0)) {
        es[show] = {};
      }
      es[show].start = "" + newStart;
      nbr = 0;
      if (e.attr('global') >= start) {
        while (e.attr('global') >= start) {
          e.find('.watched2').attr('src', '../img/tick.png').css('opacity', 0.5);
          e = e.prev();
          nbr++;
        }
        es[show].nbr_total -= nbr;
        if (es[show].nbr_total === 0) {
          delete es[show];
        }
      } else {
        e.find('.watched2').css('opacity', 0.5);
        e = e.next();
        while (e.attr('global') < start) {
          e.find('.watched2').attr('src', '../img/add.png').css('opacity', 0.5);
          e = e.next();
          nbr++;
        }
        es[show].nbr_total += nbr;
      }
      params = "&season=" + season + "&episode=" + episode;
      return ajax.post("/members/watched/" + show, params, function() {
        DB.set('member.' + login + '.episodes', es);
        Cache.force('timelineFriends');
        return bgPage.Badge.updateCache();
      }, function() {
        return registerAction("/members/watched/" + show, params);
      });
    },
    mouseenter: function() {
      var e;
      e = $(this).closest('.episode');
      return e.find('.watched2').attr('src', '../img/arrow_right.png').css('opacity', 1);
    },
    mouseleave: function() {
      var e, start;
      start = parseInt($(this).closest('.show').attr('start'));
      e = $(this).closest('.episode');
      if (e.attr('global') < start) {
        return e.find('.watched2').attr('src', '../img/tick.png').css('opacity', 0.5);
      } else {
        return e.find('.watched2').attr('src', '../img/empty.png').css('opacity', 1);
      }
    }
  });
  clean = function(node) {
    var nbr, show;
    show = node.closest('.show');
    node.slideToggle('slow', function() {
      return $(this).remove();
    });
    nbr = parseInt($(show).find('.remain').text()) - 1;
    if (nbr === 0) {
      $(show).slideToggle('slow', function() {
        return $(this).remove();
      });
    } else {
      $(show).find('.remain').text(nbr);
    }
    Fx.updateHeight();
    return true;
  };
  $('.star').live({
    mouseenter: function() {
      var nodeStar, _results;
      nodeStar = $(this);
      _results = [];
      while (nodeStar.hasClass('star')) {
        nodeStar.attr('src', '../img/star.gif');
        _results.push(nodeStar = nodeStar.prev());
      }
      return _results;
    },
    mouseleave: function() {
      var nodeStar, _results;
      nodeStar = $(this);
      _results = [];
      while (nodeStar.hasClass('star')) {
        nodeStar.attr('src', '../img/star_off.gif');
        _results.push(nodeStar = nodeStar.prev());
      }
      return _results;
    },
    click: function() {
      var e, episode, params, rate, s, season, show;
      s = $(this).closest('.show');
      show = s.attr('id');
      e = $(this).closest('.episode');
      clean(e);
      season = e.attr('season');
      episode = e.attr('episode');
      rate = $(this).attr('id').substring(4);
      params = "&season=" + season + "&episode=" + episode + "&note=" + rate;
      return ajax.post("/members/note/" + show, params, function() {
        return Cache.force('timelineFriends');
      }, function() {
        return registerAction("/members/watched/" + show, params);
      });
    }
  });
  $('.close_stars').live({
    click: function() {
      var e;
      e = $(this).closest('.episode');
      return clean(e);
    }
  });
  $('.downloaded').live({
    click: function() {
      var downloaded, e, episode, es, global, params, s, season, show;
      s = $(this).closest('.show');
      show = s.attr('id');
      e = $(this).closest('.episode');
      season = e.attr('season');
      episode = e.attr('episode');
      global = e.attr('global');
      es = DB.get('show.' + show + '.episodes');
      downloaded = es[global].downloaded;
      es[global].downloaded = !downloaded;
      DB.set('show.' + show + '.episodes', es);
      if (downloaded) {
        $(this).attr('src', '../img/folder_off.png');
      } else {
        $(this).attr('src', '../img/folder.png');
      }
      params = "&season=" + season + "&episode=" + episode;
      return ajax.post("/members/downloaded/" + show, params, null, function() {
        return registerAction("/members/downloaded/" + show, params);
      });
    }
  });
  $('.subs').live({
    click: function() {
      return Fx.openTab($(this).attr('link'));
    }
  });
  $('#showsArchive').live({
    click: function() {
      var show,
        _this = this;
      show = $(this).attr('href').substring(1);
      $(this).find('span').toggleClass('imgSyncOff imgSyncOn');
      ajax.post("/shows/archive/" + show, "", function() {
        Cache.force('membersEpisodes.all');
        Cache.force('membersInfos.' + DB.get('session').login);
        bgPage.Badge.update();
        $(_this).html('<span class="imgSyncOff"></span>' + __('show_unarchive'));
        return $(_this).attr('id', 'showsUnarchive');
      }, function() {
        return registerAction("/shows/archive/" + show, "");
      });
      return false;
    }
  });
  $('#showsUnarchive').live({
    click: function() {
      var show,
        _this = this;
      show = $(this).attr('href').substring(1);
      $(this).find('span').toggleClass('imgSyncOff imgSyncOn');
      ajax.post("/shows/unarchive/" + show, "", function() {
        Cache.force('membersEpisodes.all');
        Cache.force('membersInfos.' + DB.get('session').login);
        bgPage.Badge.update();
        $(_this).html('<span class="imgSyncOff"></span>' + __('show_archive'));
        return $(_this).attr('id', 'showsArchive');
      }, function() {
        return registerAction("/shows/unarchive/" + show, "");
      });
      return false;
    }
  });
  $('#showsAdd').live({
    click: function() {
      var show,
        _this = this;
      show = $(this).attr('href').substring(1);
      $(this).find('span').toggleClass('imgSyncOff imgSyncOn');
      ajax.post("/shows/add/" + show, "", function() {
        Cache.force('membersEpisodes.all');
        Cache.force('membersInfos.' + DB.get('session').login);
        bgPage.Badge.update();
        $(_this).html('<span class="imgSyncOff"></span>' + __('show_remove'));
        return $(_this).attr('id', 'showsRemove');
      }, function() {
        return registerAction("/shows/add/" + show, "");
      });
      return false;
    }
  });
  $('#showsRemove').live({
    click: function() {
      var show,
        _this = this;
      show = $(this).attr('href').substring(1);
      $(this).find('span').toggleClass('imgSyncOff imgSyncOn');
      $('#showsArchive').slideUp();
      $('#showsUnarchive').slideUp();
      ajax.post("/shows/remove/" + show, "", function() {
        Cache.force('membersEpisodes.all');
        Cache.force('membersInfos.' + DB.get('session').login);
        bgPage.Badge.update();
        $(_this).html('<span class="imgSyncOff"></span>' + __('show_add'));
        return $(_this).attr('id', 'showsAdd');
      }, function() {
        return registerAction("/shows/remove/" + show, "");
      });
      return false;
    }
  });
  $('#connect').live({
    submit: function() {
      var inputs, login, params, password;
      login = $('#login').val();
      password = hex_md5($('#password').val());
      inputs = $(this).find('input').attr({
        disabled: 'disabled'
      });
      params = "&login=" + login + "&password=" + password;
      ajax.post("/members/auth", params, function(data) {
        var token;
        if (data.root.member != null) {
          message('');
          $('#connect').remove();
          token = data.root.member.token;
          DB.set('session', {
            login: login,
            token: data.root.member.token
          });
          menu.show();
          $('#back').hide();
          return BS.load('membersEpisodes');
        } else {
          $('#password').attr('value', '');
          message('<img src="../img/inaccurate.png" /> ' + __('wrong_login_or_password'));
          return inputs.removeAttr('disabled');
        }
      }, function() {
        $('#password').attr('value', '');
        return inputs.removeAttr('disabled');
      });
      return false;
    }
  });
  $('#register').live({
    submit: function() {
      var inputs, login, mail, params, pass, password, repassword;
      login = $('#login').val();
      password = $('#password').val();
      repassword = $('#repassword').val();
      mail = $('#mail').val();
      inputs = $(this).find('input').attr({
        disabled: 'disabled'
      });
      params = "&login=" + login + "&password=" + password + "&mail=" + mail;
      pass = true;
      if (password !== repassword) {
        pass = false;
        message('<img src="../img/inaccurate.png" /> ' + __("password_not_matching"));
      }
      if (login.length > 24) {
        pass = false;
        message('<img src="../img/inaccurate.png" /> ' + __("long_login"));
      }
      if (pass) {
        ajax.post("/members/signup", params, function(data) {
          var err;
          if (data.root.errors.error) {
            err = data.root.errors.error;
            message('<img src="../img/inaccurate.png" /> ' + __('err' + err.code));
            $('#password').attr('value', '');
            $('#repassword').attr('value', '');
            return inputs.removeAttr('disabled');
          } else {
            BS.load('connection').display();
            $('#login').val(login);
            $('#password').val(password);
            return $('#connect').trigger('submit');
          }
        }, function() {
          $('#password').attr('value', '');
          $('#repassword').attr('value', '');
          return inputs.removeAttr('disabled');
        });
      } else {
        $('#password').attr('value', '');
        $('#repassword').attr('value', '');
        inputs.removeAttr('disabled');
      }
      return false;
    }
  });
  $('#searchForMember').live({
    submit: function() {
      var params, terms;
      terms = $('#terms').val();
      params = "&login=" + terms;
      ajax.post("/members/search", params, function(data) {
        var content, member, members, n;
        content = '<div class="showtitle">' + __('members') + '</div>';
        members = data.root.members;
        if (Object.keys(members).length > 0) {
          for (n in members) {
            member = members[n];
            content += '<div class="episode"><a href="#" onclick="BS.load(\'membersInfos\', \'' + member.login + '\'); return false;">' + Fx.subFirst(member.login, 25) + '</a></div>';
          }
        } else {
          content += '<div class="episode">' + __('no_members_found') + '</div>';
        }
        $('#results').html(content);
        return Fx.updateHeight();
      }, function() {});
      return false;
    }
  });
  $('#searchForShow').live({
    submit: function() {
      var params, terms;
      terms = $('#terms').val();
      params = "&title=" + terms;
      ajax.post("/shows/search", params, function(data) {
        var content, n, show, shows;
        content = '<div class="showtitle">' + __('shows') + '</div>';
        shows = data.root.shows;
        if (Object.keys(shows).length > 0) {
          for (n in shows) {
            show = shows[n];
            content += '<div class="episode"><a href="#" onclick="BS.load(\'showsDisplay\', \'' + show.url + '\'); return false;" title="' + show.title + '">' + Fx.subFirst(show.title, 25) + '</a></div>';
          }
        } else {
          content += '<div class="episode">' + __('no_shows_found') + '</div>';
        }
        $('#results').html(content);
        return Fx.updateHeight();
      }, function() {});
      return false;
    }
  });
  registerAction = function(category, params) {
    return console.log("action: " + category + params);
  };
  $('#addfriend').live({
    click: function() {
      var login;
      login = $(this).attr('login');
      ajax.post("/members/add/" + login, '', function(data) {
        $('#addfriend').text(__('remove_to_friends', [login]));
        $('#addfriend').attr('href', '#removefriend');
        $('#addfriend').attr('id', 'removefriend');
        $('#friendshipimg').attr('src', '../img/friend_remove.png');
        Cache.force('membersInfos.' + DB.get('session').login);
        Cache.force('membersInfos.' + login);
        return Cache.force('timelineFriends');
      });
      return false;
    }
  });
  $('#removefriend').live({
    click: function() {
      var login;
      login = $(this).attr('login');
      ajax.post("/members/delete/" + login, '', function(data) {
        $('#removefriend').text(__('add_to_friends', [login]));
        $('#removefriend').attr('href', '#addfriend');
        $('#removefriend').attr('id', 'addfriend');
        $('#friendshipimg').attr('src', '../img/friend_add.png');
        Cache.force('membersInfos.' + DB.get('session').login);
        Cache.force('membersInfos.' + login);
        return Cache.force('timelineFriends');
      });
      return false;
    }
  });
  $('.toggleShow').live({
    click: function() {
      var hidden, login, show, showName, shows;
      show = $(this).closest('.show');
      showName = $(show).attr('id');
      login = DB.get('session').login;
      shows = DB.get('member.' + login + '.shows');
      hidden = shows[showName].hidden;
      shows[showName].hidden = !hidden;
      DB.set('member.' + login + '.shows', shows);
      $(show).find('.episode').slideToggle();
      if (shows[showName].hidden) {
        $(this).attr('src', '../img/arrow_right.gif');
      } else {
        $(this).attr('src', '../img/arrow_down.gif');
      }
      return Fx.updateHeight();
    }
  });
  $('.toggleSeason').live({
    click: function() {
      var hidden, season, seasonName;
      season = $(this).closest('.season');
      seasonName = $(season).attr('id');
      hidden = $(season).hasClass('hidden');
      $(season).toggleClass('hidden');
      $(season).find('.episode').slideToggle();
      if (hidden) {
        $(this).attr('src', '../img/arrow_down.gif');
      } else {
        $(this).attr('src', '../img/arrow_right.gif');
      }
      return Fx.updateHeight();
    }
  });
  $('#logoLink').click(function() {
    return Fx.openTab(ajax.site_url, true);
  }).attr('title', __("logo"));
  $('#versionLink').click(function() {
    return Fx.openTab('https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true);
  }).attr('title', __("version"));
  $('#back').click(function() {
    var historic, length;
    historic = DB.get('historic');
    if ((length = historic.length) >= 2) {
      historic.pop();
      BS.back();
      DB.set('historic', historic);
      if (length === 2) {
        $(this).hide();
      }
    }
    return false;
  }).attr('title', __("back"));
  $('#close').click(function() {
    return window.close();
  }).attr('title', __('close'));
  $('#sync').click(function() {
    return BS.refresh();
  }).attr('title', __('sync'));
  $('#menu').click(function() {
    if (BS.currentView.id === 'menu') {
      return Historic.refresh();
    } else {
      return BS.load('menu');
    }
  }).attr('title', __('menu'));
  $('#trash').click(function() {
    Cache.remove();
    return $(this).hide();
  }).attr('title', __('trash'));
  message = function(content) {
    return $('#message').html(content);
  };
  DB.init();
  Fx.updateHeight(true);
  Fx.checkVersion();
  if (bgPage.connected()) {
    badgeType = DB.get('badge').type;
    return BS.load(badgeType);
  } else {
    return BS.load('connection');
  }
});
