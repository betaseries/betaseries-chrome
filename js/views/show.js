/**
 * View Show - class
 * @class View_Show
 * @constructor
 */
View_Show = function() {};

/**
 * Initialize the view
 * @method init
 * @param  {string} url Token of the show
 */
View_Show.prototype.init = function(url) {
	this.id = 'Show.' + url;
	this.url = '/shows/display/' + url;
	this.show = url;
	this.name = 'Show';
	this.root = 'show';
	this.login = DB.get('session') ? DB.get('session').login : '';
};

/**
 * Update logic for the view
 * @method update
 * @param  {object} data New datas
 */
View_Show.prototype.update = function(data) {
	data.is_in_account = (data.is_in_account === '1');
	data.archive = data.archive === '1';
	DB.set('show.' + this.show, data);
};

/**
 * Build HTML content
 * @method content
 * @return {string} HTML output
 */
View_Show.prototype.content = function() {
	var data = DB.get('show.' + this.show, null);
	if (!data) {
		return Fx.needUpdate();
	}
	var output = '<div class="title">';
	output += '<div class="fleft200">' + data.title + '</div>';
	output += '<div class="fright200 aright">';
	if (data.note) {
		var note = Math.floor(data.note.mean);
		for (var i = 1; i <= note; i++) {
			output += '<img src="../img/star.gif" /> ';
		}
	}
	output += '</div>';
	output += '<div class="clear"></div>';
	output += '</div>';
	output += '<div>';
	output += '<div class="fleft200">';
	var genres = [];
	for (var k in data.genres) {
		var v = data.genres[k];
		genres.push(v);
	}
	output += genres.join(', ') + ' | ';
	if (data.status) {
		output += __(data.status.toLowerCase());
	}
	output += '</div>';
	output += '<div class="fright200 aright">';
	if (data.note && data.note.mean) {
		output += data.note.mean + '/5 (' + data.note.members + ')';
	}
	output += '</div>';
	output += '</div>';
	if (data.banner) {
		output += '<img src="' + data.banner + '" width="355" height="70" alt="banner" style="margin-top: 10px;" />';
	}
	if (data.description) {
		output += '<div class="title2">' + __('synopsis') + '</div>';
		output += '<div style="margin-right:5px; text-align:justify;">' + data.description + '</div>';
	}
	output += '<div class="title2">' + __('actions') + '</div>';
	output += '<a href="" class="link display_episodes" url="' + data.url + '"><span class="imgSyncNo"></span>Voir les épisodes</a>';
	if (data.is_in_account && data.archive) {
		output += '<a href="#' + data.url + '" id="showsUnarchive" class="link">' + '<span class="imgSyncOff"></span>' + __('show_unarchive') + '</a>';
	} else if (data.is_in_account && !data.archive) {
		output += '<a href="#' + data.url + '" id="showsArchive" class="link">' + '<span class="imgSyncOff"></span>' + __('show_archive') + '</a>';
	}
	if (data.is_in_account) {
		output += '<a href="#' + data.url + '" id="showsRemove" class="link">' + '<span class="imgSyncOff"></span>' + __('show_remove') + '</a>';
	} else {
		output += '<a href="#' + data.url + '" id="showsAdd" class="link">' + '<span class="imgSyncOff"></span>' + __('show_add') + '</a>';
	}
	return output;
};

/**
 * Add listeners for the view
 * @method listen
 */
View_Show.prototype.listen = function() {
	$('.Show').on('click', '.display_episodes', function() {
		event.preventDefault();
		var url = $(this).attr('url');
		app.view.load('ShowEpisodes', url);
	});

	$('.Show').on('click', '#showsArchive', function() {
		var _this = this;
		var show = $(this).attr('href').substring(1);

		$(this).find('span').toggleClass('imgSyncOff imgSyncOn');

		ajax.post("/shows/archive/" + show, "", function() {
			Cache.force('MyEpisodes.all');
			Cache.force('Member.' + DB.get('session').login);
			Badge.search_episodes();
			$(_this).html('<span class="imgSyncOff"></span>' + __('show_unarchive'));
			$(_this).attr('id', 'showsUnarchive');
		}, function() {
			registerAction("/shows/archive/" + show, "");
		});

		return false;
	});

	$('.Show').on('click', '#showsUnarchive', function() {
		var _this = this;
		var show = $(this).attr('href').substring(1);

		$(this).find('span').toggleClass('imgSyncOff imgSyncOn');

		ajax.post("/shows/unarchive/" + show, "", function() {
			Cache.force('MyEpisodes.all');
			Cache.force('Member.' + DB.get('session').login);
			Badge.search_episodes();
			$(_this).html('<span class="imgSyncOff"></span>' + __('show_archive'));
			$(_this).attr('id', 'showsArchive');
		}, function() {
			registerAction("/shows/unarchive/" + show, "");
		});

		return false;
	});

	$('.Show').on('click', '#showsAdd', function() {
		var _this = this;
		var show = $(this).attr('href').substring(1);

		$(this).find('span').toggleClass('imgSyncOff imgSyncOn');

		ajax.post('/shows/add/' + show, '', function() {
			Cache.force('MyEpisodes.all');
			Cache.force('Member.' + DB.get('session').login);
			Badge.search_episodes();
			$(_this).html('<span class="imgSyncOff"></span>' + __('show_remove'));
			$(_this).attr('id', 'showsRemove');
		}, function() {
			registerAction("/shows/add/" + show, '');
		});

		return false;
	});

	$('.Show').on('click', '#showsRemove', function() {
		var _this = this;
		var show = $(this).attr('href').substring(1);

		$(this).find('span').toggleClass('imgSyncOff imgSyncOn');

		$('#showsArchive').slideUp();
		$('#showsUnarchive').slideUp();

		ajax.post('/shows/remove/' + show, '', function() {
			Cache.force('MyEpisodes.all');
			Cache.force('Member.' + DB.get('session').login);
			Badge.search_episodes();
			$(_this).html('<span class="imgSyncOff"></span>' + __('show_add'));
			$(_this).attr('id', 'showsAdd');
		}, function() {
			registerAction("/shows/remove/" + show, '');
		});

		return false;
	});
};