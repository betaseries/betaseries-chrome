/**
 * Background.js
 * Init & auto-update processes
 * 
 * @author Menencia
 * 
 * 
 */
 
/**
 * Variables
 * 
 */
var url_api = "http://api.betaseries.com";
var site_url = "http://betaseries.com";
var key = "6db16a6ffab9";

/**
 * Initialise le badge
 * 
 */
var initBadge = function(){
	chrome.browserAction.setBadgeText({text: "..."});
	chrome.browserAction.setBadgeBackgroundColor({color: [200, 200, 200, 255]});
};

/**
 * Mets à jour le badge
 * 
 */
var updateBadge = function(){
	initBadge();
	$.ajax({
		type: "POST",
		url: url_api+"/members/episodes/all.json",
		data: "key="+key+"&token="+localStorage.token,
		dataType: "json",
		success: function(data){
			var episodes = data.root.episodes;
			var j = 0;
			for (var i in episodes){
				if (episodes.hasOwnProperty(i)) j++;
			}
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
	return (localStorage.token != "" && localStorage.token != undefined);
};

/**
 * INIT
 *
 */
autoUpdateBadge();
