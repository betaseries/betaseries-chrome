##
 # Classe Cache
 #
 #
Cache =

	views: ['commentsEpisode']
	
	## Enlève la vue courante des vues à supprimer
	keep: ->
		o = BS.currentView
		views_to_remove = DB.get 'views_to_remove'
		delete views_to_remove[o.id]
		DB.set 'views_to_remove', views_to_remove
	

	## Ajoute la vue courante à supprimer
	## et qui sera supprimée dans DB.clean
	remove: ->
		o = BS.currentView
		views_to_remove = DB.get 'views_to_remove'
		views_to_remove[o.id] = o.name
		DB.set 'views_to_remove', views_to_remove
		
	## Supprime une vue de cache (plus subtil que DB.remove)
	clean: (view) ->
		views_to_remove = DB.get 'views_to_remove'
		for viewid, viewclass of views_to_remove
			if !(viewclass in @views)
				continue
			if viewclass is 'commentsEpisode'
				#commentsEpisode.castle.75
				#comments.castle.75
				args = viewid.split '.'
				DB.remove 'comments.' + args[1] + '.' + args[2]
				delete views_to_remove[viewid]
		DB.set 'views_to_remove', views_to_remove
