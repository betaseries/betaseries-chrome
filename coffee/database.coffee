##
 # Classe Database
 #
 #
DB =

	init: ->
		# OPTIONS
		options = 
			badge_notification_type: 'watched'
			dl_srt_language: 'VF'
			nbr_episodes_per_serie: 5
			display_global: false
			enable_ratings: true
			max_height: 200
			
		@set 'options', options, true
		
		# BADGE
		badge = 
			value: 0
			type: 'membersEpisodes'
			
		@set 'badge', badge, true
		
		# Historique
		@set 'historic', [], false
		
		# Vues à recharger
		@set 'views_updated', {}, true
		@set 'views_to_refresh', [], true
		@set 'views_to_remove', {}, true
		
		# Notifications
		@set 'notifications', {}, true
		
	## Getter - Obtenir la valeur d'un champ de la BD
	 #
	 # field			<string>	Chemin + nom du champ
	 # defaultValue		<object>	Valeur par défaut si champ non trouvé (optionnel)
	 #
	get: (field, defaultValue) ->
		if localStorage[field]? then JSON.parse localStorage[field] else defaultValue
	
	##
	 # Setter - Renseigner un champ de le BD
	 #
	 # field	<string>	Chemin + nom du champ
	 # value	<object>	Valeur à attribuer au champ
	 # init		<boolean>	Ne renseigne le champ seulement s'il n'existe pas (initialisation)
	 #
	set: (field, value, init) ->
		if !init or (init and !localStorage[field])
			localStorage[field] = JSON.stringify value
	
	##
	 # Supprimer un champ de la DB
	 #
	 # field	<string>	Chemin + nom du champ
	 #
	remove: (field) ->
		localStorage.removeItem field
	
	##
	 # Supprimer TOUS les champs de la BD
	 #
	removeAll: ->
		localStorage.clear()
