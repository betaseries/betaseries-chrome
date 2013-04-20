class Historic
	
	constructor: (@app) ->

	# Affiche la dernière vue dans l'historique
	refresh: ->
		historic = DB.get 'historic'
		length = historic.length
		args = historic[length-1].split '.'
		@app.view.load.apply @app.view, args
		@display length
		
	# Sauvegarde le nom de la vue courante dans l'historique
	save: ->
		historic = DB.get 'historic'
		length = historic.length
		blackpages = ['Connection', 'Registration', 'Menu']
		view = @app.view.infos.id
		if historic[length-1] isnt view and !(view in blackpages)
			historic.push view
			DB.set 'historic', historic
			length++
		@display length
	
	# Retourner à la vue précédente
	back: ->
		historic = DB.get 'historic'
		if (length = historic.length) >= 2
			historic.pop()
			args = historic[length-2].split '.'
			@app.view.load.apply @app.view, args
			DB.set 'historic', historic
			length--
		@display length
		return false

	# Afficher/cacher l'icône du retour en arrière
	display: (n) ->
		view = @app.view.infos.id
		blackpages = ['Connection', 'Registration', 'Menu']
		if n >= 2 and !(view in blackpages)
			$('#back').show()
		else
			$('#back').hide()
			