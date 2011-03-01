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
 * Mets à jour le badge
 * 
 */
var update_badge = function() {
	chrome.browserAction.setBadgeText({text: "..."});
	chrome.browserAction.setBadgeBackgroundColor({color: [200, 200, 200, 255]});
	
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
			var texte = (j > 0) ? ""+j : " ";
			
			chrome.browserAction.setBadgeText({text: texte});
			chrome.browserAction.setBadgeBackgroundColor({color: [200, 50, 50, 255]});	
		}
	});
}

/**
 * Lance la mise à jour automatique du badge
 *
 */
var auto_update = function() {
	if (connected()){
		update_badge();
		setTimeout(auto_update, 1000*60*60); // Mise à jour toutes les heures.
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
auto_update();
