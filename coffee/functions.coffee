## Internationalisation
__ = (msgname, placeholders) -> 
	if msgname then chrome.i18n.getMessage msgname, placeholders

## Functions (Fx)
Fx = 
	
	##
	openTab: (url, active) ->
		active ?= false
		chrome.tabs.create {"url": url, "active": active}
		return false
	
	## Concaténer plusieurs objets (notifications page)
	concat: ->
		ret = {}
		n = 0
		for i, j of arguments
			for k, l of j
				if n < 20
					ret[n] = l
					n++
		return ret;
	
	##
	subFirst: (str, nbr) ->
		strLength = str.length
		strSub = str.substring 0, nbr
		strSub += '..' if strSub.length < strLength 
		return strSub
	
	##
	subLast: (str, nbr) ->
		strLength = str.length;
		strSub = str.substring strLength, Math.max 0, strLength-nbr
		strSub = '..' + strSub if strSub.length < strLength
		return strSub
		
	##
	updateHeight: (top) ->
		top ?= false
		setTimeout (
			-> 
				maxHeight = DB.get('options').max_height
				#h = $('#page').height() + 14
				#h = if h > maxHeight then maxHeight else h
				$('#about').height maxHeight
				params = if top then {scroll:'top'} else {}
				$('.nano').nanoScroller(params)
		), 500
		
	##
	toUpdate: (view) ->
		views = DB.get 'views'
		if views[view]?
			views[view].force = true
			DB.set 'views', views
	
	##
	getVersion: ->
		return chrome.app.getDetails().version
		
	##
	getNumber: (season, episode) ->
		number = 'S'
		number += '0' if season <= 9
		number += season
		number += 'E'
		number += '0' if episode <= 9
		number += episode
		return number
	
	##
	displayNumber: (number) ->
		res = '#'
		res += number[1] if number[1] isnt '0'
		res += number[2]
		res += number[4]
		res += number[5]
		return res

	##
	splitNumber: (number) ->
		season = ''
		season += number[1] if number[1] isnt '0'
		season += number[2]
		episode = ''
		episode += number[4] if number[4] isnt '0'
		episode += number[5]
		season: season
		episode: episode
		
	##
	getCacheSize: (key) ->
		if key?
			size = Math.floor JSON.stringify(localStorage[key]).length
		else
			size = Math.floor JSON.stringify(localStorage).length
		return size	
	
	##
	getCacheFormat: (size) ->
		if size < 1000
			return size + ' o'
		else if size < 1000*1000
			return (Math.floor(size /100) /10) + ' Ko'
		else
			return (Math.floor(size /1000) /1000) + ' Mo'
			
	##
	needUpdate: ->
	 	return __('no_data_found')
	 	
	##
	checkVersion: ->
		version = DB.get 'version', 0
		currVersion = Fx.getVersion()
		newVersion = version isnt currVersion
		$('#versionLink').text Fx.getVersion()
		if (newVersion) 
			DB.set 'version', currVersion
			$('#message').html(__('new_version')).show()
		
