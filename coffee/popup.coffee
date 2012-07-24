$(document).ready ->

	bgPage = chrome.extension.getBackgroundPage()
	
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
	$('.membersEpisodes .watched').live
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
					nodeRight = $(e).find '.right'
					content = ""
					for i in [1..5]
						content += '<img src="../img/star_off.gif" width="10" id="star' + i + '" class="star" title="' + i + ' /5" />'
					
					content += '<img src="../img/close3.png" width="10" class="close_stars" title="' + __('do_not_rate') + '" />'
					nodeRight.html content
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
					Cache.force 'timelineFriends'
					badge_notification_type = DB.get('options').badge_notification_type
					bgPage.Badge.update() if badge_notification_type is 'watched'
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
	$('.showsEpisodes .watched').live
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
					Cache.force 'timelineFriends'
					badge_notification_type = DB.get('options').badge_notification_type
					bgPage.Badge.update() if badge_notification_type is 'watched'
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
	
	# Ouvrir la fiche d'une série
	$('#page')
		.on 'click', '.display_show', ->
			event.preventDefault()
			url = $(@).attr 'url'
			BS.load 'showsDisplay', url

	# Ouvrir la fiche d'un épisode
	$('#page')
		.on 'click', '.display_episode', ->
			event.preventDefault()
			url = $(@).attr 'url'
			season = $(@).attr 'season'
			episode = $(@).attr 'episode'
			global = $(@).attr 'global'
			BS.load 'showsEpisode', url, season, episode, global

	# Ouvrir la fiche d'un épisode
	$('#page')
		.on 'click', '.display_comments', ->
			event.preventDefault()
			url = $(@).attr 'url'
			season = $(@).attr 'season'
			episode = $(@).attr 'episode'
			global = $(@).attr 'global'
			BS.load 'commentsEpisode', url, season, episode, global

	# Ouvrir la fiche d'un membre
	$('#page')
		.on 'click', '.display_member', ->
			event.preventDefault()
			login = $(@).attr 'login'
			BS.load 'membersInfos', login

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
					Cache.force 'timelineFriends'
				->
					registerAction "/members/watched/" + show, params
		
	# Close Stars HOVER
	$('.close_stars').live
		click: ->
			e = $(this).closest '.episode'
			clean e
	
	## Marquer un épisode comme récupéré ou pas
	$('.membersEpisodes .downloaded').live
		click: ->
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
					bgPage.Badge.update() if badge_notification_type is 'downloaded'
				-> registerAction "/members/downloaded/" + show, params

			return false

	## Marquer un épisode comme récupéré ou pas
	$('.showsEpisode .downloaded').live
		click: ->
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
					badge_notification_type = DB.get('options').badge_notification_type
					bgPage.Badge.update() if badge_notification_type is 'downloaded'
					$(@).html '<span class="imgSyncOff"></span>' + __(dl)
				-> 
					registerAction "/members/downloaded/" + show, params

			return false
	
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
					Cache.force 'membersEpisodes.all'
					Cache.force 'membersInfos.' + DB.get('session').login
					bgPage.Badge.update()
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
					Cache.force 'membersEpisodes.all'
					Cache.force 'membersInfos.' + DB.get('session').login
					bgPage.Badge.update()
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
					Cache.force 'membersEpisodes.all'
					Cache.force 'membersInfos.' + DB.get('session').login
					bgPage.Badge.update()
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
					Cache.force 'membersEpisodes.all'
					Cache.force 'membersInfos.' + DB.get('session').login
					bgPage.Badge.update()
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
					Cache.force 'membersInfos.' + DB.get('session').login
					Cache.force 'membersInfos.' + login
					Cache.force 'timelineFriends'
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
					Cache.force 'membersInfos.' + DB.get('session').login
					Cache.force 'membersInfos.' + login
					Cache.force 'timelineFriends'
					$(this).html '<span class="imgSyncOff"></span>' + __('add_to_friends', [login])
					$(this).attr 'id', 'friendsAdd'
			return false

	## Se connecter
	$('#connect').live
		submit: ->
			login = $('#login').val()
			password = hex_md5 $('#password').val()
			inputs = $(this).find('input').attr {disabled: 'disabled'}
			params = "&login=" + login + "&password=" + password
			ajax.post "/members/auth", params, 
				(data) ->
					if data.root.member?
						message('')
						$('#connect').remove()
						token = data.root.member.token
						DB.set 'session', 
							login: login
							token: data.root.member.token
						menu.show()
						$('#back').hide()
						BS.load('membersEpisodes')
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
							BS.load('connection').display()
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
	$('#searchForMember').live
		submit: ->
			terms = $('#terms').val()
			#var inputs = $(this).find('input').attr {disabled: 'disabled'}
			
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
					$('#results').html content
					Fx.updateHeight()
				->
					#inputs.removeAttr 'disabled'
			
			return false
	
	## Faire une recherche de membre
	$('#searchForShow').live
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
					$('#results').html content
					Fx.updateHeight()
				->
					#inputs.removeAttr 'disabled'
			
			return false
	
	## Enregistrer une action offline
	registerAction = (category, params) ->
		console.log "action: " + category + params
	
	## Maximiser/minimiser une série*/
	$('.toggleShow').live
		click: ->
			show = $(this).closest('.show')
			showName = $(show).attr 'id'
			login = DB.get('session').login
			shows = DB.get 'member.' + login + '.shows'
			hidden = shows[showName].hidden
			shows[showName].hidden = !hidden
			DB.set 'member.' + login + '.shows', shows
				
			$(show).find('.episode').slideToggle()
			
			if shows[showName].hidden
				$(this).attr 'src', '../img/arrow_right.gif'
			else
				$(this).attr 'src', '../img/arrow_down.gif'
			
			Fx.updateHeight()

	## Maximiser/minimiser une saison*/
	$('.toggleSeason').live
		click: ->
			season = $(this).closest('.season')
			seasonName = $(season).attr 'id'
			hidden = $(season).hasClass('hidden')
			$(season).toggleClass('hidden')
			$(season).find('.episode').slideToggle()
			
			if hidden
				$(this).attr 'src', '../img/arrow_down.gif'
			else
				$(this).attr 'src', '../img/arrow_right.gif'
			
			Fx.updateHeight()
			
	## HEADER links
	$('#logoLink')
		.click(-> Fx.openTab ajax.site_url, true)
		.attr 'title', __("logo")
	
	$('#versionLink')
		.click(-> Fx.openTab 'https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true)
		.attr 'title', __("version")
	
	## MENU actions
	$('#page').on 'click', '.menu a', ->
		event.preventDefault()
		id = $(@).attr('id').substring 5
		if (id is 'options')
			Fx.openTab chrome.extension.getURL('../html/options.html'), true
		else if (id is 'logout')
			BS.logout()
		else
			BS.load id

	$('#back').click ->
			Historic.back()
			return false
		.attr 'title', __("back")
	
	$('#sync')
		.click(-> BS.refresh())
		.attr 'title', __('sync')
	
	$('#menu')
		.click ->
			if BS.currentView.id is 'menu'
				Historic.refresh()
			else
				BS.load('menu');
		.attr 'title', __('menu')
		
	$('#close')
		.click(-> window.close())
		.attr 'title', __('close')
	
	$('#trash')
		.click ->
			Cache.remove()
			$(this).hide()
		
	## Afficher le message de confirmation
	message = (content) -> $('#message').html content
	
	## INIT
	DB.init()
		
	# Réglage de la hauteur du popup
	Fx.updateHeight true
	
	# Récupération du numéro de version
	Fx.checkVersion()
	
	if bgPage.connected()
		badgeType = DB.get('badge').type
		BS.load badgeType
	else
		BS.load 'connection'
