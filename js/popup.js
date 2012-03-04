var __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$(document).ready(function() {
  var badgeType, bgPage, message, registerAction;
  bgPage = chrome.extension.getBackgroundPage();
  $('.watched').live({
    click: function() {
      var cleanEpisode, content, enable_ratings, episode, i, n, next, node, nodeRight, nodeShow, params, season, show;
      node = $(this).parent().parent();
      season = node.attr('season');
      episode = node.attr('episode');
      nodeShow = node.parent();
      show = nodeShow.attr('id');
      params = "&season=" + season + "&episode=" + episode;
      enable_ratings = DB.get('options.enable_ratings');
      cleanEpisode = function(n) {
        var newremain, remain;
        if ($(nodeShow).find('.episode').length === 0) nodeShow.slideToggle();
        $('#' + show + ' .episode:hidden:lt(' + n + ')').removeClass('hidden').slideToggle();
        remain = nodeShow.find('.remain');
        newremain = parseInt(remain.text()) - n;
        remain.text(newremain);
        if (newremain < 1) remain.parent().hide();
        return Fx.updateHeight();
      };
      n = 0;
      next = node.next();
      while (node.hasClass('episode')) {
        if (enable_ratings === 'true') {
          $(node).find('.watched').attr('src', '../img/plot_orange.gif');
          $(node).find('.watched').removeClass('watched');
          nodeRight = $(node).find('.right');
          content = "";
          for (i = 1; i <= 5; i++) {
            content += '<img src="../img/star_off.gif" width="10" id="star' + i + '" class="star" title="' + i + ' /5" />';
          }
          content += '<img src="../img/archive.png" width="10" class="close_stars" title="' + __('do_not_rate') + '" />';
          nodeRight.html(content);
          $('.star').on({
            mouseenter: function() {
              var nodeStar, _results;
              $(this).css('cursor', 'pointer');
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
              $(this).css('cursor', 'auto');
              nodeStar = $(this);
              _results = [];
              while (nodeStar.hasClass('star')) {
                nodeStar.attr('src', '../img/star_off.gif');
                _results.push(nodeStar = nodeStar.prev());
              }
              return _results;
            },
            click: function() {
              var nodeEpisode, rate;
              nodeEpisode = $(this).parent().parent();
              if (nodeEpisode.hasClass('episode')) {
                nodeEpisode.slideToggle();
                nodeEpisode.removeClass('episode');
                rate = $(this).attr('id').substring(4);
                params += "&note=" + rate;
                ajax.post("/members/watched/" + show, params, function() {
                  Fx.toRefresh('membersEpisodes.all');
                  return bgPage.badge.update();
                }, function() {
                  return registerAction("/members/watched/" + show, params);
                });
                return cleanEpisode(1);
              }
            }
          });
          $('.close_stars').on({
            mouseenter: function() {
              $(this).css('cursor', 'pointer');
              return $(this).attr('src', '../img/archive_on.png');
            },
            mouseleave: function() {
              $(this).css('cursor', 'auto');
              return $(this).attr('src', '../img/archive.png');
            },
            click: function() {
              var nodeEpisode;
              nodeEpisode = $(this).parent().parent();
              if (nodeEpisode.hasClass('episode')) {
                nodeEpisode.slideToggle();
                nodeEpisode.removeClass('episode');
                ajax.post("/members/watched/" + show, params, function() {
                  Fx.toRefresh('membersEpisodes.all');
                  return bgPage.badge.update();
                }, function() {
                  return registerAction("/members/watched/" + show, params);
                });
                return cleanEpisode(1);
              }
            }
          });
        } else if (enable_ratings === 'false') {
          node.slideToggle();
          node.removeClass('episode');
        }
        node = node.prev();
        n++;
      }
      if (enable_ratings === 'false') {
        ajax.post("/members/watched/" + show, params, function() {
          Fx.toRefresh('membersEpisodes.all');
          return bgPage.badge.update();
        }, function() {
          return registerAction("/members/watched/" + show, params);
        });
        return cleanEpisode(n);
      }
    },
    mouseenter: function() {
      var node, _results;
      $(this).css('cursor', 'pointer');
      $(this).attr('src', '../img/plot_green.gif');
      node = $(this).parent().parent().prev();
      _results = [];
      while (node.hasClass('episode')) {
        node.find('.watched').attr('src', '../img/plot_green.gif');
        _results.push(node = node.prev());
      }
      return _results;
    },
    mouseleave: function() {
      var node, _results;
      $(this).css('cursor', 'auto');
      $(this).attr('src', '../img/plot_red.gif');
      node = $(this).parent().parent().prev();
      _results = [];
      while (node.hasClass('episode')) {
        node.find('.watched').attr('src', '../img/plot_red.gif');
        _results.push(node = node.prev());
      }
      return _results;
    }
  });
  $('.downloaded').live({
    click: function() {
      var downloaded, es, img, number, params, show;
      img = $(this);
      show = img.attr('show');
      number = img.attr('number');
      es = DB.get('episodes.' + show);
      downloaded = es[number].downloaded;
      es[number].downloaded = !downloaded;
      DB.set('episodes.' + show, es);
      if (downloaded) {
        img.attr('src', '../img/folder_add.png');
      } else {
        img.attr('src', '../img/folder_delete.png');
      }
      params = "&season=" + es[number].season + "&episode=" + es[number].episode;
      return ajax.post("/members/downloaded/" + show, params, null, function() {
        return registerAction("/members/downloaded/" + show, params);
      });
    },
    mouseenter: function() {
      var img;
      img = $(this);
      img.css('cursor', 'pointer');
      if (img.attr('src') === '../img/folder_off.png') {
        img.attr('src', '../img/folder_add.png');
      }
      if (img.attr('src') === '../img/folder.png') {
        return img.attr('src', '../img/folder_delete.png');
      }
    },
    mouseleave: function() {
      var img;
      img = $(this);
      img.css('cursor', 'auto');
      if (img.attr('src') === '../img/folder_add.png') {
        img.attr('src', '../img/folder_off.png');
      }
      if (img.attr('src') === '../img/folder_delete.png') {
        return img.attr('src', '../img/folder.png');
      }
    }
  });
  $('.comments').live({
    click: function() {
      var episode, node, season, show, showName, view;
      view = BS.currentView.name;
      if (view === 'showsEpisodes') {
        node = $(this).parent();
        season = node.attr('season');
        episode = node.attr('episode');
        show = node.attr('id');
        showName = node.find('.showtitle').eq(0).text();
      } else if (view === 'membersEpisodes') {
        node = $(this).parent().parent();
        season = node.attr('season');
        episode = node.attr('episode');
        show = node.parent().attr('id');
        showName = node.parent().find('.showtitle .left2 .showtitle').text();
      }
      return BS.load('commentsEpisode', show, season, episode, showName);
    },
    mouseenter: function() {
      return $(this).css('cursor', 'pointer');
    },
    mouseleave: function() {
      return $(this).css('cursor', 'auto');
    }
  });
  $('.num').live({
    click: function() {
      var episode, number, season, url;
      url = $(this).attr('show');
      number = $(this).attr('number');
      number = Fx.splitNumber(number);
      season = number.season;
      episode = number.episode;
      return BS.load('showsEpisodes', url, season, episode);
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
      Fx.openTab($(this).attr('link'));
      return false;
    },
    mouseenter: function() {
      var quality;
      $(this).css('cursor', 'pointer');
      quality = $(this).attr('quality');
      return $(this).attr('src', '../img/dl_' + quality + '.png');
    },
    mouseleave: function() {
      $(this).attr('src', '../img/srt.png');
      return $(this).css('cursor', 'auto');
    }
  });
  $('.archive').live({
    click: function() {
      var show;
      show = $(this).parent().parent().parent().attr('id');
      $('#' + show).slideUp();
      ajax.post("/shows/archive/" + show, "", function() {
        Fx.toRefresh('membersEpisodes.all');
        Fx.toRefresh('membersInfos.' + DB.get('member.login'));
        return bgPage.badge.update();
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
        Fx.toRefresh('membersEpisodes.all');
        Fx.toRefresh('membersInfos.' + DB.get('member.login'));
        return bgPage.badge.update();
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
        Fx.toRefresh('membersEpisodes.all');
        Fx.toRefresh('membersInfos.' + DB.get('member.login'));
        return bgPage.badge.update();
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
        Fx.toRefresh('membersEpisodes.all');
        Fx.toRefresh('membersInfos.' + DB.get('member.login'));
        return bgPage.badge.update();
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
        var member, token;
        if (data.root.member != null) {
          message('');
          $('#connect').remove();
          token = data.root.member.token;
          DB.init();
          member = {
            login: login,
            token: data.root.member.token
          };
          DB.set('member', member);
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
  $('#search0').live({
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
        $('#shows-results').html(content);
        return Fx.updateHeight();
      }, function() {});
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
        $('#members-results').html(content);
        return Fx.updateHeight();
      }, function() {});
      return false;
    }
  });
  registerAction = function(category, params) {
    return console.log("action: " + category + params);
  };
  $('.toggleEpisodes').live({
    click: function() {
      var extraEpisodes, extra_episodes, hiddenShow, hidden_shows, hiddens, show, showName;
      show = $(this).parent().parent().parent();
      hiddens = show.find('div.episode.hidden');
      showName = $(show).attr('id');
      hidden_shows = DB.get('hidden_shows');
      hiddenShow = __indexOf.call(hidden_shows, showName) >= 0;
      if (hiddenShow) {
        $(show).find('.toggleShow').trigger('click');
        return false;
      }
      hiddens.slideToggle();
      extra_episodes = DB.get('extra_episodes');
      extraEpisodes = __indexOf.call(extra_episodes, showName) >= 0;
      if (extraEpisodes) {
        $(this).find('.labelRemain').text(__('show_episodes'));
        $(this).find('img').attr('src', '../img/downarrow.gif');
      } else {
        $(this).find('.labelRemain').text(__('hide_episodes'));
        $(this).find('img').attr('src', '../img/uparrow.gif');
      }
      if (!extraEpisodes) {
        extra_episodes.push(showName);
      } else {
        extra_episodes.splice(extra_episodes.indexOf(showName, 1));
      }
      DB.set('extra_episodes', extra_episodes);
      Fx.updateHeight();
      return false;
    },
    mouseenter: function() {
      $(this).css('cursor', 'pointer');
      return $(this).css('color', '#900');
    },
    mouseleave: function() {
      $(this).css('cursor', 'auto');
      return $(this).css('color', '#000');
    }
  });
  $('#addfriend').live({
    click: function() {
      var login;
      login = $(this).attr('login');
      ajax.post("/members/add/" + login, '', function(data) {
        $('#addfriend').text(__('remove_to_friends', [login]));
        $('#addfriend').attr('href', '#removefriend');
        $('#addfriend').attr('id', 'removefriend');
        $('#friendshipimg').attr('src', '../img/friend_remove.png');
        Fx.toRefresh('membersInfos.' + DB.get('member.login'));
        Fx.toRefresh('membersInfos.' + login);
        return Fx.toRefresh('timelineFriends');
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
        Fx.toRefresh('membersInfos.' + DB.get('member.login'));
        Fx.toRefresh('membersInfos.' + login);
        return Fx.toRefresh('timelineFriends');
      });
      return false;
    }
  });
  $('.toggleShow').live({
    click: function() {
      var extraEpisodes, extra_episodes, hiddenShow, hidden_shows, imgSrc, labelRemainText, nb_episodes, nb_hiddens, nbr_episodes_per_serie, remain, show, showName, toggleEpisodes;
      show = $(this).parent().parent().parent();
      showName = $(show).attr('id');
      nbr_episodes_per_serie = DB.get('options.nbr_episodes_per_serie');
      hidden_shows = DB.get('hidden_shows');
      hiddenShow = __indexOf.call(hidden_shows, showName) >= 0;
      extra_episodes = DB.get('extra_episodes');
      extraEpisodes = __indexOf.call(extra_episodes, showName) >= 0;
      nb_hiddens = $(show).find('div.episode.hidden').length;
      nb_episodes = $(show).find('div.episode').length;
      toggleEpisodes = $(show).find('.toggleEpisodes');
      labelRemainText = hiddenShow ? __('hide_episodes') : __('show_episodes');
      imgSrc = hiddenShow ? '../img/uparrow.gif' : '../img/downarrow.gif';
      toggleEpisodes.find('.labelRemain').text(labelRemainText);
      toggleEpisodes.find('img').attr('src', imgSrc);
      if (extraEpisodes) {
        if (hiddenShow) {
          toggleEpisodes.find('.remain').text(nb_hiddens);
        } else {
          remain = parseInt(toggleEpisodes.find('.remain').text());
          remain += parseInt(nbr_episodes_per_serie);
          toggleEpisodes.find('.remain').text(remain);
        }
        $(show).find('.episode').slideToggle();
      } else {
        if (hiddenShow) {
          if (nb_hiddens === 0) {
            toggleEpisodes.hide();
          } else {
            toggleEpisodes.find('.labelRemain').text(__('show_episodes'));
            toggleEpisodes.find('.remain').text(nb_hiddens);
            toggleEpisodes.find('img').attr('src', '../img/downarrow.gif');
          }
        } else {
          if (nb_hiddens === 0) {
            toggleEpisodes.find('.labelRemain').text(__('show_episodes'));
            toggleEpisodes.find('.remain').text(nb_episodes);
            toggleEpisodes.find('img').attr('src', '../img/downarrow.gif');
            toggleEpisodes.find('.remain').text(remain);
            toggleEpisodes.show();
          } else {
            remain = parseInt(toggleEpisodes.find('.remain').text());
            remain += parseInt(nbr_episodes_per_serie);
            toggleEpisodes.find('.remain').text(remain);
          }
        }
        $(show).find('.episode:lt(' + nbr_episodes_per_serie + ')').slideToggle();
      }
      if (!hiddenShow) {
        hidden_shows.push(showName);
        $(this).attr('src', '../img/arrow_right.gif');
      } else {
        hidden_shows.splice(hidden_shows.indexOf(showName), 1);
        $(this).attr('src', '../img/arrow_down.gif');
      }
      DB.set('hidden_shows', hidden_shows);
      return Fx.updateHeight();
    },
    mouseenter: function() {
      return $(this).css('cursor', 'pointer');
    },
    mouseleave: function() {
      return $(this).css('cursor', 'auto');
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
  $('#status').click(function() {
    BS.refresh();
    return false;
  }).attr('title', __("refresh"));
  $('#options').click(function() {
    return Fx.openTab(chrome.extension.getURL("../html/options.html", true));
  }).attr('title', __("options"));
  $('#logout').live('click', function() {
    ajax.post("/members/destroy", '', function() {
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
  }).attr('title', __("logout"));
  $('#close').click(function() {
    window.close();
    return false;
  }).attr('title', __('close'));
  $('#blog').live('click', function() {
    BS.load('blog');
    return false;
  }).attr('title', __("blog"));
  $('#planning').live('click', function() {
    BS.load('planningMember');
    return false;
  }).attr('title', __("planningMember"));
  $('#episodes').live('click', function() {
    BS.load('membersEpisodes');
    return false;
  }).attr('title', __("membersEpisodes"));
  $('#timeline').live('click', function() {
    BS.load('timelineFriends');
    return false;
  }).attr('title', __("timelineFriends"));
  $('#notifications').live('click', function() {
    BS.load('membersNotifications');
    return false;
  }).attr('title', __("membersNotifications"));
  $('#infos').live('click', function() {
    BS.load('membersInfos');
    return false;
  }).attr('title', __("membersInfos"));
  $('#search').live('click', function() {
    BS.load('searchForm');
    return false;
  }).attr('title', __("searchForm"));
  message = function(content) {
    return $('#message').html(content);
  };
  DB.init();
  if (bgPage.connected()) {
    badgeType = DB.get('badge').type;
    return BS.load('membersEpisodes');
  } else {
    return BS.load('connection');
  }
});
