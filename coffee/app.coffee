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
		
		# About titles
		$('body')
			.on 'mouseenter', '*[title], *[smart-title]', ->
				title = $(@).attr 'title'
				if title? 
					$(@).removeAttr 'title'
					$(@).attr 'smart-title', title
				else
					title = $(@).attr 'smart-title'
				$('#help').show()
				$('#help-text').html title
			.on 'mouseleave', '*[title], *[smart-title]', ->
				$('#help').hide()
				$('#help-text').html ''
			.on 'click', '*[title], *[smart-title]', ->
				$('#help').hide()
				$('#help-text').html ''

		# Go to BetaSeries website
		$('#logoLink')
			.click(-> Fx.openTab ajax.site_url, true)
			.attr 'title', __("logo")

		# Go to Chrome Webstore
		$('#versionLink')
			.click(-> Fx.openTab 'https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true)
			.attr 'title', __("version")

		# Go back
		$('#back')
			.click =>
				@historic.back()
				return false
			.attr 'title', __("back")
		
		# Refresh
		$('#sync')
			.click(=> @view.refresh())
			.attr 'title', __('sync')
		$('#sync').addClass 'paused'

		# Search
		$('#search')
			.click =>
				@view.load 'Search'
				return false
			.attr 'title', __("menu_Search")

		# My episodes view
		$('#my-episodes')
			.click =>
				@view.load 'MyEpisodes'
				return false
			.attr 'title', __("menu_MyEpisodes")
		
		# Show/hide menu
		$('#menu')
			.click =>
				if @view.infos.id is 'Menu'
					@historic.refresh()
				else
					@view.load 'Menu'
			.attr 'title', __('menu')

		# Close message
		$('#message').on 'click', '.close', ->
			event.preventDefault()
			$('#message').fadeOut()


		