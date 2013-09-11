/**
 * View planning
 * @class View_MemberPlanning
 * @constructor
 */
var View_MemberPlanning = function() {};

/**
 * Initialize the view
 * @method init
 * @param  {string} login Login of a user
 */
View_MemberPlanning.prototype.init = function(login) {
	if (typeof login === 'undefined') {
		login = DB.get('session') ? DB.get('session').login : '';
	}
	this.id = 'MemberPlanning.' + login;
	this.url = '/planning/member/' + login;
	this.login = login;
	this.name = 'MemberPlanning';
	this.params = "&view=unseen";
	this.root = 'planning';
};

/**
 * Update logic for the view
 * @method update
 * @param  {object} data New datas
 */
View_MemberPlanning.prototype.update = function(data) {
	DB.set('member.' + this.login + '.planning', data);
};

/**
 * Build HTML content
 * @method content
 * @return {string} HTML output
 */
View_MemberPlanning.prototype.content = function() {
	var hidden, w;
	var output = '';
	var week = 100;
	var nbrEpisodes = 0;
	var data = DB.get('member.' + this.login + '.planning', null);
	if (!data) {
		return Fx.needUpdate();
	}
	for (var e in data) {
		var today = Math.floor(new Date().getTime() / 1000);
		var todayWeek = parseFloat(date('W', today));
		var actualWeek = parseFloat(date('W', data[e].date));
		var diffWeek = actualWeek - todayWeek;
		var plot = data[e].date < today ? "tick" : "empty";

		if (diffWeek < -2 || diffWeek > 2) {
			continue;
		}

		if (actualWeek !== week) {
			week = actualWeek;

			if (diffWeek < -1) {
				w = __('weeks_ago', [Math.abs(diffWeek)]);
				hidden = true;
			} else if (diffWeek === -1) {
				w = __('last_week');
				hidden = true;
			} else if (diffWeek === 0) {
				w = __('this_week');
				hidden = false;
			} else if (diffWeek === 1) {
				w = __('next_week');
			} else if (diffWeek > 1) {
				w = __('next_weeks', [diffWeek]);
				hidden = false;
			}
			if (nbrEpisodes > 0) {
				output += '</div>';
			}

			var visibleIcon = hidden ? '../img/arrow_right.gif' : '../img/arrow_down.gif';
			var titleIcon = hidden ? __('maximise') : __('minimise');

			hidden = hidden ? ' hidden' : '';

			output += '<div class="week' + hidden + '">';
			output += '<div class="title"> ';
			output += '<img src="' + visibleIcon + '" class="toggleWeek" title="' + titleIcon + '" />';
			output += w + '</div>';
		}

		output += '<div class="episode ' + date('D', data[e].date).toLowerCase() + hidden + '">';
		output += '<div class="td wrapper-seen">';
		output += '<img src="../img/' + plot + '.png" width="11" />';
		output += '</div>';
		output += '<div class="td wrapper-title" style="width: 186px;">';
		output += '<span class="num">' + Fx.displayNumber(data[e].number) + '</span> ';
		output += '<a href="" url="' + data[e].url + '" season="' + data[e].season + '" episode="' + data[e].episode + '" global="' + data[e].global + '" title="' + data[e].show + '" class="epLink display_episode">';
		output += data[e].show + '</a>';
		output += '</div>';
		output += '<div class="td wrapper-date-2">';
		output += '<span class="date">' + date('D d F', data[e].date) + '</span>';
		output += '</div>';
		output += '</div>';

		nbrEpisodes++;
	}
	return output;
};

/**
 * Add listeners to the view
 * @method listen
 */
View_MemberPlanning.prototype.listen = function() {
	return $('.MemberPlanning').on('click', '.toggleWeek', function() {
		var week = $(this).closest('.week');
		var hidden = $(week).hasClass('hidden');

		$(week).toggleClass('hidden');
		$(week).find('.episode').slideToggle();

		if (hidden) {
			$(this).attr('src', '../img/arrow_down.gif');
		} else {
			$(this).attr('src', '../img/arrow_right.gif');
		}

		Fx.updateHeight();
	});
};