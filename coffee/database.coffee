##
 # Classe Database
 #
 #
DB =

	init: ->
		# BADGE
		badge = 
			value: 0
			type: 'membersEpisodes'
		
		# OPTIONS
		options = 
			nbr_episodes_per_serie: 5
			badge_notification_type: 'watched'
			dl_srt_language: 'VF'
			display_global: false
			enable_ratings: false
			max_height: 200
		
		@set 'badge', badge, true
		@set 'historic', [], false
		@set 'options', options, true
		@set 'views', {}, true

		version = @get 'version', null
		if version is null then @set 'version', Fx.getVersion(), true
		
	## Getter - Obtenir la valeur d'un champ de la BD
	 #
	 # field			<string>	Chemin + nom du champ
	 # defaultValue		<object>	Valeur par défaut si champ non trouvé (optionnel)
	 #
	get: (field, defaultValue) ->
		if localStorage[field]? and localStorage[field] isnt 'undefined'
		then JSON.parse localStorage[field] 
		else defaultValue
	
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
