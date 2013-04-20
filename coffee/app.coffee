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
		$('*[title], *[smart-title]').on
		mouseenter: ->
			title = $(@).attr 'title'
			if title? 
				$(@).removeAttr 'title'
				$(@).attr 'smart-title', title
			else
				title = $(@).attr 'smart-title'
			$('#help').show()
			$('#help-text').html title
		mouseleave: ->
			$('#help').hide()
			$('#help-text').html ''
		click: ->
			$('#help').hide()
			$('#help-text').html ''

		# Go back
		$('#back').click ->
				Historic.back()
				return false
			.attr 'title', __("back")
		
		# Refresh
		$('#sync')
			.click(=> @view.refresh())
			.attr 'title', __('sync')

		# Open member notifications view
		$('#notifications').click ->
				BS.load 'MemberNotifications'
				return false
			.attr 'title', __('notifs')
		
		# Show/hide menu
		$('#menu')
			.click =>
				if @view.id is 'Menu'
					@historic.refresh()
				else
					@view.load 'Menu'
			.attr 'title', __('menu')

		# Close message
		$('#message').on 'click', '.close', ->
			event.preventDefault()
			$('#message').fadeOut()


		