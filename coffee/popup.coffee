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
	$('.MyEpisodes .watched').live
		click: -> 
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest('.episode')
			season = e.attr 'season'
			episode = e.attr 'episode'
			login = DB.get('session').login
			enable_ratings = DB.get('options').enable_ratings

			# Cache : mise à jour du dernier épisode marqué comme vu
			es = DB.get 'member.' + login + '.episodes'
			es[show].start = "" + (parseInt(e.attr 'global') + 1)
			
			# On cache les div
			nbr = 0
			while e.hasClass 'episode'
				nbr++
			
				if enable_ratings
					# on enlève la possibilité de re-marquer comme vu (alors que c'est en cours)
					$(e).css 'background-color', '#f5f5f5'
					$(e).find('.watched').removeClass 'watched'
					
					# affichage des étoiles
					$(e).find('.wrapper-comments').hide()
					$(e).find('.wrapper-recover').hide()
					$(e).find('.wrapper-subtitles').hide()
					$(e).find('.wrapper-rate').css 'display', 'inline-block'
				else
					clean e
				
				# sélection de l'épisode précédent	
				e = e.prev()
			
			# Cache : mise à jour du nbr d'épisodes restants
			es[show].nbr_total -= nbr
			if es[show].nbr_total is 0
				delete es[show]
			
			# Requête
			params = "&season=" + season + "&episode=" + episode
			ajax.post "/members/watched/" + show, params, 
				->
					DB.set 'member.' + login + '.episodes', es
					Cache.force 'MemberTimeline'
					badge_notification_type = DB.get('options').badge_notification_type
					if badge_notification_type is 'watched'
						total_episodes = DB.get('badge').total_episodes
						Badge.set 'total_episodes', total_episodes - nbr
				-> 
					registerAction "/members/watched/" + show, params
			
		mouseenter: ->
			e = $(this).closest('.episode')
			while e.hasClass 'episode'
				e.find('.watched').css 'opacity', 1
				e = e.prev()
			
		mouseleave: ->
			e = $(this).closest('.episode')
			while e.hasClass 'episode'
				e.find('.watched').css 'opacity', 0.5
				e = e.prev()

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
		
	clean = (node) ->
		show = node.closest('.show')
		
		# on fait disparaître la ligne de l'épisode
		node.slideToggle 'slow', -> $(@).remove()

		# s'il n'y a plus d'épisodes à voir dans la série, on la cache
		nbr = parseInt($(show).find('.remain').text()) - 1
		if nbr is 0
			$(show).slideToggle 'slow', -> $(@).remove()
		else
			$(show).find('.remain').text nbr

		# afficher les épisodes cachés
		nbr_episodes_per_serie = DB.get('options').nbr_episodes_per_serie
		if nbr + 1 > nbr_episodes_per_serie
			global = parseInt($(show).find('.episode').last().attr('global')) + 1
			login = DB.get('session').login
			showName = $(show).attr 'id'
			s = DB.get('member.' + login + '.shows')[showName]
			es = DB.get 'show.' + showName + '.episodes'
			episode = Content.episode es[global], s
			$(show).append episode

		Fx.updateHeight()
		
		return true
	
	# Copier le contenu du titre du lien
	$('#page').on 'click', '.copy_episode', ->
		event.preventDefault()
		sanbox = $(@).find('textarea')
		sanbox.show()
		sanbox.select()
		document.execCommand('copy')
		sanbox.hide()
		message __('copied_to_clipboard')
		$(@).focus()

	# Ouvrir la fiche d'une série
	$('#page').on 'click', '.display_show', ->
		event.preventDefault()
		url = $(@).attr 'url'
		BS.load 'Show', url

	# Ouvrir la fiche d'un épisode
	$('#page').on 'click', '.display_episode', ->
		event.preventDefault()
		url = $(@).attr 'url'
		season = $(@).attr 'season'
		episode = $(@).attr 'episode'
		global = $(@).attr 'global'
		BS.load 'Episode', url, season, episode, global

	# Ouvrir la fiche des épisodes d'une série
	$('#page').on 'click', '.display_episodes', ->
		event.preventDefault()
		url = $(@).attr 'url'
		BS.load 'ShowEpisodes', url

	# Ouvrir la fiche d'un épisode
	$('#page').on 'click', '.display_comments', ->
		event.preventDefault()
		url = $(@).attr 'url'
		season = $(@).attr 'season'
		episode = $(@).attr 'episode'
		global = $(@).attr 'global'
		BS.load 'EpisodeComments', url, season, episode, global

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

	# Episode HOVER
	$('.episode').live
		mouseenter: ->
			$(@).find('.watched').attr('src', '../img/arrow_right.png').css('opacity', 0.5)
		mouseleave: ->
			start = parseInt $(this).closest('.show').attr 'start'
			e = $(this).closest('.episode')

			if (e.attr('global') < start)
				e.find('.watched').attr('src', '../img/tick.png').css('opacity', 0.5)
			else
				e.find('.watched').attr('src', '../img/empty.png')
		
	# Star HOVER
	$('.star').live
		mouseenter: ->
			nodeStar = $(this)
			while nodeStar.hasClass 'star'
				nodeStar.attr 'src', '../img/star.gif'
				nodeStar = nodeStar.prev()
		mouseleave: ->
			nodeStar = $(this)
			while nodeStar.hasClass 'star'
				nodeStar.attr 'src', '../img/star_off.gif'
				nodeStar = nodeStar.prev()
		click: ->
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest '.episode'
			clean e
			
			# On marque comme vu EN notant
			season = e.attr 'season'
			episode = e.attr 'episode'
			rate = $(this).attr('id').substring 4
			params = "&season=" + season + "&episode=" + episode + "&note=" + rate
			ajax.post "/members/note/" + show, params, 
				-> 
					Cache.force 'MemberTimeline'
				->
					registerAction "/members/watched/" + show, params
		
	# Close Stars HOVER
	$('.close_stars').live
		click: ->
			e = $(this).closest '.episode'
			clean e
	
	## Marquer un épisode comme récupéré ou pas
	$('.MyEpisodes .downloaded').live 'click', ->
		event.preventDefault()
		
		s = $(this).closest('.show')
		show = s.attr 'id'
		e = $(this).closest('.episode')
		season = e.attr 'season'
		episode = e.attr 'episode'
		global = e.attr 'global'
		
		# mise à jour du cache
		es = DB.get 'show.' + show + '.episodes'
		downloaded = es[global].downloaded
		es[global].downloaded = !downloaded
		DB.set 'show.' + show + '.episodes', es
		
		# modification de l'icône
		if downloaded
			$(this).attr 'src', '../img/folder_off.png'
		else 
			$(this).attr 'src', '../img/folder.png'
		
		# envoi de la requête
		params = "&season=" + season + "&episode=" + episode
		ajax.post "/members/downloaded/" + show, params, 
			-> 
				badge_notification_type = DB.get('options').badge_notification_type
				if badge_notification_type is 'downloaded'
					downloaded_episodes = DB.get('badge').downloaded_episodes
					if es[global].downloaded
						downloaded_episodes--
					else
						downloaded_episodes++
					Badge.set 'downloaded_episodes', downloaded_episodes
			-> registerAction "/members/downloaded/" + show, params

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

	## Télécharger les sous-titres d'un épisode
	$('.subs').live
		click: -> 
			Fx.openTab $(this).attr 'link'
			return false
	
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

	## Poster un commentaire (série)
	$('#postComment').live
		submit: ->
			show = $('#postComment input[id=show]').val()
			season = $('#postComment input[id=season]').val()
			episode = $('#postComment input[id=episode]').val()
			text = $('#postComment textarea').val()
			in_reply_to = $('#postComment input[id=inReplyTo]').val()

			if text isnt ''
				$('#postComment input[type=submit]').val 'Patientez..'
				$('#postComment input[type=submit]').prop 'disabled', true

				params = '&show=' + show + '&season=' + season + '&episode=' + episode + '&text=' + text
				params += '&in_reply_to=' + in_reply_to if in_reply_to isnt '0'
				ajax.post "/comments/post/episode", params, 
					(data) ->
						$('#postComment textarea').val ''
						$('#postComment input[id=inReplyTo]').val 0
						$('#postComment input[type=submit]').val 'Poster'
						$('#postComment input[type=submit]').prop 'disabled', false
						$('#postComment #inReplyToText').hide()
						time = date('D d F')
						day = date('D').toLowerCase()
						hour = date('H:i')
						login = DB.get('session').login
						num = data.comment.id
						showtitle = if time is $('.showtitle').last().text() then '' else '<div class="showtitle">' + time + '</div>' 
						
						output = '<div class="newComment" style="display:none;">'
						output += 	showtitle
						output += 	'<div class="event ' + day + '">'
						output += 		'<b>' + hour + '</b> '
						output += 		'<span class="login">' + login + '</span> '
						output += 		'<small>#' + num + '</small> '
						output += 		'<small>en réponse à #' + in_reply_to + '</small> ' if in_reply_to isnt '0'
						output += 		'<a href="" id="addInReplyTo" commentId="' + num + '">répondre</a><br />'
						output += 		text
						output += 	'</div>'
						output += '</div>'

						$('.postComment').before output
						$('.newComment').slideDown('slow')
					->
						#inputs.removeAttr 'disabled'

			return false

	## Ajouter un destinataire au commentaire
	$('#addInReplyTo').live
		click: ->
			commentId = $(this).attr('commentId');
			$('#postComment input[id=inReplyTo]').val commentId
			$('#postComment #inReplyToText').show()
			$('#postComment #inReplyToId').text commentId
			return false

	## Retirer le destinataire d'un commentaire
	$('#removeInReplyTo').live
		click: ->
			$('#postComment input[id=inReplyTo]').val 0
			$('#postComment #inReplyToText').hide()
			return false
	
	## Enregistrer une action offline
	registerAction = (category, params) ->
		console.log "action: " + category + params
	
	## Maximiser/minimiser une série*/
	$('.toggleShow').live
		click: ->
			show = $(@).closest('.show')
			showName = $(show).attr 'id'
			login = DB.get('session').login
			shows = DB.get 'member.' + login + '.shows'
			hidden = shows[showName].hidden
			shows[showName].hidden = !hidden
			DB.set 'member.' + login + '.shows', shows
				
			$(show).find('.episode').slideToggle()
			
			if shows[showName].hidden
				$(@).attr 'src', '../img/arrow_right.gif'
			else
				$(@).attr 'src', '../img/arrow_down.gif'
			
			Fx.updateHeight()

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

	app = new App()
	app.init()
