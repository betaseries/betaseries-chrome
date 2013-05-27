/**
 * View notifications
 * @class View_MemberNotifications
 * @constructor
 */
var View_MemberNotifications = function() {};

/**
 * Initialize the view
 * @method init
 */
View_MemberNotifications.prototype.init = function() {
	this.id = 'MemberNotifications';
	this.name = 'MemberNotifications';
	this.url = '/members/notifications';
	this.root = 'notifications';
	this.login = DB.get('session') ? DB.get('session').login : '';
};

/**
 * Update logic for the view
 * @method update
 * @param  {object} data New datas
 */
View_MemberNotifications.prototype.update = function(data) {
	var old_notifs = DB.get('member.' + this.login + '.notifs', []);
	var new_notifs = Fx.formatNotifications(data);
	var n = Fx.concatNotifications(old_notifs, new_notifs);
	n = Fx.sortNotifications(n);
	DB.set('member.' + this.login + '.notifs', n);
};

/**
 * Build HTML content
 * @method content
 * @return {string} HTML output
 */
View_MemberNotifications.prototype.content = function() {
	var output = '';
	var nbrNotifications = 0;
	var currDate = '';
	var data = DB.get('member.' + this.login + '.notifs', null);

	if (!data) {
		return Fx.needUpdate();
	}

	var time = Math.floor(new Date().getTime() / 1000);
	for (var i = 0; i < data.length; i++) {
		var n = data[i];
		if (time < n.date) {
			continue;
		}
		var newDate = date('D d F', n.date);
		if (newDate !== currDate) {
			currDate = newDate;
			output += '<div class="showtitle">' + currDate + '</div>';
		}
		output += '<div class="event ' + date('D', n.date).toLowerCase() + '">';
		if (!n.seen) {
			output += '<span class="new">' + __('new') + '</span> ';
		}
		output += n.html;
		output += '</div>';
		n.seen = true;
		nbrNotifications++;
	}
	DB.set('member.' + this.login + '.notifs', data);
	$('.notif').html(0).hide();
	Badge.set('new_notifications', 0);

	if (nbrNotifications === 0) {
		output += __('no_notifications');
	}

	return output;
};