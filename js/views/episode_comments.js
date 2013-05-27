/**
 * View comments
 * @class View_EpisodeComments
 * @constructor
 */
var View_EpisodeComments = function() {};

/**
 * Initialize the view
 * @method init
 * @param  {string} url     Toke of a show
 * @param  {int} season  Season number
 * @param  {int} episode Episode number
 * @param  {int} global  Global number
 */
View_EpisodeComments.prototype.init = function(url, season, episode, global) {
	this.id = 'EpisodeComments.' + url + '.' + season + '.' + episode + '.' + global;
	this.url = '/comments/episode/' + url;
	this.params = '&season=' + season + '&episode=' + episode;
	this.show = url;
	this.season = season;
	this.episode = episode;
	this.global = global;
	this.name = 'EpisodeComments';
	this.root = 'comments';
};

/**
 * Update logic for the view
 * @method update
 * @param  {object} data New datas
 */
View_EpisodeComments.prototype.update = function(data) {
	var comments = DB.get('show.' + this.show + '.' + this.global + '.comments', {});
	var nbrComments = comments.length;

	for (var i in data) {
		var comment = data[i];
		if (i < nbrComments) {
			continue;
		} else {
			comments[i] = comment;
		}
	}

	DB.set('show.' + this.show + '.' + this.global + '.comments', comments);
};

/**
 * Build HTML content
 * @method content
 * @return {string} HTML output
 */
View_EpisodeComments.prototype.content = function() {
	var i = 1;
	var time = '';
	var show = '';
	var output = '<div class="showtitle">' + show + '</div>';
	var data = DB.get('show.' + this.show + '.' + this.global + '.comments', null);

	if (!data) {
		return Fx.needUpdate();
	}

	for (var n in data) {
		var new_date = date('D d F', data[n].date);
		if (new_date !== time) {
			time = new_date;
			output += '<div class="showtitle">' + time + '</div>';
		}
		output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">';
		output += '<b>' + date('H:i', data[n].date) + '</b> ';
		output += '<span class="login">' + data[n].login + '</span> ';
		output += '<small>#' + data[n].inner_id + '</small> ';
		if (data[n].in_reply_to !== '0') {
			output += '<small>en réponse à #' + data[n].in_reply_to + '</small> ';
		}
		output += '<a href="" class="addInReplyTo" commentId="' + data[n].inner_id + '">répondre</a><br />';
		output += data[n].text;
		output += '</div>';
		i++;
	}

	output += '<div class="postComment">';
	output += '<form method="post" id="postComment">';
	output += '<input type="hidden" id="show" value="' + this.show + '" />';
	output += '<input type="hidden" id="season" value="' + this.season + '" />';
	output += '<input type="hidden" id="episode" value="' + this.episode + '" />';
	output += '<input type="hidden" id="inReplyTo" value="0" />';
	output += '<textarea name="comment" placeholder="Votre commentaire.."></textarea>';
	output += '<input type="submit" name="submit" value="Poster">';
	output += '<div id="inReplyToText" style="display:none;">En réponse à #<span id="inReplyToId"></span> ';
	output += '(<a href="" id="removeInReplyTo">enlever</a>)</div>';
	output += '</form>';
	output += '<div class="clear"></div></div>';

	if (i === 1) {
		output += __('no_comments');
	}

	return output;
};

/**
 * Add listeners fot the view
 * @method listen
 */
View_EpisodeComments.prototype.listen = function() {
	$('.EpisodeComments').on('submit', '#postComment', function() {
		var show = $('#postComment input[id=show]').val();
		var season = $('#postComment input[id=season]').val();
		var episode = $('#postComment input[id=episode]').val();
		var text = $('#postComment textarea').val();
		var in_reply_to = $('#postComment input[id=inReplyTo]').val();

		if (text !== '') {
			$('#postComment input[type=submit]').val('Patientez..');
			$('#postComment input[type=submit]').prop('disabled', true);

			var params = '&show=' + show + '&season=' + season + '&episode=' + episode + '&text=' + text;

			if (in_reply_to !== '0') {
				params += '&in_reply_to=' + in_reply_to;
			}

			ajax.post("/comments/post/episode", params, function(data) {
				var day, hour, login, num, output, showtitle, time;

				$('#postComment textarea').val('');
				$('#postComment input[id=inReplyTo]').val(0);
				$('#postComment input[type=submit]').val('Poster');
				$('#postComment input[type=submit]').prop('disabled', false);
				$('#postComment #inReplyToText').hide();

				time = date('D d F');
				day = date('D').toLowerCase();
				hour = date('H:i');
				login = DB.get('session').login;
				num = data.comment.id;
				showtitle = time === $('.showtitle').last().text() ? '' : '<div class="showtitle">' + time + '</div>';

				output = '<div class="newComment" style="display:none;">';
				output += showtitle;
				output += '<div class="event ' + day + '">';
				output += '<b>' + hour + '</b> ';
				output += '<span class="login">' + login + '</span> ';
				output += '<small>#' + num + '</small> ';

				if (in_reply_to !== '0') {
					output += '<small>en réponse à #' + in_reply_to + '</small> ';
				}

				output += '<a href="" class="addInReplyTo" commentId="' + num + '">répondre</a><br />';
				output += text;
				output += '</div>';
				output += '</div>';

				$('.postComment').before(output);
				$('.newComment').slideDown('slow');
			}, function() {});
		}
		return false;
	});

	$('.EpisodeComments').on('click', '.addInReplyTo', function() {
		var commentId = $(this).attr('commentId');
		$('#postComment input[id=inReplyTo]').val(commentId);
		$('#postComment #inReplyToText').show();
		$('#postComment #inReplyToId').text(commentId);
		return false;
	});

	$('.EpisodeComments').on('click', '#removeInReplyTo', function() {
		$('#postComment input[id=inReplyTo]').val(0);
		$('#postComment #inReplyToText').hide();
		return false;
	});
};