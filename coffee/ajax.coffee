##
 # Classe Ajax
 #
bgPage = chrome.extension.getBackgroundPage()

ajax =
	
	url_api: "https://api.betaseries.com",	# Url API
	site_url: "https://www.betaseries.com",	# Url site
	key: "6db16a6ffab9",					# Developer key
	
	## Envoie des données en POST vers un des WS de BetaSeries
	post: (category, params, successCallback, errorCallback) ->
		params ?= ''
		member = DB.get 'session', {}
		token = if member.token is null then '' else "&token=" + member.token
		$('#sync img').attr 'src', '../img/sync.gif'
		
		$.ajax
			type: "POST"
			url: @url_api + category + ".json"
			data: "key=" + @key + params + token
			dataType: "json"
			success: (data) ->
				#console.log data
				$('#sync img').attr 'src', '../img/sync.png'
				successCallback data if successCallback?
			error: ->
				$('#sync img').attr 'src', '../img/sync.png'
				errorCallback() if errorCallback?

requestFilter = urls: [ "<all_urls>" ]

extraInfoSpec = ['requestHeaders']
  
handler = (details) ->
	headers = details.requestHeaders
	blockingResponse = {}
	for i, j of headers
		if headers[i].name is 'User-Agent'
			headers[i].value = 'chromeseries-' + Fx.getVersion()
			break
	blockingResponse.requestHeaders = headers
	return blockingResponse

chrome.webRequest.onBeforeSendHeaders.addListener handler, requestFilter, extraInfoSpec
