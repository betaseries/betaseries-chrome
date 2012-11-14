$(document).ready ->
    
	# Internationalisation
	__ = (msgname) -> chrome.i18n.getMessage msgname
	
	# Récupération des options
	options = DB.get 'options'

	# <-- Gestion des text

	$('.max_height span').text __("max_height")
	$('.max_height input').attr 'value', options.max_height + ''

	$('.nbr_episodes_per_serie span').text __("nbr_episodes_per_serie")
	$('.nbr_episodes_per_serie input').attr 'value', options.nbr_episodes_per_serie + ''

	$('.text input').keyup ->
		attr = $(@).attr 'name'
		value = $(@).attr 'value'
		options[attr] = value
		DB.set 'options', options

	# -->

	# <-- Gestion des radiobox

	$('.radio input').click ->
		attr = $(@).attr 'name'
		value = $(@).attr 'value'
		options[attr] = value
		DB.set 'options', options

	# -->
	
	# <-- Gestion des select
	
	$('.badge_notification_type span').text __('badge_notification_type')
	$('#badge_notification_type option[value=watched]').text __('episodes_not_seen')
	$('#badge_notification_type option[value=downloaded]').text __('episodes_not_dl')
	$('#badge_notification_type').val options.badge_notification_type

	$('.dl_srt_language span').text __('dl_srt_language')
	$('#dl_srt_language option[value=VF]').text __('vf')
	$('#dl_srt_language option[value=VO]').text __('vo')
	$('#dl_srt_language option[value=ALL]').text __('all')
	$('#dl_srt_language').val options.dl_srt_language

	$('.select select').change ->
		attr = $(@).attr 'id'
		value = $(@).attr 'value'
		options[attr] = value
		DB.set 'options', options

	# -->

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

	$('#title_view_menu').text __("title_view_menu")
	$('#order_sections').text __("order_sections")
	$('#title_author').text __('author')
	$('#title_contributors').text __('contributors')
	$('#title_ext_page').text __('extension_page')
	$('#title_git_page').text __('github_page')
	$('#title_suggestions').text __('suggestions_or_bugs')	
	
	# <-- Organisation du menu

	menu_order = DB.get('options').menu_order
	for menu in menu_order
		selected = if menu.visible then 'checked="checked" ' else ''
		$('#sections').append '<span id="' + menu.name + '">' + '<input type="checkbox" ' + selected + '/>' + '<img src="../img/grippy.png" /> ' + __('menu_' + menu.name) + '</span>'

	# Activation du drag'n drop
	$("#sections").dragsort
		dragSelector: "img", 
		dragEnd: saveMenu,
		dragBetween: false, 
		placeHolderTemplate: false
	$('#sections img').removeAttr 'style'

	# Listener sur les checkbox
	$('#sections input').click ->
		checked = $(@).is(':checked')
		saveMenu()
		
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

saveMenu = ->
	options = DB.get('options')
	menu_order = options.menu_order
	for i in menu_order
		visible = $('#sections #' + i.name).find('input').is(':checked')
		i.visible = visible
	menu_order.sort (a, b) ->
		if $('#sections #' + a.name).index() < $('#sections #' + b.name).index()
			return -1
		if $('#sections #' + a.name).index() > $('#sections #' + b.name).index()
			return 1
		return 0
	options.menu_order = menu_order
	DB.set 'options', options
	