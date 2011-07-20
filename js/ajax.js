/**
 * Classe Ajax
 * @author Menencia
 *
 */
 
var bgPage = chrome.extension.getBackgroundPage();

var ajax = {
	
	url_api: "http://api.betaseries.com",	// Url API
	site_url: "http://betaseries.com",		// Url site
	key: "6db16a6ffab9",					// Developer key
	
	/**
	 * Envoie des données en POST vers un des WS de BetaSeries
	 *
	 */
	post: function(category, params, successCallback, errorCallback){
		params = params || '';
		var token = (DB.get('member.token') == null) ? '': "&token="+DB.get('member.token');
		$.ajax({
			type: "POST",
			url: this.url_api+category+".json",
			data: "key="+this.key+params+token,
			dataType: "json",
			success: function(data){
				$('#status').attr('src', '../img/plot_green.gif');
				if (successCallback) successCallback(data);
			},
			error: function(){
				$('#status').attr('src', '../img/plot_red.gif');
				if (errorCallback) errorCallback();
			}
		});
	},
	
};
	
/**
 * Animations de chargement liés à une requête ajax
 */
$("#sync").bind("ajaxSend", function(){
	$(this).show();
	$('#status').attr('src', '../img/plot_orange.gif');
}).bind("ajaxComplete", function(){
	$(this).hide();
});
