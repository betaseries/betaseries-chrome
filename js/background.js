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

/**
 * Initialise le badge
 * 
 */
var initBadge = function(){
	chrome.browserAction.setBadgeText({text: "?"});
	chrome.browserAction.setBadgeBackgroundColor({color: [200, 200, 200, 255]});
};

/**
 * Mets à jour le badge (notifications, puis épisodes)
 * 
 */
var updateBadge = function(){
	// Nombre de notifications
	updateBadgeNotifications();
	
	// Nombre d'épisodes non vus
	if (localStorage.badgeValue==0){
		updateBadgeEpisodes();
	}
}

/**
 * Mets à jour le badge (notifications)
 * 
 */
var updateBadgeNotifications = function(){
	$.ajax({
		type: "POST",
		url: url_api+"/members/notifications.json",
		data: "key="+key+"&token="+localStorage.token+"&summary=yes",
		dataType: "json",
		async: false,
		success: function(data){
			var notifs = data.root.notifications;
			var j = notifs.total;
			localStorage.badgeValue = j;
			localStorage.badgeType = 'notifications';
			displayBadge(j, localStorage.badgeType);
		},
		error: function (){
			var value = localStorage.badgeValue;
			var type = localStorage.badgeType;
			displayBadge(value, type);
		}
	});
};

/**
 * Mets à jour le badge (épisodes)
 * 
 */
var updateBadgeEpisodes = function(){
	options = JSON.parse(localStorage.options);
	$.ajax({
		type: "POST",
		url: url_api+"/members/episodes/all.json",
		data: "key="+key+"&token="+localStorage.token,
		dataType: "json",
		success: function(data){
			var episodes = data.root.episodes;
			var j = 0;
			for (var i in episodes){
				if (episodes.hasOwnProperty(i)) {
					if (options['badge_notification_type'] == 'watched') j++;
					if (options['badge_notification_type'] == 'downloaded' && episodes[i].downloaded != 1) j++;
				}
			}
			localStorage.badgeValue = j;
			localStorage.badgeType = 'episodes';
			displayBadge(j, localStorage.badgeType);
		},
		error: function (){
			var value = localStorage.badgeValue;
			var type = localStorage.badgeType;
			displayBadge(value, type);
		}
	});
};

var displayBadge = function(value, type){
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
};

/**
 * Lance la mise à jour automatique du badge
 *
 */
var autoUpdateBadge = function() {
	if (connected()){
		updateBadge();
		setTimeout(autoUpdateBadge, 1000*60*60); // Mise à jour toutes les heures.
	}
}

/**
 * Retourne vrai si l'utilisateur est connecté, faux sinon
 *
 * @return boolean
 */
var connected = function() {
    return (localStorage.token !== undefined && localStorage.token !== '');
};

/**
 *
 */
var initLocalStorage = function() { 
	// OPTIONS
	if( ! localStorage.options){
		o = {
			dl_srt_language: 'VF',
			nbr_episodes_per_serie: 5,
			badge_notification_type: 'watched'
		}
		localStorage.options = JSON.stringify(o);
	}
	
	// timestamps
	if( ! localStorage.timestamps) localStorage.timestamps = '';
	
	// BADGE
	if( ! localStorage.badgeValue) localStorage.badgeValue = 0;
	if( ! localStorage.badgeUrl) localStorage.badgeUrl = '';
	
	// TOKEN
	if( ! localStorage.token) localStorage.token = '';
	
	// LOGIN
	if( ! localStorage.login) localStorage.login = '';
};
				

/**
 * INIT
 *
 */
initLocalStorage();
initBadge();
autoUpdateBadge();
