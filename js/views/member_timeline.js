/**
 * View Member timeline  - class
 * @class View_MemberTimeline
 * @constructor
 */
var View_MemberTimeline = function() {};

/**
 * Initialize the view
 * @method
 * @return {[type]} [description]
 */
View_MemberTimeline.prototype.init = function() {
	this.id = 'MemberTimeline';
	this.name = 'MemberTimeline';
	this.url = '/timeline/friends';
	this.params = '&number=10';
	this.root = 'timeline';
	this.login = DB.get('session') ? DB.get('session').login : '';
};

/**
 * Update logic for the view
 * @method update
 * @param  {object} data New datas
 */
View_MemberTimeline.prototype.update = function(data) {
	DB.set('member.' + this.login + '.timeline', data);
};

/**
 * Build HTML content
 * @method content
 * @return {string} HTML output
 */
View_MemberTimeline.prototype.content = function() {
	var output = '';
	var time = '';
	var data = DB.get('member.' + this.login + '.timeline', null);

	if (!data) {
		return Fx.needUpdate();
	}

	for (var n in data) {
		var new_date = date('D d F', data[n].date);
		if (new_date !== time) {
			time = new_date;
			output += '<div class="title">' + time + '</div>';
		}
		output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">';
		output += '<b>' + date('H:i', data[n].date) + '</b> ';
		output += '<span class="login">' + data[n].login + '</span> ' + data[n].html;
		output += '</div>';
	}

	return output;
};