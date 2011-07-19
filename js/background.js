/**
 * Background.js
 * Init & auto-update processes
 * 
 * @author Menencia
 * 
 * 
 */

var url_api 	= "http://api.betaseries.com";	// Url API
var site_url 	= "http://betaseries.com";		// Url site
var key 		= "6db16a6ffab9";				// Developer key

var badge = {
	/**
	 * Initialise le badge
	 * 
	 */
	init: function(){
		chrome.browserAction.setBadgeText({text: "?"});
		chrome.browserAction.setBadgeBackgroundColor({color: [200, 200, 200, 255]});
	},

	/**
	 * Mets à jour le badge (notifications, puis épisodes)
	 * TODO ajouter le async
	 * 
	 */
	update: function(){
		// Nombre de notifications
		ajax.post('/members/notifications', '&summary=yes', function(data){
			var notifs = data.root.notifications;
			var j = notifs.total;
			DB.set('badge.value', j);
			DB.set('badge.type', 'membersNotifications');
			badge.display(j, 'membersNotifications');
		}, function(){
			var value = DB.get('badge.value');
			var type = DB.get('badge.type');
			badge.display(value, type);
		});
		
		// Nombre d'épisodes non vus
		if (DB.get('badge.value')==0){
			ajax.post('/members/episodes/all', '&summary=yes', function(data){
				var episodes = data.root.episodes;
				var j = 0;
				for (var i in episodes){
					if (episodes.hasOwnProperty(i)) {
						var badgeNotificationType = DB.get('options.badge_notification_type');
						if (badgeNotificationType == 'watched') j++;
						if (badgeNotificationType == 'downloaded' && episodes[i].downloaded != 1) j++;
					}
				}
				localStorage.badgeValue = j;
				localStorage.badgeType = 'membersEpisodes';
				badge.display(j, 'membersEpisodes');
			}, function(){
				var value = DB.get('badge.value');
				var type = DB.get('badge.type');
				badge.display(value, type);
			});
		}
	},

	display: function(value, type){
		if(value==0){
			chrome.browserAction.setBadgeText({text: ""});
		}else{
			colors = {
				notifications: [200, 50, 50, 255],
				episodes: [50, 50, 200, 255]
			};
			chrome.browserAction.setBadgeBackgroundColor({color: colors[type]});		
			chrome.browserAction.setBadgeText({text: ""+value});
		}
	},

	/**
	 * Lance la mise à jour automatique du badge
	 * Mise à jour toutes les heures
	 *
	 */
	autoUpdate: function() {
		if (connected()){
			this.update();
			setTimeout(this.update, 1000*60*60); 
		}
	}

};

/**
 * Retourne vrai si l'utilisateur est connecté, faux sinon
 *
 * @return boolean
 */
var connected = function(){
	return (DB.get('member.token', null) != null);
};
				

/**
 * INIT
 *
 */
DB.init();
badge.init();
badge.autoUpdate();
