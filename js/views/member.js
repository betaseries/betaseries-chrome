// Generated by CoffeeScript 1.3.3
var View_Member,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

View_Member = (function() {

  function View_Member() {
    this.init = __bind(this.init, this);

  }

  View_Member.prototype.init = function(login) {
    var _ref;
    if (login == null) {
      login = (_ref = DB.get('session')) != null ? _ref.login : void 0;
    }
    this.id = 'Member.' + login;
    this.url = '/members/infos/' + login;
    this.login = login;
    this.name = 'Member';
    return this.root = 'member';
  };

  View_Member.prototype.update = function(data) {
    var member;
    member = DB.get('member.' + this.login + '.infos', {});
    member.login = data.login;
    member.is_in_account = data.is_in_account;
    member.avatar = data.avatar;
    member.stats = data.stats;
    return DB.set('member.' + this.login + '.infos', member);
  };

  View_Member.prototype.content = function() {
    var avatar, data, output;
    data = DB.get('member.' + this.login + '.infos', null);
    if (!data) {
      return Fx.needUpdate();
    }
    if ((data.avatar != null) && data.avatar !== '') {
      avatar = new Image;
      avatar.src = data.avatar;
      avatar.onload = function() {
        return $('#avatar').attr('src', data.avatar);
      };
    }
    output = '';
    output += '<div class="title">' + data.login + '</div>';
    output += '<img src="../img/avatar.png" width="50" id="avatar" style="position:absolute; right:0;" />';
    output += '<div class="episode lun"><img src="../img/infos.png" class="icon"> ' + __('nbr_friends', [data.stats.friends]) + ' </div>';
    output += '<div class="episode lun"><img src="../img/medal.png" class="icon"> ' + __('nbr_badges', [data.stats.badges]) + ' </div>';
    output += '<div class="episode lun"><img src="../img/episodes.png" class="icon"> ' + __('nbr_shows', [data.stats.shows]) + ' </div>';
    output += '<div class="episode lun"><img src="../img/report.png" class="icon"> ' + __('nbr_seasons', [data.stats.seasons]) + ' </div>';
    output += '<div class="episode lun"><img src="../img/script.png" class="icon"> ' + __('nbr_episodes', [data.stats.episodes]) + ' </div>';
    output += '<div class="episode lun"><img src="../img/location.png" class="icon">' + data.stats.progress + ' <small>(' + __('progress') + ')</small></div>';
    if (data.is_in_account != null) {
      output += '<div class="title2">' + __('actions') + '</div>';
      if (data.is_in_account) {
        output += '<a href="#' + data.login + '" id="friendsRemove" class="link">' + '<span class="imgSyncOff"></span>' + __('remove_to_friends', [data.login]) + '</a>';
      } else {
        output += '<a href="#' + data.login + '" id="friendsAdd" class="link">' + '<span class="imgSyncOff"></span>' + __('add_to_friends', [data.login]) + '</a>';
      }
    }
    return output;
  };

  return View_Member;

})();
