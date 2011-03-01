var url_api = "http://api.betaseries.com";
var site_url = "http://betaseries.com";
var key = "6db16a6ffab9";

/**
 * Envoie des données en GET vers un des WS de Bétaséries
 * 
 * @param category 		Un des WS de Bétaséries
 * @param params 		Arguments supplémentaires à envoyer
 * @return callback		Fonction de retour
 */
var send = function(category, params, callback) {
	$.ajax({
		type: "POST",
		url: url_api+category+".json",
		data: "key="+key+params,
		dataType: "json",
		success: callback
	});
};

/**
 * Initialise le badge
 * 
 * @return 
 */
var init_badge = function() {
	chrome.browserAction.setBadgeText({text: "x"});
	chrome.browserAction.setBadgeBackgroundColor({color: [200, 200, 200, 255]});
}

/**
 * Mets à jour le badge
 *
 * @return
 */
var update_badge = function() {
	init_badge();
	var params = "&token="+localStorage.token;
	send("/members/episodes/all", params, function (data) {
		var episodes = data.root.episodes;
		var j = 0;
		for (var i in episodes) {
			if (episodes.hasOwnProperty(i)) {
				j += 1;
			}
		}
		if (j > 0) chrome.browserAction.setBadgeText({text: ""+j});
		chrome.browserAction.setBadgeBackgroundColor({color: [150, 0, 0, 255]});
	});
}

/**
 * Lance la mise à jour automatique du badge
 *
 * @return
 */
var auto_update = function() {
	if (connected()) update_badge();
	setTimeout(auto_update, 1000*60*60); // Mise à jour toutes les heures.
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
 * Afficher le message de confirmation
 */
var message = function(content) {
	$('#message').html(content);
	setTimeout(function(){
		$('#message').html('');		
	}, 1000*5);	
};

/**
 * INIT
 *
 */
init_badge();
auto_update();
