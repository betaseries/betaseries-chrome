/**
 * Background.js
 * Init & auto-update processes
 * 
 * @author Menencia
 * 
 * 
 */

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
			if (j>0){
				badge.display(j, 'membersNotifications');
			}else{
				// Nombre d'épisodes non vus
				ajax.post('/members/episodes/all', '', function(data){
					var episodes = data.root.episodes;
					var j = 0;
					for (var i in episodes){
						if (episodes.hasOwnProperty(i)) {
							var badgeNotificationType = DB.get('options.badge_notification_type');
							if (badgeNotificationType == 'watched') j++;
							if (badgeNotificationType == 'downloaded' && episodes[i].downloaded != 1) j++;
						}
					}
					DB.set('badge.value', j);
					DB.set('badge.type', 'membersEpisodes');
					badge.display(j, 'membersEpisodes');
				}, function(){
					var value = DB.get('badge.value');
					var type = DB.get('badge.type');
					badge.display(value, type);
				});
			}
		}, function(){
			var value = DB.get('badge.value');
			var type = DB.get('badge.type');
			badge.display(value, type);
		});
	},

	display: function(value, type){
		if(value==0){
			chrome.browserAction.setBadgeText({text: ""});
		}else{
			colors = {
				membersNotifications: [200, 50, 50, 255],
				membersEpisodes: [50, 50, 200, 255]
			};
			console.log(value);
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
