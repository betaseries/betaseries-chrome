##
 # Classe Historic
 #
Historic =
	
	## rafraîchit le dernier truc dans l'historique
	refresh: ->
		historic = DB.get 'historic'
		length = historic.length
		args = historic[length-1].split '.'
		BS.load.apply BS, args
		
	##	
	save: ->
		historic = DB.get 'historic'
		length = historic.length
		blackpages = ['connection', 'registration', 'menu']
		view = BS.currentView.id
		if historic[length-1] isnt view and !(view in blackpages)
			historic.push view
			DB.set 'historic', historic
			$('#back').show() if length is 1
	
	##
	back: ->
		historic = DB.get 'historic'
		if (length = historic.length) >= 2
			historic.pop()
			args = historic[length-2].split '.'
			console.log args
			BS.load.apply BS, args
			DB.set 'historic', historic
			$('#back').hide() if length is 2
		return false
