/**
 * Classe Ajax
 * @author Menencia
 *
 */
 
var bgPage = chrome.extension.getBackgroundPage();

var ajax = {
	
	/**
	 * Envoie des données en POST vers un des WS de BetaSeries
	 *
	 */
	post: function(category, params, successCallback, errorCallback){
		params = params || '';
		$.ajax({
			type: "POST",
			url: bgPage.url_api+category+".json",
			data: "key="+bgPage.key+params+"&token="+localStorage.token,
			dataType: "json",
			async: false, // ???
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
