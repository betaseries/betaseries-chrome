class App

	# array of View objects
	historic: null

	# current View object
	view: null

	init: ->
		# database
		DB.init()
			
		# check updates
		Fx.checkVersion()

		# home page
		homepage = if Fx.logged() then 'MyEpisodes' else 'Connection'

		# init historic
		@historic = new Historic(@)

		# init view
		@view = new View(@)
		@view.load homepage

		@listen()


	# listen for top elements UI
	listen: ->
		# Action: revenir en arrière
		$('#back').click ->
				Historic.back()
				return false
			.attr 'title', __("back")
		
		# Action: Rafraîchir une vue
		$('#sync')
			.click(=> @view.refresh())
			.attr 'title', __('sync')

		# Action: Aller à "Mes notifications"
		$('#notifications').click ->
				BS.load 'MemberNotifications'
				return false
			.attr 'title', __('notifs')
		
		# Action: Afficher/quitter le menu
		$('#menu')
			.click =>
				if @view.id is 'Menu'
					@historic.refresh()
				else
					@view.load 'Menu'
			.attr 'title', __('menu')

		# Action: Fermer l'encart message
		$('#message').on 'click', '.close', ->
			event.preventDefault()
			$('#message').fadeOut()


		