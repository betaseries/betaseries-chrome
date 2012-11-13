$(document).ready ->
    
	## Internationalisation
	__ = (msgname) -> chrome.i18n.getMessage msgname
	
	options = DB.get 'options'

	## Internationalisation
	$('.link_general').text __('general')
	$('.link_facebook').text __('facebook')
	$('.link_about').text __('about')
	$('#title_badge').text __('badge')
	$('#title_view_episodes_not_seen').text __('view_episodes_not_seen')
	$('#save_options').text __('save')
	$('#dl_srt_language').text __("dl_srt_language")
	$('#nbr_episodes_per_serie').text __("nbr_episodes_per_serie")
	
	# <-- Gestion des radiobox

	$('.watched span').text __('episodes_not_seen')
	$('.watched input').attr 'checked', ('watched' is options.badge_notification_type)
	$('.downloaded span').text __('episodes_not_dl')
	$('.downloaded input').attr 'checked', ('downloaded' is options.badge_notification_type)
	
	$('.vf span').text __('vf')
	$('.vf input').attr 'checked', ('VF' is options.dl_srt_language)
	$('.vo span').text __('vo')
	$('.vo input').attr 'checked', ('VO' is options.dl_srt_language)
	$('.all span').text __('all')
	$('.all input').attr 'checked', ('ALL' is options.dl_srt_language)

	$('.radio input').click ->
		attr = $(@).attr 'name'
		value = $(@).attr 'value'
		options[attr] = value
		DB.set 'options', options

	# <-- Gestion des checkbox

	$('#display_global label span').text __("display_global")
	$('#display_global label input').attr 'checked', options.display_global
	
	$('#enable_ratings label span').text __("enable_ratings")
	$('#enable_ratings label input').attr 'checked', DB.get('options').enable_ratings

	$('#display_mean_note label span').text __("display_mean_note")
	$('#display_mean_note label input').attr 'checked', DB.get('options').display_mean_note
	
	$('#display_copy_episode label span').text __("display_copy_episode")
	$('#display_copy_episode label input').attr 'checked', DB.get('options').display_copy_episode
	
	$('#display_notifications_icon label span').text __("display_notifications_icon")
	$('#display_notifications_icon label input').attr 'checked', DB.get('options').display_notifications_icon
	
	$('#mark_notifs_episode_as_seen label span').text __("mark_notifs_episode_as_seen")
	$('#mark_notifs_episode_as_seen label input').attr 'checked', DB.get('options').mark_notifs_episode_as_seen
	
	$('p label input').click ->
		attr = $(@).parent().parent().attr 'id'
		checked = $(@).is(':checked')
		options[attr] = checked
		DB.set 'options', options

	# -->

	$('#max_height').text __("max_height")
	$('#title_view_menu').text __("title_view_menu")
	$('#order_sections').text __("order_sections")
	$('#title_author').text __('author')
	$('#title_contributors').text __('contributors')
	$('#title_ext_page').text __('extension_page')
	$('#title_git_page').text __('github_page')
	$('#title_suggestions').text __('suggestions_or_bugs')
	
	## Remplissage des champs
	$('select[name=dl_srt_language]').val DB.get('options').dl_srt_language
	$('input[name=nbr_episodes_per_serie]').attr 'value', DB.get('options').nbr_episodes_per_serie
	
	
	$('input[name=max_height]').attr 'value', DB.get('options').max_height
	menu_order = DB.get('options').menu_order
	for menu in menu_order
		selected = if menu.visible then 'checked="checked" ' else ''
		$('#sections').append '<span id="' + menu.name + '">' + '<input type="checkbox" ' + selected + '/>' + '<img src="../img/grippy.png" /> ' + __('menu_' + menu.name) + '</span>'
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
	
	$('#save_options_____').click ->
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

	$('.menu a').click (ev) ->
		ev.preventDefault()
		selected = 'selected'

		$('.mainview > *').removeClass selected
		$('.menu li').removeClass selected
		
		setTimeout (-> $('.mainview > *:not(.selected)').css('display', 'none')), 100

		$(ev.currentTarget).parent().addClass selected
		currentView = $($(ev.currentTarget).attr('href'))
		currentView.css 'display', 'block'
		setTimeout (-> currentView.addClass(selected)), 0

		setTimeout (-> $('body')[0].scrollTop = 0), 200

	$('.mainview > *:not(.selected)').css 'display', 'none'
