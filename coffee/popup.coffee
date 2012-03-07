$(document).ready ->

	bgPage = chrome.extension.getBackgroundPage()
	
	$('*[title]').live
		mouseenter: ->
			title = $(this).attr 'title'
			$('#help').show()
			$('#help-text').html title
		mouseleave: ->
			$('#help').hide()
			$('#help-text').html ''
	
	## Marquer un ou des épisodes comme vu(s)
	$('.watched').live
		click: -> 
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest('.episode')
			season = e.attr 'season'
			episode = e.attr 'episode'
			global = e.attr 'global'
			nbrEpisodes = $('#' + show).find('.episode').length
			
			showCache = DB.get('shows')[show]
			episodesCache = DB.get 'episodes.' + show
			
			params = "&season=" + season + "&episode=" + episode
			enable_ratings = DB.get('options').enable_ratings
			
			cleanEpisode = (n) ->
				# on fait apparaitre les suivants
				$('#' + show + ' .episode:hidden:lt(' + n + ')').removeClass('hidden').slideToggle()
				episode = Content.episode e, s
				$('#' + show).append episode
				
				# TODO Mise à jour du remain
				
				# s'il n'y a plus d'épisodes à voir dans la série, on la cache
				if nbrEpisodes is 0
					$('#' + show).slideToggle()
				
				Fx.updateHeight()
			
			# On cache les div
			nextGlobal = $('#' + show).find('.episode').last().attr 'global'
			nextGlobal = parseInt(nextGlobal) + 1
			node = e
			while node.hasClass 'episode'
				# Notation d'un épisode
				if !enable_ratings
					# on enlève la possibilité de re-marquer comme vu (alors que c'est en cours)
					$(node).css 'background-color', '#f5f5f5'
					$(node).find('.watched').removeClass 'watched'
					
					# affichage des étoiles
					nodeRight = $(node).find '.right'
					content = ""
					for i in [1..5]
						content += '<img src="../img/star_off.gif" width="10" id="star' + i + '" class="star" title="' + i + ' /5" />'
					
					content += '<img src="../img/archive.png" width="10" class="close_stars" title="' + __('do_not_rate') + '" />'
					nodeRight.html content
					
					# Star HOVER
					$('.star').on
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
							nodeEpisode = $(this).parent().parent()
							if nodeEpisode.hasClass 'episode'
								nodeEpisode.slideToggle()
								nodeEpisode.removeClass 'episode'
							
								rate = $(this).attr('id').substring 4
								params += "&note=" + rate
								# On marque comme vu EN notant
								'''ajax.post "/members/watched/" + show, params, 
									-> 
										Fx.toRefresh 'membersEpisodes.all'
										bgPage.badge.update()
									->
										registerAction "/members/watched/" + show, params'''
								
								cleanEpisode 1
						
					# Close Stars HOVER
					$('.close_stars').on
						click: ->
							nodeEpisode = $(this).parent().parent()
							if nodeEpisode.hasClass 'episode'
								nodeEpisode.slideToggle()
								nodeEpisode.removeClass 'episode'
								
								# On marque comme vu SANS noter
								'''ajax.post "/members/watched/" + show, params, 
									->
										Fx.toRefresh 'membersEpisodes.all'
										bgPage.badge.update()
									->
										registerAction "/members/watched/" + show, params'''
								
								cleanEpisode 1
							
				else
					episodesCache[node.attr 'global'].seen = true
					node.slideToggle 'slow', -> $(this).remove()
					if episodesCache[nextGlobal]?
						episode = Content.episode episodesCache[nextGlobal], showCache
						$('#' + show).append episode
					else
						nbrEpisodes--
						
					# s'il n'y a plus d'épisodes à voir dans la série, on la cache
					$('#' + show).slideToggle() if nbrEpisodes is 0
					
				node = node.prev()
				nextGlobal++
			
			Fx.updateHeight()
					
			if enable_ratings
				# on marque comme vu SANS noter
				ajax.post "/members/watched/" + show, params, 
					->
						DB.set 'episodes.' + show, episodesCache
					-> 
						registerAction "/members/watched/" + show, params
		
		mouseenter: ->
			node = $(this).closest('.episode')
			while node.hasClass 'episode'
				node.find('.watched').css 'opacity', 1
				node = node.prev()
			
		mouseleave: ->
			node = $(this).closest('.episode')
			while node.hasClass 'episode'
				node.find('.watched').css 'opacity', 0.5
				node = node.prev()
	
	## Marquer un épisode comme téléchargé ou pas
	$('.downloaded').live
		click: ->
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest('.episode')
			season = e.attr 'season'
			episode = e.attr 'episode'
			global = e.attr 'global'
			
			# mise à jour du cache
			es = DB.get 'episodes.' + show
			downloaded = es[global].downloaded
			es[global].downloaded = !downloaded
			DB.set 'episodes.' + show, es
			
			# modification de l'icône
			if downloaded
				$(this).attr 'src', '../img/folder_off.png'
			else 
				$(this).attr 'src', '../img/folder.png'
			
			# envoi de la requête
			params = "&season=" + season + "&episode=" + episode
			ajax.post "/members/downloaded/" + show, params, null,
				-> registerAction "/members/downloaded/" + show, params
			
	## Accéder à la liste des commentaires d'un épisode
	$('.comments').live
		click: ->
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest('.episode')
			season = e.attr 'season'
			episode = e.attr 'episode'
			global = e.attr 'global'
			BS.load('commentsEpisode', show, season, episode, global)
	
	## Accéder à la fiche d'un épisode
	$('.num').live
		click: ->
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest('.episode')
			season = e.attr 'season'
			episode = e.attr 'episode'
			global = e.attr 'global'
			BS.load('showsEpisodes', show, season, episode, global)

		mouseenter: -> 
			$(this).css 'cursor', 'pointer'
			$(this).css 'color', '#900'
			
		mouseleave: -> 
			$(this).css 'cursor', 'auto'
			$(this).css 'color', '#1a4377'
	
	## Télécharger les sous-titres d'un épisode
	$('.subs').live
		click: -> Fx.openTab $(this).attr 'link'
	
	## Archiver une série
	$('.archive').live
		click: ->
			show = $(this).parent().parent().parent().attr 'id'
			
			# On efface la série tout de suite
			$('#' + show).slideUp()
			
			ajax.post "/shows/archive/" + show, "", 
				->
					Fx.toRefresh 'membersEpisodes.all'
					Fx.toRefresh 'membersInfos.' + DB.get 'member.login'
					bgPage.badge.update()
				-> registerAction "/shows/archive/" + show, ""
			
			Fx.updateHeight()
			return false
	
	## Sortir une série des archives
	$('.unarchive').live
		click: ->
			show = $(this).parent().attr 'id'
			
			# On ajoute la série tout de suite
			$('#' + show).hide()
			
			ajax.post "/shows/unarchive/" + show, "", 
				->
					Fx.toRefresh 'membersEpisodes.all'
					Fx.toRefresh 'membersInfos.' + DB.get 'member.login'
					bgPage.badge.update()
				-> registerAction "/shows/unarchive/" + show, ""
			
			Fx.updateHeight()
			return false
	
	## Ajoute à mes séries
	$('#showsAdd').live
		click: ->
			show = $(this).attr('href').substring 1
			
			# On ajoute la série tout de suite
			$('#showsAdd').html __('show_added')
			
			ajax.post "/shows/add/" + show, "", 
				->
					Fx.toRefresh 'membersEpisodes.all'
					Fx.toRefresh 'membersInfos.' + DB.get 'member.login'
					bgPage.badge.update()
				-> registerAction "/shows/add/" + show, ""
			
			return false
	
	## Retirer de mes séries
	$('#showsRemove').live
		click: ->
			show = $(this).attr('href').substring 1
			
			# On retire la série tout de suite
			$('#showsRemove').html __('show_removed')
			
			ajax.post "/shows/remove/" + show, "", 
				->
					Fx.toRefresh 'membersEpisodes.all'
					Fx.toRefresh 'membersInfos.' + DB.get 'member.login'
					bgPage.badge.update()
				-> registerAction "/shows/remove/" + show, ""
			
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
						DB.init()
						member = 
							login: login
							token: data.root.member.token
						DB.set 'member', member
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
	
	## Faire une recherche
	$('#search0').live
		submit: ->
			terms = $('#terms').val()
			#var inputs = $(this).find('input').attr {disabled: 'disabled'}
			
			params = "&title=" + terms
			ajax.post "/shows/search", params, 
				(data) ->
					content = '<div class="showtitle">' + __('shows') + '</div>'
					shows = data.root.shows
					if Object.keys(shows).length > 0
						for n of shows
							show = shows[n]
							content += '<div class="episode"><a href="#" onclick="BS.load(\'showsDisplay\', \'' + show.url + '\'); return false;" title="' + show.title + '">' + Fx.subFirst(show.title, 25) + '</a></div>'
					else
						content += '<div class="episode">' + __('no_shows_found') + '</div>'
					$('#shows-results').html content
					Fx.updateHeight()
				->
					#inputs.removeAttr 'disabled'
			
			params = "&login=" + terms
			ajax.post "/members/search", params, 
				(data) ->
					content = '<div class="showtitle">' + __('members') + '</div>'
					members = data.root.members
					if Object.keys(members).length > 0
						for n of members
							member = members[n]
							content += '<div class="episode"><a href="#" onclick="BS.load(\'membersInfos\', \'' + member.login + '\'); return false;">' + Fx.subFirst(member.login, 25) + '</a></div>'
					else
						content += '<div class="episode">' + __('no_members_found') + '</div>'
					$('#members-results').html content
					Fx.updateHeight()
				->
					#inputs.removeAttr 'disabled'
			
			return false
	
	## Enregistrer une action offline
	registerAction = (category, params) ->
		console.log "action: " + category + params
	
	## Ajouter un ami
	$('#addfriend').live
		click: ->
			login = $(this).attr 'login'
			ajax.post "/members/add/" + login, '', (data) ->
				$('#addfriend').text __('remove_to_friends', [login])
				$('#addfriend').attr 'href', '#removefriend'
				$('#addfriend').attr 'id', 'removefriend'
				$('#friendshipimg').attr 'src', '../img/friend_remove.png'
				Fx.toRefresh 'membersInfos.' + DB.get 'member.login'
				Fx.toRefresh 'membersInfos.' + login
				Fx.toRefresh 'timelineFriends'
			return false
	
	## Enlever un ami
	$('#removefriend').live
		click: ->
			login = $(this).attr 'login'
			ajax.post "/members/delete/" + login, '', (data) ->
				$('#removefriend').text __('add_to_friends', [login])
				$('#removefriend').attr 'href', '#addfriend'
				$('#removefriend').attr 'id', 'addfriend'
				$('#friendshipimg').attr 'src', '../img/friend_add.png'
				Fx.toRefresh 'membersInfos.' + DB.get 'member.login'
				Fx.toRefresh 'membersInfos.' + login
				Fx.toRefresh 'timelineFriends'
			return false
	
	## Maximiser/minimiser une série*/
	$('.toggleShow').live
		click: ->
			show = $(this).parent().parent().parent()
			showName = $(show).attr 'id'
			nbr_episodes_per_serie = DB.get 'options.nbr_episodes_per_serie'
			hidden_shows = DB.get 'hidden_shows'
			hiddenShow = showName in hidden_shows
			extra_episodes = DB.get 'extra_episodes'
			extraEpisodes = showName in extra_episodes
			nb_hiddens = $(show).find('div.episode.hidden').length
			nb_episodes = $(show).find('div.episode').length
			
			toggleEpisodes = $(show).find '.toggleEpisodes'		
			labelRemainText = if hiddenShow then __('hide_episodes') else __('show_episodes')
			imgSrc = if hiddenShow then '../img/uparrow.gif' else '../img/downarrow.gif'
			toggleEpisodes.find('.labelRemain').text labelRemainText
			toggleEpisodes.find('img').attr 'src', imgSrc
					
			if extraEpisodes
				if hiddenShow
					toggleEpisodes.find('.remain').text nb_hiddens
				else
					remain = parseInt toggleEpisodes.find('.remain').text()
					remain += parseInt nbr_episodes_per_serie
					toggleEpisodes.find('.remain').text remain
				
				$(show).find('.episode').slideToggle()
			else
				if hiddenShow
					if nb_hiddens is 0
						toggleEpisodes.hide()
					else
						toggleEpisodes.find('.labelRemain').text __('show_episodes')
						toggleEpisodes.find('.remain').text nb_hiddens
						toggleEpisodes.find('img').attr 'src', '../img/downarrow.gif'
				
				else
					if nb_hiddens is 0
						toggleEpisodes.find('.labelRemain').text __('show_episodes')
						toggleEpisodes.find('.remain').text nb_episodes
						toggleEpisodes.find('img').attr 'src', '../img/downarrow.gif'
						toggleEpisodes.find('.remain').text remain
						toggleEpisodes.show()
					else
						remain = parseInt toggleEpisodes.find('.remain').text()
						remain += parseInt nbr_episodes_per_serie
						toggleEpisodes.find('.remain').text remain
				
				$(show).find('.episode:lt(' + nbr_episodes_per_serie + ')').slideToggle()
			
			
			if !hiddenShow
				hidden_shows.push showName
				$(this).attr 'src', '../img/arrow_right.gif'
			else
				hidden_shows.splice (hidden_shows.indexOf showName), 1
				$(this).attr 'src', '../img/arrow_down.gif'
			
			DB.set 'hidden_shows', hidden_shows
			
			Fx.updateHeight()
			
	## HEADER links
	$('#logoLink')
		.click(-> Fx.openTab ajax.site_url, true)
		.attr 'title', __("logo")
	
	$('#versionLink')
		.click(-> Fx.openTab 'https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true)
		.attr 'title', __("version")
	
	## MENU actions
	$('#back').click ->
			historic = DB.get 'historic'
			if (length = historic.length) >= 2
				historic.pop()
				BS.back()
				DB.set 'historic', historic
				$(this).hide() if length is 2
			return false
		.attr 'title', __("back")
	
	$('#logout')
		.live 'click', -> 
			ajax.post "/members/destroy", '',
				->
					DB.removeAll()
					DB.init()
					bgPage.badge.init()
					BS.load('connection')
				->
					DB.removeAll()
					DB.init()
					bgPage.badge.init()
					BS.load('connection')
			return false
		.attr 'title', __("logout")
	
	$('#close')
		.click(-> window.close())
		.attr 'title', __('close')
	
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
		
	$('#trash')
		.click ->
			Cache.remove()
			$(this).hide()
		.attr 'title', __('trash')
		
	## Afficher le message de confirmation
	message = (content) -> $('#message').html content
	
	## INIT
	DB.init()
	$('#versionLink').text Fx.getVersion()
	if bgPage.connected()
		#Fx.cleanCache()
		badgeType = DB.get('badge').type
		BS.load(badgeType)
	else
		BS.load('connection')
