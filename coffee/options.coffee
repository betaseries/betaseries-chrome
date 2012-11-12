$(document).ready ->

	## Internationalisation
	__ = (msgname) -> chrome.i18n.getMessage msgname
	
	## Internationalisation
	$('#link_general').text __('general')
	$('#link_facebook').text __('facebook')
	$('#link_about').text __('about')
	$('#title_badge').text __('badge')
	$('#title_view_episodes_not_seen').text __('view_episodes_not_seen')
	$('#save_options').text __('save')
	$('#dl_srt_language').text __("dl_srt_language")
	$('#nbr_episodes_per_serie').text __("nbr_episodes_per_serie")
	$('#badge_notification_type').text __("badge_notification_type")
	$('#display_global').text __("display_global")
	$('#enable_ratings').text __("enable_ratings")
	$('#max_height').text __("max_height")
	$('#display_mean_note').text __("display_mean_note")
	$('#display_copy_episode').text __("display_copy_episode")
	$('#display_notifications_icon').text __("display_notifications_icon")
	$('#mark_notifs_episode_as_seen').text __("mark_notifs_episode_as_seen")
	$('#title_view_menu').text __("title_view_menu")
	$('#order_sections').text __("order_sections")
	$('#title_author').text __('author')
	$('#title_contributors').text __('contributors')
	$('#title_ext_page').text __('extension_page')
	$('#title_git_page').text __('github_page')
	$('#title_suggestions').text __('suggestions_or_bugs')
	
	## Remplissage des champs
	$('select[name=badge_notification_type]').val DB.get('options').badge_notification_type
	$('select[name=dl_srt_language]').val DB.get('options').dl_srt_language
	$('input[name=nbr_episodes_per_serie]').attr 'value', DB.get('options').nbr_episodes_per_serie
	$('select[name=display_global]').val DB.get('options').display_global + ""
	$('select[name=enable_ratings]').val DB.get('options').enable_ratings + ""
	$('input[name=max_height]').attr 'value', DB.get('options').max_height
	$('select[name=display_mean_note]').val DB.get('options').display_mean_note + ""
	$('select[name=display_copy_episode]').val DB.get('options').display_copy_episode + ""
	$('select[name=display_notifications_icon]').val DB.get('options').display_notifications_icon + ""
	$('select[name=mark_notifs_episode_as_seen]').val DB.get('options').mark_notifs_episode_as_seen + ""
	menu_order = DB.get('options').menu_order
	for menu in menu_order
		selected = if menu.visible then 'checked="checked" ' else ''
		$('#sections').append '<span id="' + menu.name + '">' + '<input type="checkbox" ' + selected + '/>' + '<img src="../img/grippy.png" /> ' + __('menu_' + menu.name) + '</span>'
	$('option[value=watched]').text __('episodes_not_seen')
	$('option[value=downloaded]').text __('episodes_not_dl')
	$('option[value=VO]').text __('vo')
	$('option[value=VF]').text __('vf')
	$('option[value=ALL]').text __('all')
	$('option[value=true]').text __('yes')
	$('option[value=false]').text __('no')

	## Activation du drag'n drop
	$("#sections").dragsort
		dragSelector: "img", 
		dragEnd: -> ,
		dragBetween: false, 
		placeHolderTemplate: false
	$('#sections img').removeAttr 'style'
	
	$('#save_options').click ->
		for i in menu_order
			visible = $('#sections #' + i.name).find('input').is(':checked')
			i.visible = visible
		menu_order.sort (a, b) ->
			if $('#sections #' + a.name).index() < $('#sections #' + b.name).index()
				return -1
			if $('#sections #' + a.name).index() > $('#sections #' + b.name).index()
				return 1
			return 0
		options =
			badge_notification_type: $('select[name=badge_notification_type] :selected').val()
			dl_srt_language: $('select[name=dl_srt_language] :selected').val()
			nbr_episodes_per_serie: parseInt $('input[name=nbr_episodes_per_serie]').attr 'value'
			display_global: $('select[name=display_global] :selected').val() is 'true'
			enable_ratings: $('select[name=enable_ratings] :selected').val() is 'true'
			max_height: parseInt $('input[name=max_height]').attr 'value'
			display_mean_note: $('select[name=display_mean_note] :selected').val() is 'true'
			display_copy_episode: $('select[name=display_copy_episode] :selected').val() is 'true'
			display_notifications_icon: $('select[name=display_notifications_icon] :selected').val() is 'true'
			mark_notifs_episode_as_seen: $('select[name=mark_notifs_episode_as_seen] :selected').val() is 'true'
			menu_order: menu_order
		DB.set 'options', options
		Badge.update()
		$(this).html __('saved')
		$(this).css 'background-color', '#eafedf'
		$('#save_options').css 'color', '#999'
		setTimeout init_save, 1000 * 5
	
	init_save = ->
		$('#save_options').html __('save')
		$('#save_options').css 'background-color', '#a6e086'
		$('#save_options').css 'color', '#fff'
	
	$('.menu a').click ->
		menu = $(this).attr('id').substring 5
		showPart menu
		return false
	
	showPart = (menu) ->
		$('.content div.part').hide()
		$('.content div#'+menu).slideDown()
		
		$('li').removeClass 'selected'
		$('li#' + menu).addClass 'selected'
		
	showPart "general"
	
_gaq = _gaq || [];
_gaq.push ['_setAccount', 'UA-36275514-1']
_gaq.push ['_trackPageview']
(->
	ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
)()
