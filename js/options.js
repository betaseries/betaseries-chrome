$(document).ready(function(){

	var bgPage = chrome.extension.getBackgroundPage();
	
	/**
	 * Internationalisation
	 */
	var __ = function(msgname){
		return chrome.i18n.getMessage(msgname);
	};
	
	// Internationalisation
	$('#link_general').text(__('general'));
	$('#link_facebook').text(__('facebook'));
	$('#link_about').text(__('about'));
	$('#title_badge').text(__('badge'));
	$('#title_view_episodes_not_seen').text(__('view_episodes_not_seen'));
	$('#save_options').text(__('save'));
	$('#dl_srt_language').text(__("dl_srt_language"));
	$('#nbr_episodes_per_serie').text(__("nbr_episodes_per_serie"));
	$('#badge_notification_type').text(__("badge_notification_type"));
	$('#display_global').text(__("display_global"));
	$('#enable_ratings').text(__("enable_ratings"));
	$('#title_author').text(__('author'));
	$('#title_contributors').text(__('contributors'));
	$('#title_ext_page').text(__('extension_page'));
	$('#title_git_page').text(__('github_page'));
	$('#title_suggestions').text(__('suggestions_or_bugs'));
	
	// Remplissage des champs
	$('select[name=badge_notification_type]').val(DB.get('options.badge_notification_type'));
	$('select[name=dl_srt_language]').val(DB.get('options.dl_srt_language'));
	$('input[name=nbr_episodes_per_serie]').attr('value', DB.get('options.nbr_episodes_per_serie'));
	$('select[name=display_global]').val(DB.get('options.display_global'));
	$('select[name=enable_ratings]').val(DB.get('options.enable_ratings'));
	$('option[value=watched]').text(__('episodes_not_seen'));
	$('option[value=downloaded]').text(__('episodes_not_dl'));
	$('option[value=VO]').text(__('vo'));
	$('option[value=VF]').text(__('vf'));
	$('option[value=ALL]').text(__('all'));
	$('option[value=true]').text(__('yes'));
	$('option[value=false]').text(__('no'));
	
	$('#save_options').click(function(){
		DB.set('options.badge_notification_type', $('select[name=badge_notification_type] :selected').val());
		DB.set('options.dl_srt_language', $('select[name=dl_srt_language] :selected').val());
		DB.set('options.nbr_episodes_per_serie', $('input[name=nbr_episodes_per_serie]').attr('value'));
		DB.set('options.display_global', $('select[name=display_global] :selected').val());
		DB.set('options.enable_ratings', $('select[name=enable_ratings] :selected').val());
		bgPage.badge.update();
		$(this).html('Sauvegardé !');
		$(this).css('background-color', '#eafedf');
		$('#save_options').css('color', '#999');
		setTimeout(init_save, 1000*5);
	});
	
	var init_save = function(){
		$('#save_options').html(__('save'));
		$('#save_options').css('background-color', '#a6e086');
		$('#save_options').css('color', '#fff');
	};
	
	$('.menu a').click(function(){
		var menu = $(this).attr('id').substring(5);
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