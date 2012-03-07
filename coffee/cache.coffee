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
				#commentsEpisode.thewalkingdead.2.11
				#comments.thewalkingdead.S02E11
				args = viewid.split '.'
				number = Fx.getNumber args[2], args[3]
				DB.remove 'comments.' + args[1] + '.' + number
				delete views_to_remove[viewid]
		DB.set 'views_to_remove', views_to_remove
