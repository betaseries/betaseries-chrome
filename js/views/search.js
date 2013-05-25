/**
 * View Search - class
 * @class View_Search
 * @constructor
 */
var View_Search = function() {};

/**
 * Initialize the view
 * @method init
 */
View_Search.prototype.init = function() {
	this.id = 'Search';
	this.name = 'Search';
};

/**
 * Build HTML content
 * @method content
 * @return {string} HTML output
 */
View_Search.prototype.content = function() {
	var output = '<form id="search">';
	output += '<input type="text" name="terms" id="terms" /> ';
	output += '<input type="submit" value="chercher" />';
	output += '</form>';
	output += '<div id="suggests_shows"></div>';
	output += '<div id="suggests_members"></div>';
	output += '<div id="results_shows"></div>';
	output += '<div id="results_members"></div>';

	setTimeout((function() {
		return $('#terms').focus();
	}), 100);

	return output;
};

/**
 * Add listeners for the view
 * @method listen
 */
View_Search.prototype.listen = function() {
	$('.Search').on('submit', '#search', function() {
		var terms = $('#terms').val();
		var params = "&title=" + terms;

		ajax.post("/shows/search", params, function(data) {
			var content = '<div class="title">' + __('shows') + '</div>';
			var shows = data.root.shows;

			if (Object.keys(shows).length > 0) {
				for (var n in shows) {
					var show = shows[n];
					content += '<div class="episode"><a href="" url="' + show.url + '" title="' + show.title + '" class="epLink display_show">' + Fx.subFirst(show.title, 25) + '</a></div>';
				}
			} else {
				content += '<div class="episode">' + __('no_shows_found') + '</div>';
			}

			$('#results_shows').html(content);
			Fx.updateHeight();
		}, function() {});

		params = "&login=" + terms;

		ajax.post("/members/search", params, function(data) {
			var content = '<div class="title">' + __('members') + '</div>';
			var members = data.root.members;

			if (Object.keys(members).length > 0) {
				for (var n in members) {
					var member = members[n];
					content += '<div class="episode"><a href="#" login="' + member.login + '" class="epLink display_member">' + Fx.subFirst(member.login, 25) + '</a></div>';
				}
			} else {
				content += '<div class="episode">' + __('no_members_found') + '</div>';
			}

			$('#results_members').html(content);
			Fx.updateHeight();
		}, function() {});

		return false;
	});

	$('.Search').on('click', '.display_show', function() {
		event.preventDefault();
		var url = $(this).attr('url');
		app.view.load('Show', url);
	});

	$('.Search').on('click', '.display_member', function() {
		event.preventDefault();
		var login = $(this).attr('login');
		app.view.load('Member', login);
	});
};