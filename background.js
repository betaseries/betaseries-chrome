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
 * Mets à jour le badge
 * 
 */
var updateBadge = function(){
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
					if (localStorage.badge_notification_type == 'watched') j++;
					if (localStorage.badge_notification_type == 'downloaded' && episodes[i].downloaded != 1) j++;
				}
			}
			localStorage.badge_value = j;
			displayBadge(j);
		},
		error: function (){
			var j = localStorage.badge_value;
			displayBadge(j);
		}
	});
}

var displayBadge = function(texte){
	if(texte==0){
		chrome.browserAction.setBadgeText({text: ""});
	}else{
		chrome.browserAction.setBadgeBackgroundColor({color: [200, 50, 50, 255]});		
		chrome.browserAction.setBadgeText({text: ""+texte});
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
	return (localStorage.token != "");
};

/**
 *
 */
var initLocalStorage = function() { 
	// OPTIONS
	if( ! localStorage.dl_srt_language) localStorage.dl_srt_language = 'VF';
	if( ! localStorage.nbr_episodes_per_serie) localStorage.nbr_episodes_per_serie = 5;
	if( ! localStorage.badge_notification_type) localStorage.badge_notification_type = 'watched';
	
	// VIEWS
	if( ! localStorage.pages) localStorage.pages = [];
	if( ! localStorage.planning) localStorage.planning = '';
	if( ! localStorage.episodes) localStorage.episodes = '';
	if( ! localStorage.infos) localStorage.infos = '';
	
	// BADGE
	if( ! localStorage.badge_value) localStorage.badge_value = 0;
	
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
