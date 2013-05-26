/**
 * View member
 * @class View_Member
 * @constructor
 */
var View_Member = function() {};

/**
 * Initialize the view
 * @method init
 * @param  {string} login [description]
 * @return {[type]}       [description]
 */
View_Member.prototype.init = function(login) {
	if (typeof login === 'undefined') {
		login = DB.get('session') ? DB.get('session').login : '';
	}
	this.id = 'Member.' + login;
	this.url = '/members/infos/' + login;
	this.login = login;
	this.name = 'Member';
	this.root = 'member';
};

/**
 * Update logic for the view
 * @method update
 * @param  {object} data New datas
 */
View_Member.prototype.update = function(data) {
	var member = DB.get('member.' + this.login + '.infos', {});
	member.login = data.login;
	member.is_in_account = data.is_in_account;
	member.avatar = data.avatar;
	member.stats = data.stats;
	DB.set('member.' + this.login + '.infos', member);
};

/**
 * Build HTML content
 * @method content
 * @return {string} HTML output
 */
View_Member.prototype.content = function() {
	var data = DB.get('member.' + this.login + '.infos', null);
	if (!data) {
		return Fx.needUpdate();
	}

	if (data.avatar && data.avatar) {
		var avatar = new Image();
		avatar.src = data.avatar;
		avatar.onload = function() {
			return $('#avatar').attr('src', data.avatar);
		};
	}

	var output = '';
	output += '<div class="title">' + data.login + '</div>';
	output += '<img src="../img/avatar.png" width="50" id="avatar" style="position:absolute; right:0;" />';
	output += '<div class="episode lun"><img src="../img/infos.png" class="icon"> ' + __('nbr_friends', [data.stats.friends]) + ' </div>';
	output += '<div class="episode lun"><img src="../img/medal.png" class="icon"> ' + __('nbr_badges', [data.stats.badges]) + ' </div>';
	output += '<div class="episode lun"><img src="../img/episodes.png" class="icon"> ' + __('nbr_shows', [data.stats.shows]) + ' </div>';
	output += '<div class="episode lun"><img src="../img/report.png" class="icon"> ' + __('nbr_seasons', [data.stats.seasons]) + ' </div>';
	output += '<div class="episode lun"><img src="../img/script.png" class="icon"> ' + __('nbr_episodes', [data.stats.episodes]) + ' </div>';
	output += '<div class="episode lun"><img src="../img/location.png" class="icon">' + data.stats.progress + ' <small>(' + __('progress') + ')</small></div>';

	if (typeof data.is_in_account != 'undefined') {
		output += '<div class="title2">' + __('actions') + '</div>';
		if (data.is_in_account) {
			output += '<a href="#' + data.login + '" id="friendsRemove" class="link">' + '<span class="imgSyncOff"></span>' + __('remove_to_friends', [data.login]) + '</a>';
		} else {
			output += '<a href="#' + data.login + '" id="friendsAdd" class="link">' + '<span class="imgSyncOff"></span>' + __('add_to_friends', [data.login]) + '</a>';
		}
	}

	return output;
};

/**
 * Add listeners for the view
 * @method listen
 */
View_Member.prototype.listen = function() {
	$('.Member').on('click', '#friendsAdd', function() {
		var _this = this;
		var login = $(this).attr('href').substring(1);

		$(this).find('span').toggleClass('imgSyncOff imgSyncOn');

		ajax.post("/members/add/" + login, '', function() {
			Cache.force('MyEpisodes.' + DB.get('session').login);
			Cache.force('Member.' + login);
			Cache.force('MemberTimeline');
			$(_this).html('<span class="imgSyncOff"></span>' + __('remove_to_friends', [login]));
			$(_this).attr('id', 'friendsRemove');
		}, function() {
			registerAction("/members/add/" + login, '');
		});

		return false;
	});

	$('.Member').on('click', '#friendsRemove', function() {
		var _this = this;
		var login = $(this).attr('href').substring(1);

		$(this).find('span').toggleClass('imgSyncOff imgSyncOn');

		ajax.post("/members/delete/" + login, '', function() {
			Cache.force('Member.' + DB.get('session').login);
			Cache.force('Member.' + login);
			Cache.force('MemberTimeline');
			$(_this).html('<span class="imgSyncOff"></span>' + __('add_to_friends', [login]));
			$(_this).attr('id', 'friendsAdd');
		});

		return false;
	});
};