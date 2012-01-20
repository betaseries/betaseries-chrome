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
      cleanEpisode = function() {
        var newremain, remain;
        if ($(nodeShow).find('.episode').length === 0) nodeShow.slideToggle();
        $('#' + show + ' .episode:hidden:lt(' + n + ')').slideToggle();
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
                  BS.load('membersEpisodes').update();
                  return bgPage.badge.update();
                }, function() {
                  return registerAction("/members/watched/" + show, params);
                });
                return cleanEpisode();
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
                  BS.load('membersEpisodes').update();
                  return bgPage.badge.update();
                }, function() {
                  return registerAction("/members/watched/" + show, params);
                });
                return cleanEpisode();
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
          BS.load('membersEpisodes').update();
          return bgPage.badge.update();
        }, function() {
          return registerAction("/members/watched/" + show, params);
        });
        return cleanEpisode();
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
      var episode, node, params, season, show, view;
      view = BS.currentPage.name;
      node = $(this).parent().parent();
      season = node.attr('season');
      episode = node.attr('episode');
      if (view === 'membersEpisodes') show = node.parent().attr('id');
      if (view === 'showsEpisodes') show = node.attr('id');
      params = "&season=" + season + "&episode=" + episode;
      if ($(this).attr('src') === '../img/folder_delete.png') {
        $(this).attr('src', '../img/folder_add.png');
      } else if ($(this).attr('src') === '../img/folder_add.png') {
        $(this).attr('src', '../img/folder_delete.png');
      }
      return ajax.post("/members/downloaded/" + show, params, function() {
        return BS.load('membersEpisodes').update();
      }, function() {
        return registerAction("/members/downloaded/" + show, params);
      });
    },
    mouseenter: function() {
      $(this).css('cursor', 'pointer');
      if ($(this).attr('src') === '../img/folder_off.png') {
        $(this).attr('src', '../img/folder_add.png');
      }
      if ($(this).attr('src') === '../img/folder.png') {
        return $(this).attr('src', '../img/folder_delete.png');
      }
    },
    mouseleave: function() {
      $(this).css('cursor', 'auto');
      if ($(this).attr('src') === '../img/folder_add.png') {
        $(this).attr('src', '../img/folder_off.png');
      }
      if ($(this).attr('src') === '../img/folder_delete.png') {
        return $(this).attr('src', '../img/folder.png');
      }
    }
  });
  $('.commentList').live({
    click: function() {
      var episode, node, season, show, view;
      view = BS.currentPage.name;
      node = $(this).parent().parent();
      season = node.attr('season');
      episode = node.attr('episode');
      if (view === 'membersEpisodes') show = node.parent().attr('id');
      if (view === 'showsEpisodes') show = node.attr('id');
      return BS.load('commentsEpisode', show, season, episode).refresh();
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
      var episode, node, season, url, view;
      view = BS.currentPage.name;
      if (view === 'membersEpisodes') {
        node = $(this).parent().parent();
        url = node.parent().attr('id');
        season = node.attr('season');
        episode = node.attr('episode');
      }
      if (view === 'planningMember') {
        node = $(this).parent();
        url = node.attr('url');
        season = node.attr('season');
        episode = node.attr('episode');
      }
      return BS.load('showsEpisodes', url, season, episode).refresh();
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
      Fx.openTab($(this).attr('link', false));
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
        BS.load('membersEpisodes').update();
        BS.load('membersInfos').update();
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
        BS.load('membersEpisodes').update();
        BS.load('membersInfos').update();
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
        BS.load('membersEpisodes').update();
        BS.load('membersInfos').update();
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
        BS.load('membersEpisodes').update();
        BS.load('membersInfos').update();
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
        var token;
        if (data.root.member != null) {
          message('');
          $('#connect').remove();
          token = data.root.member.token;
          DB.init();
          DB.set('member.login', login);
          DB.set('member.token', data.root.member.token);
          menu.show();
          $('#back').hide();
          return BS.load('membersEpisodes').refresh();
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
            console.log("error code : " + err.code);
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
        var content, n, show;
        if (data.root.shows != null) {
          content = '<div class="showtitle">' + __('shows') + '</div>';
          for (n in data.root.shows) {
            show = data.root.shows[n];
            content += '<div class="episode"><a href="#" onclick="BS.load(\'showsDisplay\', \'' + show.url + '\').refresh(); return false;" title="' + show.title + '">' + Fx.subFirst(show.title, 25) + '</a></div>';
          }
          $('#shows-results').html(content);
        } else {
          $('#shows-results').html('<div class="episode">' + __('no_shows_found') + '</div>');
        }
        return Fx.updateHeight();
      }, function() {});
      params = "&login=" + terms;
      ajax.post("/members/search", params, function(data) {
        var content, member, n;
        if (data.root.members != null) {
          content = '<div class="showtitle">' + __('members') + '</div>';
          for (n in data.root.members) {
            member = data.root.members[n];
            content += '<div class="episode"><a href="#" onclick="BS.load(\'membersInfos\', \'' + member.login + '\').refresh(); return false;">' + Fx.subFirst(member.login, 25) + '</a></div>';
          }
          $('#members-results').html(content);
        } else {
          $('#members-results').html('<div class="episode">' + __('no_members_found') + '</div>');
        }
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
      hidden_shows = JSON.parse(DB.get('hidden_shows'));
      hiddenShow = __indexOf.call(hidden_shows, showName) >= 0;
      if (hiddenShow) {
        $(show).find('.toggleShow').trigger('click');
        return false;
      }
      hiddens.slideToggle();
      extra_episodes = JSON.parse(DB.get('extra_episodes'));
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
      DB.set('extra_episodes', JSON.stringify(extra_episodes));
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
      var login, params;
      login = $(this).attr('login');
      params = {};
      ajax.post("/members/add/" + login, params, function(data) {
        $(this).attr('href', '#removefriend');
        $(this).attr('id', 'removefriend');
        $(this).text(__('remove_to_friends', [login]));
        return $('#friendshipimg').attr('src', '../img/friend_remove.png');
      });
      return false;
    }
  });
  $('#removefriend').live({
    click: function() {
      var login, params;
      login = $(this).attr('login');
      params = {};
      ajax.post("/members/delete/" + login, params, function(data) {
        $(this).attr('href', '#addfriend');
        $(this).attr('id', 'addfriend');
        $(this).text(__('add_to_friends', [login]));
        return $('#friendshipimg').attr('src', '../img/friend_add.png');
      });
      return false;
    }
  });
  $('.toggleShow').live({
    click: function() {
      var extraEpisodes, extra_episodes, hiddenShow, hidden_shows, imgSrc, labelRemainText, nb_episodes, nb_hiddens, nbr_episodes_per_serie, remain, show, showName, toggleEpisodes;
      show = $(this).parent().parent().parent();
      showName = $(show).attr('id');
      nbr_episodes_per_serie = JSON.parse(DB.get('options.nbr_episodes_per_serie'));
      hidden_shows = JSON.parse(DB.get('hidden_shows'));
      hiddenShow = __indexOf.call(hidden_shows, showName) >= 0;
      extra_episodes = JSON.parse(DB.get('extra_episodes'));
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
      DB.set('hidden_shows', JSON.stringify(hidden_shows));
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
    return Fx.openTab('https://betaseries.com', true);
  }).attr('title', __("logo"));
  $('#versionLink').click(function() {
    return Fx.openTab('https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true);
  }).attr('title', __("version"));
  $('#back').click(function() {
    var args, historic, length;
    historic = JSON.parse(DB.get('historic'));
    if ((length = historic.length) >= 2) {
      historic.pop();
      args = historic[length - 2].substring(5).split('.');
      BS.load.apply(BS, args).refresh();
      DB.set('historic', JSON.stringify(historic));
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
      return BS.load('connection').refresh();
    }, function() {
      DB.removeAll();
      DB.init();
      bgPage.badge.init();
      return BS.load('connection').refresh();
    });
    return false;
  }).attr('title', __("logout"));
  $('#close').click(function() {
    window.close();
    return false;
  }).attr('title', __('close'));
  $('#blog').live('click', function() {
    BS.load('blog').refresh();
    return false;
  }).attr('title', __("blog"));
  $('#planning').live('click', function() {
    BS.load('planningMember').refresh();
    return false;
  }).attr('title', __("planningMember"));
  $('#episodes').live('click', function() {
    BS.load('membersEpisodes').refresh();
    return false;
  }).attr('title', __("membersEpisodes"));
  $('#timeline').live('click', function() {
    BS.load('timelineFriends').refresh();
    return false;
  }).attr('title', __("timelineFriends"));
  $('#notifications').live('click', function() {
    BS.load('membersNotifications').refresh();
    return false;
  }).attr('title', __("membersNotifications"));
  $('#infos').live('click', function() {
    BS.load('membersInfos').refresh();
    return false;
  }).attr('title', __("membersInfos"));
  $('#search').live('click', function() {
    BS.load('searchForm').display();
    return false;
  }).attr('title', __("searchForm"));
  message = function(content) {
    return $('#message').html(content);
  };
  DB.init();
  if (bgPage.connected()) {
    Fx.cleanCache();
    badgeType = DB.get('badge.type', 'membersEpisodes');
    return BS.load(badgeType).refresh();
  } else {
    return BS.load('connection').display();
  }
});
