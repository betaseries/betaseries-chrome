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

	###$('.radio input').click ->
		attr = $(@).attr 'name'
		value = $(@).attr 'value'
		options[attr] = value
		DB.set 'options', options###

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

	$('.period_search_notifications span').text __('period_search_notifications')
	$('#period_search_notifications option[value=psn0]').text __('psn0')
	$('#period_search_notifications option[value=psn30]').text __('psn30')
	$('#period_search_notifications option[value=psn60]').text __('psn60')
	$('#period_search_notifications option[value=psn120]').text __('psn120')
	$('#period_search_notifications option[value=psn240]').text __('psn240')
	$('#period_search_notifications').val 'psn' + options.period_search_notifications

	$('.select select').change ->
		attr = $(@).attr 'id'
		value = $(@).attr 'value'
		if value.indexOf('psn') is 0 
			value = parseInt value.substring(3)		
		options[attr] = value
		DB.set 'options', options
		if value.indexOf('psn') is 0 
			Fx.search_notifications()	
		
	# -->

	# <-- Gestion des checkbox

	$('.checkbox').each ->
		attr = $(@).find('input').attr 'id'
		$(@).find('input').attr 'checked', options[attr]
		$(@).find('span').text __(attr)
	
	$('.checkbox input').click ->
		attr = $(@).attr 'id'
		checked = $(@).is(':checked')
		if attr in ['bs_downloaded', 'bs_decalage']
			value = if checked then '1' else '0'
			params = "&value=" + value
			
			ajax.post "/members/option/" + attr.substring(3), params, 
				(data) -> 
					checked = data.root.option.value is '1'
					options[attr] = checked
					DB.set 'options', options
		else
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
		$('#sections').append '<span id="' + menu.name + '">' +
			'<input type="checkbox" ' + selected + '/>' + 
			'<img src="../img/grippy.png" /> ' + 
			__('menu_' + menu.name) + '</span>'

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
	
	# Récupérer les options de BetaSeries
	if !options.bs_downloaded && !options.bs_decalage
		ajax.post "/members/option/downloaded", '', 
			(data) => 
				checked = data.root.option.value is '1'
				$('#downloaded').attr 'checked', checked
				options.bs_downloaded = checked
				DB.set 'options', options
		ajax.post "/members/option/decalage", '', 
			(data) => 
				checked = data.root.option.value is '1'
				$('#decalage').attr 'checked', checked
				options.bs_decalage = checked
				DB.set 'options', options

	# Navigation
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

	$('#numversion').text Fx.getVersion()
	$('#useragent').text Fx.getNewUserAgent()

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
