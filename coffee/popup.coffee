$(document).ready ->

	$('*[title], *[smart-title]').live
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

	## Marquer un ou des épisodes comme vu(s)
	$('.ShowEpisodes .watched').live
		click: -> 
			s = $(this).closest '.show'
			show = s.attr 'id'
			start = parseInt s.attr 'start'
			
			e = $(this).closest '.episode'
			newStart = parseInt(e.attr('global')) + 1
			s.attr 'start', newStart
			season = e.attr 'season'
			episode = e.attr 'episode'

			# Cache : mise à jour du dernier épisode marqué comme vu
			login = DB.get('session').login
			es = DB.get 'member.' + login + '.episodes'
			if (not show in es) then es[show] = {}
			es[show].start = "" + newStart
			es[show].nbr_total += start - newStart
			if es[show].nbr_total is 0 then delete es[show]
			
			# Mise à jour des plots
			$('.show').find('.episode').each (i) -> 
				if $(@).attr('global') <= newStart - 1
					$(@).find('.watched').attr('src', '../img/tick.png').css('opacity', 0.5)
				else
					$(@).find('.watched').attr('src', '../img/empty.png')
			
			# Requête
			params = "&season=" + season + "&episode=" + episode
			ajax.post "/members/watched/" + show, params, 
				->
					DB.set 'member.' + login + '.episodes', es
					Cache.force 'MemberTimeline'
					badge_notification_type = DB.get('options').badge_notification_type
					if badge_notification_type is 'watched'
						Badge.searchEpisodes()
				-> 
					registerAction "/members/watched/" + show, params
			
		mouseenter: ->
			e = $(this).closest('.episode')
			e.find('.watched').attr('src', '../img/arrow_right.png').css('opacity', 1)
			
		mouseleave: ->
			start = parseInt $(this).closest('.show').attr 'start'
			e = $(this).closest('.episode')

			if (e.attr('global') < start)
				e.find('.watched').attr('src', '../img/tick.png').css('opacity', 0.5)
			else
				e.find('.watched').attr('src', '../img/empty.png')

	# Ouvrir la fiche des épisodes d'une série
	$('#page').on 'click', '.display_episodes', ->
		event.preventDefault()
		url = $(@).attr 'url'
		BS.load 'ShowEpisodes', url

	# Ouvrir la fiche d'un membre
	$('#page').on 'click', '.display_member', ->
		event.preventDefault()
		login = $(@).attr 'login'
		BS.load 'Member', login

	# Ouvrir le formulaire d'inscription
	$('#page').on 'click', '.display_registration', ->
		event.preventDefault()
		BS.load 'Registration'

	# Ouvrir le formulaire de connexion
	$('#page').on 'click', '.display_connection', ->
		event.preventDefault()
		BS.load 'Connection'

	# Ouvrir l'article du blog
	$('#page').on 'click', '.display_postblog', ->
		event.preventDefault()
		link = $(@).attr 'link'
		Fx.openTab link, true

	## Marquer un épisode comme récupéré ou pas
	$('.ShowEpisodes .downloaded').live 'click', ->
		event.preventDefault()
		
		show = $(@).attr 'show'
		season = $(@).attr 'season'
		episode = $(@).attr 'episode'
		global = $(@).attr 'global'
		
		# mise à jour du cache
		es = DB.get 'show.' + show + '.episodes'
		downloaded = es[global].downloaded
		es[global].downloaded = !downloaded
		DB.set 'show.' + show + '.episodes', es
		
		# modification de l'icône
		$(@).find('span').toggleClass 'imgSyncOff imgSyncOn'
		dl = if downloaded then 'mark_as_dl' else 'mark_as_not_dl'

		# envoi de la requête
		params = "&season=" + season + "&episode=" + episode
		ajax.post "/members/downloaded/" + show, params, 
			=>
				Cache.force 'MyEpisodes.all'
				badge_notification_type = DB.get('options').badge_notification_type
				if badge_notification_type is 'downloaded'
					Badge.searchEpisodes()
				$(@).html '<span class="imgSyncOff"></span>' + __(dl)
			-> 
				registerAction "/members/downloaded/" + show, params
	
	## Archiver une série
	$('#showsArchive').live
		click: ->
			show = $(@).attr('href').substring 1

			$(@).find('span').toggleClass 'imgSyncOff imgSyncOn'
			
			ajax.post "/shows/archive/" + show, "", 
				=>
					Cache.force 'MyEpisodes.all'
					Cache.force 'Member.' + DB.get('session').login
					Badge.searchEpisodes()
					$(@).html '<span class="imgSyncOff"></span>' + __('show_unarchive')
					$(@).attr 'id', 'showsUnarchive'
				-> registerAction "/shows/archive/" + show, ""
			
			return false
	
	## Sortir une série des archives
	$('#showsUnarchive').live
		click: ->
			show = $(this).attr('href').substring 1
			
			$(this).find('span').toggleClass 'imgSyncOff imgSyncOn'
			
			ajax.post "/shows/unarchive/" + show, "", 
				=>
					Cache.force 'MyEpisodes.all'
					Cache.force 'Member.' + DB.get('session').login
					Badge.searchEpisodes()
					$(this).html '<span class="imgSyncOff"></span>' + __('show_archive')
					$(this).attr 'id', 'showsArchive'
				-> registerAction "/shows/unarchive/" + show, ""
			
			return false
	
	## Ajoute à mes séries
	$('#showsAdd').live
		click: ->
			show = $(this).attr('href').substring 1
			
			$(this).find('span').toggleClass 'imgSyncOff imgSyncOn'
			
			ajax.post '/shows/add/' + show, '', 
				=>
					Cache.force 'MyEpisodes.all'
					Cache.force 'Member.' + DB.get('session').login
					Badge.searchEpisodes()
					$(this).html '<span class="imgSyncOff"></span>' + __('show_remove')
					$(this).attr 'id', 'showsRemove'
				-> registerAction "/shows/add/" + show, ''
			
			return false
	
	## Retirer de mes séries
	$('#showsRemove').live
		click: ->
			show = $(this).attr('href').substring 1
			
			$(this).find('span').toggleClass 'imgSyncOff imgSyncOn'

			$('#showsArchive').slideUp();
			$('#showsUnarchive').slideUp();

			ajax.post '/shows/remove/' + show, '', 
				=>
					Cache.force 'MyEpisodes.all'
					Cache.force 'Member.' + DB.get('session').login
					Badge.searchEpisodes()
					$(this).html '<span class="imgSyncOff"></span>' + __('show_add')
					$(this).attr 'id', 'showsAdd'
				-> registerAction "/shows/remove/" + show, ''
			
			return false
	
	## Ajouter un ami
	$('#friendsAdd').live
		click: ->
			login = $(this).attr('href').substring 1
			
			$(this).find('span').toggleClass 'imgSyncOff imgSyncOn'
			
			ajax.post "/members/add/" + login, '', 
				=>
					Cache.force 'MyEpisodes.' + DB.get('session').login
					Cache.force 'Member.' + login
					Cache.force 'MemberTimeline'
					$(this).html '<span class="imgSyncOff"></span>' + __('remove_to_friends', [login])
					$(this).attr 'id', 'friendsRemove'
				-> registerAction "/members/add/" + login, ''
			return false
	
	## Enlever un ami
	$('#friendsRemove').live
		click: ->
			login = $(this).attr('href').substring 1
			
			$(this).find('span').toggleClass 'imgSyncOff imgSyncOn'
			
			ajax.post "/members/delete/" + login, '', 
				=>
					Cache.force 'Member.' + DB.get('session').login
					Cache.force 'Member.' + login
					Cache.force 'MemberTimeline'
					$(this).html '<span class="imgSyncOff"></span>' + __('add_to_friends', [login])
					$(this).attr 'id', 'friendsAdd'
			return false

	## Se connecter
	$('#connect').live
		submit: ->
			login = $('#login').val()
			password = md5 $('#password').val()
			inputs = $(this).find('input').attr {disabled: 'disabled'}
			params = "&login=" + login + "&password=" + password
			ajax.post "/members/auth", params, 
				(data) ->
					if data.root.member?
						$('#message').slideUp()
						$('#connect').remove()
						token = data.root.member.token
						DB.set 'session', 
							login: login
							token: data.root.member.token
						menu.show()
						$('#back').hide()
						BS.load 'MyEpisodes'
					else
						$('#password').attr 'value', ''
						message '<img src="../img/inaccurate.png" /> ' + __('wrong_login_or_password')
						inputs.removeAttr 'disabled'
				->
					$('#password').attr 'value', ''
					inputs.removeAttr 'disabled'
					
			return false
	
	## S'inscrire
	$('#register').live
		submit: ->
			login = $('#login').val()
			password = $('#password').val()
			repassword = $('#repassword').val()
			mail = $('#mail').val()
			inputs = $(this).find('input').attr {disabled: 'disabled'}
			params = "&login=" + login + "&password=" + password + "&mail=" + mail
			pass = true
			if password isnt repassword
				pass = false
				message '<img src="../img/inaccurate.png" /> ' + __("password_not_matching")
			if login.length > 24
				pass = false
				message '<img src="../img/inaccurate.png" /> ' + __("long_login")
			if pass
				ajax.post "/members/signup", params, 
					(data) ->
						if data.root.errors.error
							err = data.root.errors.error
							#console.log "error code : " + err.code
							message '<img src="../img/inaccurate.png" /> ' + __('err' + err.code)
							$('#password').attr 'value', ''
							$('#repassword').attr 'value', ''
							inputs.removeAttr 'disabled'
						else
							BS.load 'Connection'
							$('#login').val login
							$('#password').val password
							$('#connect').trigger 'submit'
					->
						$('#password').attr 'value', ''
						$('#repassword').attr 'value', ''
						inputs.removeAttr 'disabled'
			else
				$('#password').attr 'value', ''
				$('#repassword').attr 'value', ''
				inputs.removeAttr 'disabled'
			
			return false
	
	## Faire une recherche de membre
	$('#search').live
		submit: ->
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
	
	## Enregistrer une action offline
	registerAction = (category, params) ->
		console.log "action: " + category + params

	## Action: maximiser/minimiser une saison
	$('.toggleSeason').live
		click: ->
			season = $(@).closest('.season')
			hidden = $(season).hasClass('hidden')
			$(season).toggleClass('hidden')
			$(season).find('.episode').slideToggle()
			
			if hidden
				$(@).attr 'src', '../img/arrow_down.gif'
			else
				$(@).attr 'src', '../img/arrow_right.gif'
			
			Fx.updateHeight()

	## Action: maximiser/minimiser une semaine (planning)
	$('.toggleWeek').live
		click: ->
			week = $(@).closest('.week')
			hidden = $(week).hasClass('hidden')
			$(week).toggleClass('hidden')
			$(week).find('.episode').slideToggle()
			
			if hidden
				$(@).attr 'src', '../img/arrow_down.gif'
			else
				$(@).attr 'src', '../img/arrow_right.gif'
			
			Fx.updateHeight()

	## Fonction: afficher un message
	message = (content) -> 
		$('#message .content').html content
		$('#message').slideDown()
		highlight $('#message')

	# Fonction: surligner un div
	highlight = (selector) ->
		bgColor = selector.css('background-color')
		selector.animate({backgroundColor: '#FAFA97'}, 500)
		selector.animate({backgroundColor: bgColor}, 500)	

	# START
	#window.BS = new Controller
	#BS.start()

	window.app = new App()
	app.init()
