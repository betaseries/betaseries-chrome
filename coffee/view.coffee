class View

	# infos of current view
	infos: null

	constructor: (@app) ->

	# Lancer l'affichage d'une vue
	load: (view, params...) ->
		# infos de la vue
		o = new window['View_' + view]()
		
		# initialisation de la vue
		if o.init? then o.init.apply @, params

		# réaffichage de la vue ?
		sameView = @infos? and o.id is @infos.id
		
		# mémorisation de la vue
		@infos = o;
		
		# affichage de la vue (cache)
		@display() if !sameView
		
		# mise à jour des données
		if o.update?
			# on montre le bouton #sync
			$('#sync').show()	
		
			# heure actuelle à la seconde près
			time = (new Date().getDate()) + '.' + (new Date().getFullYear())
			
			views = DB.get 'views', {}
			outdated = if views[o.id]? then views[o.id].time isnt time else true
			force = if views[o.id]? then views[o.id].force else true
			
			# on lance la requête de mise à jour ssi ça doit l'être
			@update() if (outdated or force)
		
		# on cache le bouton #sync
		else
			$('#sync').hide()

	# Mettre à jour les données de la vue courante
	update: ->
		# infos de la vue
		o = @infos
		
		# paramètres
		params = o.params || ''
		
		# ajax request
		ajax.post o.url, params, 
			(data) =>
				# réception des données
				cache = data.root[o.root]
				
				# Mise à jour du cache
				Cache.remove data.root.code

				# infos de la vue
				time = (new Date().getDate()) + '.' + (new Date().getFullYear())
				views = DB.get 'views', {}
				views[o.id] = 
					time: time
					force: false
				DB.set 'views', views
					
				# mise à jour du cache
				o.update(cache)
				
				# affichage de la vue courante (cache)
				@display()

	# Afficher la vue courante avec les données en cache
	display: ->
		# infos de la vue
		o = @infos
		
		# mise à jour de l'historique
		@app.historic.save()
		
		# affichage de la vue (cache)
		$('#page').html ''
		$('#page').html o.content() if o.content
		
		# Titre et classe
		$('#title').text __('title_' + o.name)
		$('#page').removeClass().addClass o.name

		# listeners
		o.listen() if o.listen
		
		# Hauteur du popup
		Fx.updateHeight()

	# Réactualise la vue courante
	refresh: ->
		Fx.toUpdate @infos.id
		args = @infos.id.split '.'
		@load.apply @, args
		

