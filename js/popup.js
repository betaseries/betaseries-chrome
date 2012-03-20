
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
      var content, e, enable_ratings, episode, es, i, login, nodeRight, nodes, params, s, season, show;
      s = $(this).closest('.show');
      show = s.attr('id');
      e = $(this).closest('.episode');
      season = e.attr('season');
      episode = e.attr('episode');
      login = DB.get('session').login;
      enable_ratings = DB.get('options').enable_ratings;
      nodes = [];
      while (e.hasClass('episode')) {
        if (enable_ratings) {
          $(e).css('background-color', '#f5f5f5');
          $(e).find('.watched').removeClass('watched');
          nodeRight = $(e).find('.right');
          content = "";
          for (i = 1; i <= 5; i++) {
            content += '<img src="../img/star_off.gif" width="10" id="star' + i + '" class="star" title="' + i + ' /5" />';
          }
          content += '<img src="../img/archive.png" width="10" class="close_stars" title="' + __('do_not_rate') + '" />';
          nodeRight.html(content);
        } else {
          nodes.push(e);
        }
        e = e.prev();
      }
      if (!enable_ratings) {
        nodes.reverse();
        es = clean(nodes);
        params = "&season=" + season + "&episode=" + episode;
        return ajax.post("/members/watched/" + show, params, function() {
          DB.set('member.' + login + '.episodes', es);
          Cache.force('timelineFriends');
          return bgPage.Badge.updateCache();
        }, function() {
          return registerAction("/members/watched/" + show, params);
        });
      }
    },
    mouseenter: function() {
      var node, _results;
      node = $(this).closest('.episode');
      _results = [];
      while (node.hasClass('episode')) {
        node.find('.watched').css('opacity', 1);
        _results.push(node = node.prev());
      }
      return _results;
    },
    mouseleave: function() {
      var node, _results;
      node = $(this).closest('.episode');
      _results = [];
      while (node.hasClass('episode')) {
        node.find('.watched').css('opacity', 0.5);
        _results.push(node = node.prev());
      }
      return _results;
    }
  });
  clean = function(nodes) {
    var episode, es, i, login, memberEpisodes, nbr, nbrEpisodes, nextGlobal, node, s, show, _len;
    login = DB.get('session').login;
    show = nodes[0].closest('.show').attr('id');
    memberEpisodes = DB.get('member.' + login + '.episodes');
    s = DB.get('member.' + login + '.shows')[show];
    es = DB.get('show.' + show + '.episodes');
    nbrEpisodes = $('#' + show).find('.episode').length;
    nextGlobal = $('#' + show).find('.episode').last().attr('global');
    nextGlobal = parseInt(nextGlobal) + 1;
    nbr = 0;
    for (i = 0, _len = nodes.length; i < _len; i++) {
      node = nodes[i];
      memberEpisodes[show].start = "" + (parseInt(node.attr('global')) + 1);
      memberEpisodes[show].nbr_total--;
      if (memberEpisodes[show].nbr_total === 0) delete memberEpisodes[show];
      node.slideToggle('slow', function() {
        return $(this).remove();
      });
      if (es[nextGlobal] != null) {
        episode = Content.episode(es[nextGlobal], s);
        $('#' + show).append(episode);
      } else {
        nbrEpisodes--;
      }
      nextGlobal++;
      nbr++;
    }
    nbr = parseInt($('#' + show + ' .remain').text()) - nbr;
    if (nbrEpisodes === 0 && nbr <= 0) {
      $('#' + show).slideToggle('slow', function() {
        return $(this).remove();
      });
    } else {
      if (nbr > 0) $('#' + show + ' .remain').text('+' + nbr);
    }
    Fx.updateHeight();
    return memberEpisodes;
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
      var e, episode, es, login, params, rate, s, season, show;
      s = $(this).closest('.show');
      show = s.attr('id');
      e = $(this).closest('.episode');
      es = clean([e]);
      season = e.attr('season');
      episode = e.attr('episode');
      login = DB.get('session').login;
      rate = $(this).attr('id').substring(4);
      params = "&season=" + season + "&episode=" + episode + "&note=" + rate;
      return ajax.post("/members/watched/" + show, params, function() {
        DB.set('member.' + login + '.episodes', es);
        Cache.force('timelineFriends');
        return bgPage.Badge.updateCache();
      }, function() {
        return registerAction("/members/watched/" + show, params);
      });
    }
  });
  $('.close_stars').live({
    click: function() {
      var e, episode, es, login, params, s, season, show;
      s = $(this).closest('.show');
      show = s.attr('id');
      e = $(this).closest('.episode');
      es = clean([e]);
      season = e.attr('season');
      episode = e.attr('episode');
      login = DB.get('session').login;
      params = "&season=" + season + "&episode=" + episode;
      return ajax.post("/members/watched/" + show, params, function() {
        DB.set('member.' + login + '.episodes', es);
        Cache.force('timelineFriends');
        return bgPage.Badge.updateCache();
      }, function() {
        return registerAction("/members/watched/" + show, params);
      });
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
  $('.comments').live({
    click: function() {
      var e, episode, global, s, season, show;
      s = $(this).closest('.show');
      show = s.attr('id');
      e = $(this).closest('.episode');
      season = e.attr('season');
      episode = e.attr('episode');
      global = e.attr('global');
      return BS.load('commentsEpisode', show, season, episode, global);
    }
  });
  $('.num').live({
    click: function() {
      var e, episode, global, s, season, show;
      s = $(this).closest('.show');
      show = s.attr('id');
      e = $(this).closest('.episode');
      season = e.attr('season');
      episode = e.attr('episode');
      global = e.attr('global');
      return BS.load('showsEpisodes', show, season, episode, global);
    },
    mouseenter: function() {
      $(this).css('cursor', 'pointer');
      return $(this).css('color', '#900');
    },
    mouseleave: function() {
      $(this).css('cursor', 'auto');
      return $(this).css('color', '#1a4377');
    }
  });
  $('.subs').live({
    click: function() {
      return Fx.openTab($(this).attr('link'));
    }
  });
  $('.archive').live({
    click: function() {
      var show;
      show = $(this).parent().parent().parent().attr('id');
      $('#' + show).slideUp();
      ajax.post("/shows/archive/" + show, "", function() {
        Cache.force('membersEpisodes.all');
        Cache.force('membersInfos.' + DB.get('session').login);
        return bgPage.Badge.update();
      }, function() {
        return registerAction("/shows/archive/" + show, "");
      });
      Fx.updateHeight();
      return false;
    }
  });
  $('.unarchive').live({
    click: function() {
      var show;
      show = $(this).parent().attr('id');
      $('#' + show).hide();
      ajax.post("/shows/unarchive/" + show, "", function() {
        Cache.force('membersEpisodes.all');
        Cache.force('membersInfos.' + DB.get('session').login);
        return bgPage.Badge.update();
      }, function() {
        return registerAction("/shows/unarchive/" + show, "");
      });
      Fx.updateHeight();
      return false;
    }
  });
  $('#showsAdd').live({
    click: function() {
      var show;
      show = $(this).attr('href').substring(1);
      $('#showsAdd').html(__('show_added'));
      ajax.post("/shows/add/" + show, "", function() {
        Cache.force('membersEpisodes.all');
        Cache.force('membersInfos.' + DB.get('session').login);
        return bgPage.Badge.update();
      }, function() {
        return registerAction("/shows/add/" + show, "");
      });
      return false;
    }
  });
  $('#showsRemove').live({
    click: function() {
      var show;
      show = $(this).attr('href').substring(1);
      $('#showsRemove').html(__('show_removed'));
      ajax.post("/shows/remove/" + show, "", function() {
        Cache.force('membersEpisodes.all');
        Cache.force('membersInfos.' + DB.get('session').login);
        return bgPage.Badge.update();
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
      var hidden, login, nbr_episodes_per_serie, remain, show, showName, shows;
      show = $(this).closest('.show');
      showName = $(show).attr('id');
      nbr_episodes_per_serie = DB.get('options').nbr_episodes_per_serie;
      login = DB.get('session').login;
      shows = DB.get('member.' + login + '.shows');
      hidden = shows[showName].hidden;
      shows[showName].hidden = !hidden;
      DB.set('member.' + login + '.shows', shows);
      $(show).find('.episode').slideToggle();
      remain = parseInt(show.find('.remain').text());
      if (shows[showName].hidden) {
        $(this).attr('src', '../img/arrow_right.gif');
        remain += nbr_episodes_per_serie;
      } else {
        $(this).attr('src', '../img/arrow_down.gif');
        remain -= nbr_episodes_per_serie;
      }
      if (remain > 0) remain = '+' + remain;
      if (remain > 0) {
        show.find('.remain').removeClass('hidden');
      } else {
        show.find('.remain').addClass('hidden');
      }
      show.find('.remain').text(remain);
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
      if (length === 2) $(this).hide();
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
  $('#versionLink').text(Fx.getVersion());
  if (bgPage.connected()) {
    badgeType = DB.get('badge').type;
    return BS.load(badgeType);
  } else {
    return BS.load('connection');
  }
});
