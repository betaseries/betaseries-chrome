/**
 * View shows
 * @class View_MemberShows
 * @constructor
 */
var View_MemberShows = function() {};

/**
 * Initialize the view
 * @method init
 * @param  {string} login Login of a user
 */
View_MemberShows.prototype.init = function(login) {
	if (login === null) {
		login = DB.get('session') ? DB.get('session').login : '';
	}
	this.id = 'MemberShows.' + login;
	this.url = '/members/infos/' + login;
	this.login = login;
	this.name = 'MemberShows';
	this.root = 'member';
};

/**
 * Update logic for the view
 * @method update
 * @param  {object} data New datas
 */
View_MemberShows.prototype.update = function(data) {
	var shows = DB.get('member.' + this.login + '.shows', {});
	for (var i in data.shows) {
		var s = data.shows[i];
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
	DB.set('member.' + this.login + '.shows', shows);
};

/**
 * Build HTML content
 * @method content
 * @return {string} HTML output
 */
View_MemberShows.prototype.content = function() {
	var data = DB.get('member.' + this.login + '.shows', null);

	if (!data) {
		return Fx.needUpdate();
	}

	var output = '';
	for (var i in data) {
		var show = data[i];
		output += '<div class="episode" id="' + show.url + '">';
		if (show.archive === '1') {
			output += '<img src="../img/folder_off.png" class="icon-3" /> ';
		} else {
			output += '<img src="../img/folder.png" class="icon-3" /> ';
		}
		output += '<a href="" url="' + show.url + '" class="epLink display_show">' + show.title + '</a>';
		output += '</div>';
	}
	return output;
};

/**
 * Add listeners fot the view
 * @method listen
 */
View_MemberShows.prototype.listen = function() {
	$('.MemberShows').on('click', '.display_show', function() {
		event.preventDefault();
		var url = $(this).attr('url');
		app.view.load('Show', url);
	});
};