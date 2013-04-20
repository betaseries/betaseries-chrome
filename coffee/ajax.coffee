#
# Objet ajax
#
ajax =
	
	url_api: "https://api.betaseries.com",	# Url API
	site_url: "https://www.betaseries.com",	# Url site
	key: "6db16a6ffab9",					# Developer key
	
	## Envoie des données en POST vers un des WS de BetaSeries
	post: (category, params, successCallback, errorCallback) ->
		params ?= ''
		member = DB.get 'session', {}
		token = if member.token is null then '' else "&token=" + member.token
		$('#sync').removeClass 'paused'
		
		$.ajax
			type: "POST"
			url: @url_api + category + ".json"
			data: "key=" + @key + params + token
			dataType: "json"
			success: (data) ->
				$('#sync').addClass 'paused'
				#if data.root.errors.error?
				#	Fx.message data.root.errors.error.content
				#else
				successCallback data if successCallback?
			error: ->
				$('#sync').addClass 'paused'
				errorCallback() if errorCallback?

if chrome.declarativeWebRequest?
	rule = 
		conditions: [new chrome.declarativeWebRequest.RequestMatcher {url: {hostSuffix: 'api.betaseries.com'}}]
		actions: [new chrome.declarativeWebRequest.SetRequestHeader {name:'User-Agent', value:Fx.getNewUserAgent()}]

	chrome.declarativeWebRequest.onRequest.addRules [rule]
