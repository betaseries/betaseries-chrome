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
					
					content += '<img src="../img/archive.png" width="10" class="close_stars" title="' + __('do_not_rate') + '" />'
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
					bgPage.Badge.updateCache()
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
	
	clean = (node) ->
		login = DB.get('session').login
		show = node.closest('.show').attr 'id'
		s = DB.get('member.' + login + '.shows')[show]
		es = DB.get 'show.' + show + '.episodes'
		
		# nombre d'épisodes affichés
		nbrEpisodes = $('#' + show).find('.episode').length
		
		# on sélectionne le dernier épisode et on calcule le nextGlobal
		nextGlobal = $('#' + show).find('.episode').last().attr 'global' # $('#' + show + '.episode').eq(nbrEpisodes - 1).attr 'global'
		nextGlobal = parseInt(nextGlobal) + 1
		
		# on fait disparaître l'actuel
		node.slideToggle 'slow', -> $(@).remove()
		
		# on fait apparaitre le suivant
		if es[nextGlobal]?
			episode = Content.episode es[nextGlobal], s
			$('#' + show).append episode
		else
			nbrEpisodes--
				
		# s'il n'y a plus d'épisodes à voir dans la série, on la cache
		nbr = parseInt($('#' + show + ' .remain').text()) - 1
		if nbrEpisodes is 0 and nbr <= 0
			$('#' + show).slideToggle 'slow', -> $(@).remove()
		else
			$('#' + show + ' .remain').text('+' + nbr) if nbr > 0
		
		Fx.updateHeight()
				
		return true
	
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
	
	## Télécharger les sous-titres d'un épisode
	$('.subs').live
		click: -> Fx.openTab $(this).attr 'link'
	
	## Archiver une série
	$('#showsArchive').live
		click: ->
			show = $(this).attr('href').substring 1

			$(this).find('span').toggleClass 'imgSyncOff imgSyncOn'
			
			ajax.post "/shows/archive/" + show, "", 
				=>
					Cache.force 'membersEpisodes.all'
					Cache.force 'membersInfos.' + DB.get('session').login
					bgPage.Badge.update()
					$(this).html '<span class="imgSyncOff"></span>' + __('show_unarchive')
					$(this).attr 'id', 'showsUnarchive'
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
			
			ajax.post "/shows/add/" + show, "", 
				=>
					Cache.force 'membersEpisodes.all'
					Cache.force 'membersInfos.' + DB.get('session').login
					bgPage.Badge.update()
					$(this).html '<span class="imgSyncOff"></span>' + __('show_remove')
					$(this).attr 'id', 'showsRemove'
				-> registerAction "/shows/add/" + show, ""
			
			return false
	
	## Retirer de mes séries
	$('#showsRemove').live
		click: ->
			show = $(this).attr('href').substring 1
			
			$(this).find('span').toggleClass 'imgSyncOff imgSyncOn'

			$('#showsArchive').slideUp();
			$('#showsUnarchive').slideUp();

			ajax.post "/shows/remove/" + show, "", 
				=>
					Cache.force 'membersEpisodes.all'
					Cache.force 'membersInfos.' + DB.get('session').login
					bgPage.Badge.update()
					$(this).html '<span class="imgSyncOff"></span>' + __('show_add')
					$(this).attr 'id', 'showsAdd'
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
					content = '<div class="showtitle">' + __('members') + '</div>'
					members = data.root.members
					if Object.keys(members).length > 0
						for n of members
							member = members[n]
							content += '<div class="episode"><a href="#" onclick="BS.load(\'membersInfos\', \'' + member.login + '\'); return false;">' + Fx.subFirst(member.login, 25) + '</a></div>'
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
					content = '<div class="showtitle">' + __('shows') + '</div>'
					shows = data.root.shows
					if Object.keys(shows).length > 0
						for n of shows
							show = shows[n]
							content += '<div class="episode"><a href="#" onclick="BS.load(\'showsDisplay\', \'' + show.url + '\'); return false;" title="' + show.title + '">' + Fx.subFirst(show.title, 25) + '</a></div>'
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
	
	## Ajouter un ami
	$('#addfriend').live
		click: ->
			login = $(this).attr 'login'
			ajax.post "/members/add/" + login, '', (data) ->
				$('#addfriend').text __('remove_to_friends', [login])
				$('#addfriend').attr 'href', '#removefriend'
				$('#addfriend').attr 'id', 'removefriend'
				$('#friendshipimg').attr 'src', '../img/friend_remove.png'
				Cache.force 'membersInfos.' + DB.get('session').login
				Cache.force 'membersInfos.' + login
				Cache.force 'timelineFriends'
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
				Cache.force 'membersInfos.' + DB.get('session').login
				Cache.force 'membersInfos.' + login
				Cache.force 'timelineFriends'
			return false
	
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
	$('#back').click ->
			historic = DB.get 'historic'
			if (length = historic.length) >= 2
				historic.pop()
				BS.back()
				DB.set 'historic', historic
				$(this).hide() if length is 2
			return false
		.attr 'title', __("back")
	
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
		
	# Réglage de la hauteur du popup
	Fx.updateHeight true
	
	# récupération du numéro de version
	Fx.checkVersion()
	
	if bgPage.connected()
		badgeType = DB.get('badge').type
		BS.load badgeType
	else
		BS.load 'connection'
