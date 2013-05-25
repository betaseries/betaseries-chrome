/**
 * View of an episode - class
 * @class View_Episode
 * @constructor
 */
var View_Episode = function() {};

/**
 * Initialize the view
 * @method init
 * @param  {string} url     Token of the show
 * @param  {int} season  Season of the episode
 * @param  {int} episode Nuber of the episode
 * @param  {int} global  Global number of the episode
 */
View_Episode.prototype.init = function(url, season, episode, global) {
	this.id = 'Episode.' + url + '.' + season + '.' + episode + '.' + global;
	this.url = '/shows/episodes/' + url;
	this.params = '&season=' + season + '&episode=' + episode;
	this.episodes = DB.get('show.' + url + '.episodes');
	this.show = url;
	this.global = global;
	this.name = 'Episode';
	this.root = 'seasons';
};

/**
 * Update logic for the view
 * @method update
 * @param  {object} data New datas for the view
 */
View_Episode.prototype.update = function(data) {
	var e = data['0']['episodes']['0'];
	var eps = this.episodes ? this.episodes : {};
	var ep = this.global in eps ? eps[this.global] : {};

	if (e.comments) {
		ep.comments = e.comments;
	}
	if (e.date) {
		ep.date = e.date;
	}
	if (e.description) {
		ep.description = e.description;
	}
	if (e.episode) {
		ep.episode = e.episode;
	}
	if (e.global) {
		ep.global = e.global;
	}
	if (e.number) {
		ep.number = e.number;
	}
	if (e.screen) {
		ep.screen = e.screen;
	}
	if (e.show) {
		ep.show = e.show;
	}
	if (e.subs) {
		ep.subs = e.subs;
	}
	if (e.title) {
		ep.title = e.title;
	}
	ep.url = this.show;

	// save episode
	eps[this.global] = ep;
	DB.set('show.' + this.show + '.episodes', eps);
	this.episodes = eps;
};

/**
 * Build HTML content
 * @method
 * @return {string} HTML content of the view
 */
View_Episode.prototype.content = function() {
	if (!this.episodes || !this.episodes[this.global]) {
		return Fx.needUpdate();
	}
	var e = this.episodes[this.global];
	var title = DB.get('options').display_global ? '#' + e.global + ' ' + e.title : e.title;
	var output = '<div class="title">';
	output += '<div class="fleft200"><a href="" url="' + this.show + '" class="showtitle display_show">' + e.show + '</a></div>';
	output += '<div class="fright200 aright">';
	if (e.note) {
		var note = Math.floor(e.note.mean);
		for (var i = 1; i <= note; i++) {
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
	if (e.note && e.note.mean) {
		output += ' <div class="fright200 aright">' + e.note.mean + '/5 (' + e.note.members + ')' + '</div>';
	}
	output += ' <div class="clear"></div>';
	output += '</div>';
	if (e.screen) {
		output += '<div style="height: 70px; overflow: hidden; margin-top: 10px;"><img src="' + e.screen + '" style="width: 355px; margin-top: -15px;" /></div>';
	}
	if (e.description) {
		output += '<div class="title2">' + __('synopsis') + '</div>';
		output += '<div style="text-align: justify; margin-right: 5px;">' + e.description + '</div>';
	}
	if (e.subs && Object.keys(e.subs).length > 0) {
		output += '<div class="title2">' + __('subtitles') + '</div>';
		var nbr_subs = 0;
		for (var n in e.subs) {
			var sub = e.subs[n];
			output += '[' + sub.quality + '] ' + sub.language + ' <a href="" class="subs" title="' + sub.file + '" link="' + sub.url + '">' + Fx.subLast(sub.file, 20) + '</a> (' + sub.source + ')<br />';
			nbr_subs++;
		}
	}
	output += '<div class="title2">' + __('actions') + '</div>';
	output += '<a href="" url="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" class="link display_comments">';
	output += '<span class="imgSyncNo"></span>' + __('see_comments', e.comments) + '</a>';
	if (typeof e.downloaded !== 'undefined') {
		var dl = e.downloaded ? 'mark_as_not_dl' : 'mark_as_dl';
		output += '<a href="" show="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" class="link downloaded">';
		output += '<span class="imgSyncOff"></span>' + __(dl) + '</a>';
	}
	return output;
};

/**
 * Listeners for the view
 * @method listen
 */
View_Episode.prototype.listen = function() {
	$('.Episode').on('click', '.subs', function() {
		Fx.openTab($(this).attr('link'));
		return false;
	});

	$('.Episode').on('click', '.display_comments', function() {
		var episode, global, season, url;

		url = $(this).attr('url');
		season = $(this).attr('season');
		episode = $(this).attr('episode');
		global = $(this).attr('global');
		app.view.load('EpisodeComments', url, season, episode, global);
		return false;
	});

	$('.Episode').on('click', '.downloaded', function() {
		var _this = this;
		var show = $(this).attr('show');
		var season = $(this).attr('season');
		var episode = $(this).attr('episode');
		var global = $(this).attr('global');
		var es = DB.get('show.' + show + '.episodes');
		var downloaded = es[global].downloaded;

		// save downloaded status
		es[global].downloaded = !downloaded;
		DB.set('show.' + show + '.episodes', es);

		// animate inline sync icon
		$(this).find('span').toggleClass('imgSyncOff imgSyncOn');

		var dl = downloaded ? 'mark_as_dl' : 'mark_as_not_dl';
		var params = "&season=" + season + "&episode=" + episode;

		ajax.post("/members/downloaded/" + show, params, function() {
			var badge_notification_type;

			Cache.force('MyEpisodes.all');
			badge_notification_type = DB.get('options').badge_notification_type;
			if (badge_notification_type === 'downloaded') {
				Badge.search_episodes();
			}
			$(_this).html('<span class="imgSyncOff"></span>' + __(dl));
		}, function() {
			registerAction("/members/downloaded/" + show, params);
		});
		return false;
	});
};