class View_Search
	
	init: =>
		@id = 'Search'
		@name = 'Search'
	
	content: ->
		output  = '<form id="search">'
		output += '<input type="text" name="terms" id="terms" /> '
		output += '<input type="submit" value="chercher" />'
		output += '</form>'
		output += '<div id="suggests_shows"></div>'
		output += '<div id="suggests_members"></div>'
		output += '<div id="results_shows"></div>'
		output += '<div id="results_members"></div>'
		setTimeout (() -> $('#terms').focus()), 100
		return output

	listen: ->

		# search
		$('.Search').on 'submit', '#search', ->
			terms = $('#terms').val()
			#var inputs = $(this).find('input').attr {disabled: 'disabled'}

			params = "&title=" + terms
			ajax.post "/shows/search", params, 
				(data) ->
					content = '<div class="title">' + __('shows') + '</div>'
					shows = data.root.shows
					if Object.keys(shows).length > 0
						for n of shows
							show = shows[n]
							content += '<div class="episode"><a href="" url="' + show.url + '" title="' + show.title + '" class="epLink display_show">' + Fx.subFirst(show.title, 25) + '</a></div>'
					else
						content += '<div class="episode">' + __('no_shows_found') + '</div>'
					$('#results_shows').html content
					Fx.updateHeight()
				->
					#inputs.removeAttr 'disabled'
			
			params = "&login=" + terms
			ajax.post "/members/search", params, 
				(data) ->
					content = '<div class="title">' + __('members') + '</div>'
					members = data.root.members
					if Object.keys(members).length > 0
						for n of members
							member = members[n]
							content += '<div class="episode"><a href="#" login="' + member.login + '" class="epLink display_member">' + Fx.subFirst(member.login, 25) + '</a></div>'
					else
						content += '<div class="episode">' + __('no_members_found') + '</div>'
					$('#results_members').html content
					Fx.updateHeight()
				->
					#inputs.removeAttr 'disabled'
			
			return false

		# Open serie view
		$('.Search').on 'click', '.display_show', ->
			event.preventDefault()
			url = $(@).attr 'url'
			app.view.load 'Show', url

		# Open member view
		$('.Search').on 'click', '.display_member', ->
			event.preventDefault()
			login = $(@).attr 'login'
			app.view.load 'Member', login
