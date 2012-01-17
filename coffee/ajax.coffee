##
 # Classe Ajax
 #
bgPage = chrome.extension.getBackgroundPage()

ajax =
	
	url_api: "http://api.betaseries.com",	# Url API
	site_url: "http://betaseries.com",		# Url site
	key: "6db16a6ffab9",					# Developer key
	
	## Envoie des données en POST vers un des WS de BetaSeries
	post: (category, params, successCallback, errorCallback) ->
		params ?= ''
		token = if (DB.get 'member.token') is null then '' else "&token=" + DB.get 'member.token'
		$('#sync').show()
		$.ajax
			type: "POST"
			url: @url_api + category + ".json"
			data: "key=" + @key + params + token
			dataType: "json"
			success: (data) ->
				#console.log data
				$('#status').attr 'src', '../img/plot_green.gif'
				$('#sync').hide()
				successCallback data if successCallback?
			error: ->
				$('#sync').hide()
				$('#status').attr 'src', '../img/plot_red.gif'
				errorCallback() if errorCallback?
