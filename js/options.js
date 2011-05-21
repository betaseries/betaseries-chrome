$(document).ready(function(){

	var bgPage = chrome.extension.getBackgroundPage();
	
	var options = JSON.parse(localStorage.options);
	
	$('#opt_'+options['dl_srt_language']).attr("checked", "checked");
	$('#nbr_episodes_per_serie').attr('value', options['nbr_episodes_per_serie']);
	$('#opt_'+options['badge_notification_type']).attr("checked", "checked");
	
	$('#save').click(function(){
		options = {
			dl_srt_language: $('input[name=dl_srt_language]:checked').val(),
			nbr_episodes_per_serie: $('#nbr_episodes_per_serie').attr('value'),
			badge_notification_type: $('input[name=badge_notification_type]:checked').val()
		};
		localStorage.options = JSON.stringify(options);
		bgPage.updateBadge();
		$(this).html('Sauvegardé !');
		$(this).css('background-color', '#eafedf');
		$('#save').css('color', '#999');
		setTimeout(init_save, 1000*5);
	});
	
	var init_save = function(){
		$('#save').html('Sauvegarder');
		$('#save').css('background-color', '#a6e086');
		$('#save').css('color', '#fff');
	};
	
	$('.menu a').click(function(){
		var menu = $(this).attr('id');
		showPart(menu);
		return false;
	});
	
	var showPart = function(menu){
		$('.content div.part').hide();
		$('.content div#'+menu).slideDown();
		
		$('li#'+menu).css('opacity', '0.7');
		$('li#'+menu).css('margin-left', '5px');
		
		if (currentMenu){
			$('li#'+currentMenu).css('opacity', '1');
			$('li#'+currentMenu).css('margin-left', '0px');
		}
		
		currentMenu = menu;
	};
	
	var currentMenu = "";
	showPart("general");
	
});