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


	# listen for top elements UI
	listen: ->
		# Action: aller sur le site de BetaSeries
		$('#logoLink')
			.click(-> Fx.openTab ajax.site_url, true)
			.attr 'title', __("logo")
		
		# Action: aller sur la page du ChromeWebStore
		$('#versionLink')
			.click(-> Fx.openTab 'https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true)
			.attr 'title', __("version")
		
		## Actions: liens du menu
		$('.Menu a').live 'click', ->
			event.preventDefault()
			id = $(@).attr('id').substring 5
			if (id is 'Options')
				Fx.openTab chrome.extension.getURL('../html/options.html'), true
			else if (id is 'Logout')
				Fx.logout()
			else
				BS.load id

		# Action: revenir en arrière
		$('#back').click ->
				Historic.back()
				return false
			.attr 'title', __("back")
		
		# Action: Rafraîchir une vue
		$('#sync')
			.click(-> BS.refresh())
			.attr 'title', __('sync')

		# Action: Aller à "Mes notifications"
		$('#notifications').click ->
				BS.load 'MemberNotifications'
				return false
			.attr 'title', __('notifs')
		
		# Action: Afficher/quitter le menu
		$('#menu')
			.click ->
				if BS.currentView.id is 'Menu'
					@historic.refresh()
				else
					@view.load 'Menu'
			.attr 'title', __('menu')

		# Action: Fermer l'encart message
		$('#message').on 'click', '.close', ->
			event.preventDefault()
			$('#message').fadeOut()


		